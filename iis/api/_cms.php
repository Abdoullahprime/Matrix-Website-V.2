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
    // Detail pages for the products on the Solutions page (written in the admin area).
    $db->query(
        "CREATE TABLE IF NOT EXISTS solution_pages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(160) NOT NULL UNIQUE,
            product VARCHAR(200) NOT NULL DEFAULT '',
            title VARCHAR(200) NOT NULL,
            excerpt VARCHAR(400) NOT NULL DEFAULT '',
            cover_media_id INT NULL,
            cover_alt VARCHAR(300) NOT NULL DEFAULT '',
            highlights TEXT NOT NULL,
            blocks LONGTEXT NOT NULL,
            search_text LONGTEXT NOT NULL,
            status VARCHAR(10) NOT NULL DEFAULT 'draft',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
    // The font of a page's main title (added after the first release, so existing tables get it too).
    foreach (['posts', 'solution_pages'] as $t) {
        $has = $db->query("SHOW COLUMNS FROM $t LIKE 'title_font'")->num_rows > 0;
        if (!$has) {
            $db->query("ALTER TABLE $t ADD COLUMN title_font VARCHAR(12) NOT NULL DEFAULT 'sans'");
        }
    }
    // Other products that should open the same page (for example Payroll opening the integrated HR page).
    if ($db->query("SHOW COLUMNS FROM solution_pages LIKE 'also_products'")->num_rows === 0) {
        $db->query("ALTER TABLE solution_pages ADD COLUMN also_products TEXT NULL");
    }
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

function mx_unique_slug(mysqli $db, string $wanted, int $excludeId, string $table = 'posts'): string
{
    $base = mx_slugify($wanted);
    if ($base === '') {
        $base = 'post';
    }
    if (!in_array($table, ['posts', 'solution_pages'], true)) {
        throw new InvalidArgumentException('table');
    }
    // These addresses already belong to the fixed solution pages.
    $reserved = ['hr-payroll-software-gambia', 'accounting-software-gambia', 'core-banking-microfinance-software-gambia', 'it-infrastructure-cyber-security-gambia'];
    $slug = $base;
    for ($i = 2; $i < 200; $i++) {
        $stmt = $db->prepare("SELECT COUNT(*) FROM $table WHERE slug = ? AND id <> ?");
        $stmt->bind_param('si', $slug, $excludeId);
        $stmt->execute();
        $stmt->bind_result($n);
        $stmt->fetch();
        $stmt->close();
        if ((int)$n === 0 && !($table === 'solution_pages' && in_array($slug, $reserved, true))) {
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
                $level = (int)($b['level'] ?? 2);
                $level = in_array($level, [1, 2, 3], true) ? $level : 2;
                $hl = mx_text($b['highlight'] ?? '', 100);
                if ($hl !== '' && (function_exists('mb_stripos') ? mb_stripos($text, $hl) : stripos($text, $hl)) === false) {
                    $hl = ''; // the highlighted words must appear in the title
                }
                $clean[] = [
                    'type' => 'heading', 'text' => $text, 'level' => $level,
                    'font' => mx_choice($b['font'] ?? '', ['sans', 'serif', 'handwritten'], 'sans'),
                    'align' => mx_choice($b['align'] ?? '', ['left', 'center', 'right'], 'left'),
                    'highlight' => $hl,
                ];
                $search[] = $text;
                break;
            case 'paragraph':
                $text = mx_text($b['text'] ?? '', 6000);
                if ($text === '') {
                    continue 2;
                }
                $clean[] = ['type' => 'paragraph', 'text' => $text, 'align' => mx_choice($b['align'] ?? '', ['left', 'center', 'right'], 'left')];
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
                $clean[] = [
                    'type' => 'video', 'youtubeId' => $vid, 'caption' => $caption,
                    'size' => mx_choice($b['size'] ?? '', ['small', 'normal', 'wide'], 'wide'),
                ];
                $search[] = $caption;
                break;
            case 'buttons':
                $items = mx_clean_buttons($b['items'] ?? [], $n);
                if (count($items) === 0) {
                    continue 2;
                }
                $clean[] = ['type' => 'buttons', 'items' => $items, 'align' => mx_choice($b['align'] ?? '', ['left', 'center', 'right'], 'center')];
                $search[] = implode(' ', array_column($items, 'label'));
                break;
            case 'split':
                // Text beside a picture or a YouTube video, either way round.
                $heading = mx_text($b['heading'] ?? '', 200);
                $text = mx_text($b['text'] ?? '', 4000);
                $video = null;
                if (trim((string)($b['video'] ?? '')) !== '') {
                    $video = mx_youtube_id((string)$b['video']);
                    if ($video === null) {
                        mx_json(400, ['error' => "Block $n: paste a YouTube link, or clear the video box."]);
                    }
                }
                $mid = (int)($b['mediaId'] ?? 0);
                if ($video === null) {
                    if ($mid <= 0 || !mx_media_exists($db, $mid)) {
                        mx_json(400, ['error' => "Block $n: choose a picture (or paste a YouTube link)."]);
                    }
                }
                if ($heading === '' && $text === '' && !array_filter((array)($b['items'] ?? []), 'is_string')) {
                    mx_json(400, ['error' => "Block $n: add some text next to the picture."]);
                }
                $alt = mx_text($b['alt'] ?? '', 300);
                $listItems = [];
                foreach ((is_array($b['items'] ?? null) ? $b['items'] : []) as $it) {
                    $t = mx_text($it, 400);
                    if ($t !== '') {
                        $listItems[] = $t;
                    }
                }
                $listItems = array_slice($listItems, 0, 20);
                $clean[] = [
                    'type' => 'split', 'side' => ($b['side'] ?? '') === 'right' ? 'right' : 'left',
                    'heading' => $heading, 'text' => $text, 'items' => $listItems, 'ordered' => !empty($b['ordered']),
                    'mediaId' => $video === null ? $mid : 0,
                    'youtubeId' => $video ?? '', 'alt' => $alt,
                    'font' => mx_choice($b['font'] ?? '', ['sans', 'serif', 'handwritten'], 'sans'),
                    'buttons' => mx_clean_buttons($b['buttons'] ?? [], $n),
                ];
                $search[] = $heading . ' ' . $text . ' ' . $alt . ' ' . implode(' ', $listItems);
                break;
            default:
                mx_json(400, ['error' => "Block $n has an unknown type."]);
        }
    }
    return [$clean, trim(preg_replace('/\s+/', ' ', implode(' ', $search)) ?? '')];
}

/** $v if it is one of $allowed, else $default. */
function mx_choice(mixed $v, array $allowed, string $default): string
{
    return is_string($v) && in_array($v, $allowed, true) ? $v : $default;
}

/**
 * Up to two buttons. A link may be a path on this site ("/contact") or a full https address.
 * Anything else (javascript:, data:, //other-site) is refused.
 */
function mx_clean_buttons(mixed $items, int $blockNo): array
{
    $out = [];
    foreach (array_slice(is_array($items) ? array_values($items) : [], 0, 2) as $it) {
        if (!is_array($it)) {
            continue;
        }
        $label = mx_text($it['label'] ?? '', 40);
        $url = trim((string)($it['url'] ?? ''));
        if ($label === '' && $url === '') {
            continue;
        }
        $ok = preg_match('/^\/(?!\/)[A-Za-z0-9._~%\/?#&=:@+,;-]*$/', $url) === 1
            || (preg_match('~^https://[^\s<>"]+$~i', $url) === 1 && filter_var($url, FILTER_VALIDATE_URL) !== false);
        if ($label === '' || !$ok || strlen($url) > 500) {
            mx_json(400, ['error' => "Block $blockNo: each button needs a label and a link that starts with / or https://"]);
        }
        $out[] = [
            'label' => $label,
            'url' => $url,
            'style' => ($it['style'] ?? '') === 'secondary' ? 'secondary' : 'primary',
        ];
    }
    return $out;
}

function mx_media_url(?int $id): ?string
{
    return $id ? '/api/media.php?id=' . $id : null;
}

/** Add the picture address to image blocks before they are sent to the site. */
function mx_decorate_blocks(array $blocks): array
{
    foreach ($blocks as &$b) {
        if (($b['type'] ?? '') === 'image' || (($b['type'] ?? '') === 'split' && (int)($b['mediaId'] ?? 0) > 0)) {
            $b['url'] = mx_media_url((int)$b['mediaId']);
        }
    }
    return $blocks;
}

/** Highlights are stored as JSON; always return a clean list of strings. */
/** Product names a page also opens from, as a clean list of strings. */
function mx_decode_also(?string $raw): array
{
    $d = $raw !== null && $raw !== '' ? json_decode($raw, true) : [];
    return is_array($d) ? array_values(array_filter($d, 'is_string')) : [];
}

function mx_decode_highlights(string $raw): array
{
    $d = json_decode($raw, true);
    return is_array($d) ? array_values(array_filter($d, 'is_string')) : [];
}

// ---------------------------------------------------------------------------------------
// Helpers for pages that fill the site's index.html with their own head (post.php, solution.php)
// ---------------------------------------------------------------------------------------

function mx_esc(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Same rule as seoTitle() in src/lib/blog.ts: keep the whole title near 60 characters. */
function mx_seo_title(string $title): string
{
    $suffix = ' | Matrix Solutions';
    if (mx_len($title . $suffix) <= 62) {
        return $title . $suffix;
    }
    if (mx_len($title) <= 62) {
        return $title;
    }
    $cut = function_exists('mb_substr') ? mb_substr($title, 0, 59, 'UTF-8') : substr($title, 0, 59);
    return rtrim($cut, " ,.;:-") . '…';
}

/** Replace the first match of a tag pattern with $new (no-op if it is not there). */
function mx_swap(string $html, string $pattern, string $new): string
{
    return preg_replace($pattern, str_replace(['\\', '$'], ['\\\\', '\\$'], $new), $html, 1) ?? $html;
}
