<?php
declare(strict_types=1);

// Shared code for the blog and the admin area: database tables, login sessions, and the
// validation of a post's content blocks. Not an endpoint: requesting it directly returns 404.
require_once __DIR__ . '/_lib.php';

if (basename((string)($_SERVER['SCRIPT_FILENAME'] ?? '')) === '_cms.php') {
    http_response_code(404);
    exit;
}

const MX_MAX_BLOCKS = 100;
const MX_MAX_IMAGE_BYTES = 3 * 1024 * 1024;

// ---------------------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------------------

function mx_cms_schema(mysqli $db): void
{
    static $done = false;
    if ($done) {
        return;
    }
    // All dates (publish times, login attempts) are kept in UTC, whatever the server's clock zone.
    $db->query("SET time_zone = '+00:00'");
    $db->query(
        'CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(60) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
    $db->query(
        'CREATE TABLE IF NOT EXISTS admin_login_attempts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip VARCHAR(45) NOT NULL,
            username VARCHAR(60) NOT NULL,
            success TINYINT NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_ip_time (ip, created_at),
            INDEX idx_user_time (username, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
    // Images live in the database, so the site needs no writable upload folder.
    $db->query(
        'CREATE TABLE IF NOT EXISTS media (
            id INT AUTO_INCREMENT PRIMARY KEY,
            mime VARCHAR(40) NOT NULL,
            width INT NOT NULL,
            height INT NOT NULL,
            bytes INT NOT NULL,
            sha1 CHAR(40) NOT NULL,
            data LONGBLOB NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_sha1 (sha1)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
    $db->query(
        "CREATE TABLE IF NOT EXISTS posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(160) NOT NULL UNIQUE,
            title VARCHAR(200) NOT NULL,
            excerpt VARCHAR(400) NOT NULL DEFAULT '',
            category VARCHAR(60) NOT NULL DEFAULT '',
            cover_media_id INT NULL,
            cover_alt VARCHAR(300) NOT NULL DEFAULT '',
            highlights TEXT NOT NULL,
            blocks LONGTEXT NOT NULL,
            search_text LONGTEXT NOT NULL,
            status VARCHAR(10) NOT NULL DEFAULT 'draft',
            published_at DATETIME NULL,
            author VARCHAR(80) NOT NULL DEFAULT '',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_status_pub (status, published_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
    $done = true;
}

// ---------------------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------------------

/** The JSON body of a POST (empty array for a GET). Rejects anything that is not JSON. */
function mx_read_json(int $maxBytes = 262144): array
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        return [];
    }
    $type = strtolower((string)($_SERVER['CONTENT_TYPE'] ?? ''));
    if (!str_starts_with($type, 'application/json')) {
        mx_json(415, ['error' => 'Send JSON.']);
    }
    $raw = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
    if ($raw === false || strlen($raw) > $maxBytes) {
        mx_json(413, ['error' => 'Request too large.']);
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        mx_json(400, ['error' => 'Invalid request.']);
    }
    return $data;
}

function mx_client_ip(): string
{
    return substr((string)($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45);
}

function mx_is_https(): bool
{
    $h = strtolower((string)($_SERVER['HTTPS'] ?? ''));
    return $h !== '' && $h !== 'off';
}

// ---------------------------------------------------------------------------------------
// Login sessions
// ---------------------------------------------------------------------------------------

function mx_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    // Some hosts leave PHP's default session folder unwritable; fall back to the temp folder.
    $dir = session_save_path();
    if ($dir === '' || !is_dir($dir) || !is_writable($dir)) {
        session_save_path(sys_get_temp_dir());
    }
    session_name('mxs');
    session_set_cookie_params([
        'lifetime' => 0,            // ends when the browser closes
        'path' => '/',
        'secure' => mx_is_https(),
        'httponly' => true,         // not readable by page scripts
        'samesite' => 'Strict',     // not sent on requests started by other sites
    ]);
    @session_start();
}

/** The logged-in administrator, or null. */
function mx_current_admin(mysqli $db): ?array
{
    mx_session_start();
    $id = (int)($_SESSION['uid'] ?? 0);
    if ($id <= 0) {
        return null;
    }
    $stmt = $db->prepare('SELECT id, username FROM admin_users WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    return $row ?: null;
}

/**
 * Every admin action goes through here: a valid login, and (for changes) the secret token that
 * only the admin pages know, plus a check that the request came from this same site.
 */
function mx_require_admin(mysqli $db, bool $isChange): array
{
    $admin = mx_current_admin($db);
    if ($admin === null) {
        mx_json(401, ['error' => 'Please sign in.']);
    }
    if ($isChange) {
        $sent = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
        $have = (string)($_SESSION['csrf'] ?? '');
        if ($have === '' || !hash_equals($have, $sent)) {
            mx_json(403, ['error' => 'Your session expired. Please reload the page.']);
        }
        $origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
        if ($origin !== '') {
            $host = (string)parse_url($origin, PHP_URL_HOST) . ((($p = parse_url($origin, PHP_URL_PORT)) !== null) ? ':' . $p : '');
            if (strcasecmp($host, (string)($_SERVER['HTTP_HOST'] ?? '')) !== 0) {
                mx_json(403, ['error' => 'Request refused.']);
            }
        }
    }
    return $admin;
}

// ---------------------------------------------------------------------------------------
// Text and blocks
// ---------------------------------------------------------------------------------------

function mx_len(string $s): int
{
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}

/** Trimmed plain text: no control characters, line breaks normalised, capped at $max characters. */
function mx_text(mixed $v, int $max): string
{
    if (!is_string($v)) {
        return '';
    }
    $v = preg_replace('/[^\P{C}\n\t]+/u', '', str_replace(["\r\n", "\r"], "\n", $v)) ?? '';
    $v = trim($v);
    return mx_len($v) > $max ? (function_exists('mb_substr') ? mb_substr($v, 0, $max, 'UTF-8') : substr($v, 0, $max)) : $v;
}

function mx_slugify(string $text): string
{
    $t = $text;
    if (function_exists('iconv')) {
        $x = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $t);
        if (is_string($x) && $x !== '') {
            $t = $x;
        }
    }
    $t = strtolower(preg_replace('/[^A-Za-z0-9]+/', '-', $t) ?? '');
    $t = trim($t, '-');
    return substr($t, 0, 120);
}

function mx_unique_slug(mysqli $db, string $wanted, int $excludeId): string
{
    $base = mx_slugify($wanted);
    if ($base === '') {
        $base = 'post';
    }
    $slug = $base;
    for ($i = 2; $i < 200; $i++) {
        $stmt = $db->prepare('SELECT COUNT(*) FROM posts WHERE slug = ? AND id <> ?');
        $stmt->bind_param('si', $slug, $excludeId);
        $stmt->execute();
        $stmt->bind_result($n);
        $stmt->fetch();
        $stmt->close();
        if ((int)$n === 0) {
            return $slug;
        }
        $slug = $base . '-' . $i;
    }
    return $base . '-' . bin2hex(random_bytes(3));
}

/** The 11-character YouTube id from any usual YouTube address, or null. */
function mx_youtube_id(string $url): ?string
{
    if (preg_match('~(?:youtube\.com/(?:watch\?(?:.*&)?v=|embed/|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})~', $url, $m) === 1) {
        return $m[1];
    }
    return null;
}

function mx_media_exists(mysqli $db, int $id): bool
{
    $stmt = $db->prepare('SELECT COUNT(*) FROM media WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->bind_result($n);
    $stmt->fetch();
    $stmt->close();
    return (int)$n > 0;
}

/**
 * Check and clean the blocks an editor sent. Blocks hold plain text only, never HTML, and the
 * site shows them as text, so nothing an editor types can run as code.
 * Returns [cleanBlocks, searchableText].
 */
function mx_clean_blocks(mysqli $db, mixed $blocks): array
{
    if (!is_array($blocks)) {
        mx_json(400, ['error' => 'The post content is invalid.']);
    }
    if (count($blocks) > MX_MAX_BLOCKS) {
        mx_json(400, ['error' => 'A post can have at most ' . MX_MAX_BLOCKS . ' blocks.']);
    }
    $clean = [];
    $search = [];
    foreach (array_values($blocks) as $i => $b) {
        $n = $i + 1;
        if (!is_array($b)) {
            mx_json(400, ['error' => "Block $n is invalid."]);
        }
        switch ($b['type'] ?? '') {
            case 'heading':
                $text = mx_text($b['text'] ?? '', 200);
                if ($text === '') {
                    continue 2;
                }
                $level = ((int)($b['level'] ?? 2)) === 3 ? 3 : 2;
                $clean[] = ['type' => 'heading', 'text' => $text, 'level' => $level];
                $search[] = $text;
                break;
            case 'paragraph':
                $text = mx_text($b['text'] ?? '', 6000);
                if ($text === '') {
                    continue 2;
                }
                $clean[] = ['type' => 'paragraph', 'text' => $text];
                $search[] = $text;
                break;
            case 'image':
                $id = (int)($b['mediaId'] ?? 0);
                if ($id <= 0 || !mx_media_exists($db, $id)) {
                    mx_json(400, ['error' => "Block $n: choose an image."]);
                }
                $size = in_array($b['size'] ?? '', ['small', 'normal', 'wide'], true) ? $b['size'] : 'normal';
                $alt = mx_text($b['alt'] ?? '', 300);
                $caption = mx_text($b['caption'] ?? '', 300);
                $clean[] = ['type' => 'image', 'mediaId' => $id, 'size' => $size, 'alt' => $alt, 'caption' => $caption];
                $search[] = $caption . ' ' . $alt;
                break;
            case 'list':
                $items = [];
                foreach ((is_array($b['items'] ?? null) ? $b['items'] : []) as $it) {
                    $t = mx_text($it, 400);
                    if ($t !== '') {
                        $items[] = $t;
                    }
                }
                if (count($items) === 0) {
                    continue 2;
                }
                $clean[] = ['type' => 'list', 'ordered' => !empty($b['ordered']), 'items' => array_slice($items, 0, 40)];
                $search[] = implode(' ', $items);
                break;
            case 'quote':
                $text = mx_text($b['text'] ?? '', 1200);
                if ($text === '') {
                    continue 2;
                }
                $cite = mx_text($b['cite'] ?? '', 200);
                $clean[] = ['type' => 'quote', 'text' => $text, 'cite' => $cite];
                $search[] = $text . ' ' . $cite;
                break;
            case 'video':
                $vid = mx_youtube_id((string)($b['url'] ?? ''));
                if ($vid === null) {
                    mx_json(400, ['error' => "Block $n: paste a YouTube link."]);
                }
                $caption = mx_text($b['caption'] ?? '', 300);
                $clean[] = ['type' => 'video', 'youtubeId' => $vid, 'caption' => $caption];
                $search[] = $caption;
                break;
            default:
                mx_json(400, ['error' => "Block $n has an unknown type."]);
        }
    }
    return [$clean, trim(preg_replace('/\s+/', ' ', implode(' ', $search)) ?? '')];
}

function mx_media_url(?int $id): ?string
{
    return $id ? '/api/media.php?id=' . $id : null;
}

/** Add the picture address to image blocks before they are sent to the site. */
function mx_decorate_blocks(array $blocks): array
{
    foreach ($blocks as &$b) {
        if (($b['type'] ?? '') === 'image') {
            $b['url'] = mx_media_url((int)$b['mediaId']);
        }
    }
    return $blocks;
}

/** Highlights are stored as JSON; always return a clean list of strings. */
function mx_decode_highlights(string $raw): array
{
    $d = json_decode($raw, true);
    return is_array($d) ? array_values(array_filter($d, 'is_string')) : [];
}
