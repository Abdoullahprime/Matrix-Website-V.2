<?php
declare(strict_types=1);

// Admin post management. POST JSON {action: list | get | save | delete | publish, ...}
require dirname(__DIR__) . '/_cms.php';

header('Cache-Control: no-store');
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    mx_json(405, ['error' => 'Method not allowed.']);
}

try {
    $db = mx_db();
    mx_cms_schema($db);
    $body = mx_read_json(400000);
    $action = (string)($body['action'] ?? '');
    $admin = mx_require_admin($db, $action !== 'list' && $action !== 'get');

    if ($action === 'list') {
        $rows = $db->query(
            'SELECT id, slug, title, category, status, published_at, updated_at, cover_media_id
             FROM posts ORDER BY updated_at DESC, id DESC LIMIT 500'
        )->fetch_all(MYSQLI_ASSOC);
        mx_json(200, ['posts' => $rows]);
    }

    if ($action === 'get') {
        $id = (int)($body['id'] ?? 0);
        $stmt = $db->prepare('SELECT * FROM posts WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $p = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$p) {
            mx_json(404, ['error' => 'Post not found.']);
        }
        mx_json(200, ['post' => [
            'id' => (int)$p['id'],
            'slug' => $p['slug'],
            'title' => $p['title'],
            'titleFont' => $p['title_font'],
            'excerpt' => $p['excerpt'],
            'category' => $p['category'],
            'coverMediaId' => $p['cover_media_id'] !== null ? (int)$p['cover_media_id'] : null,
            'coverUrl' => mx_media_url($p['cover_media_id'] !== null ? (int)$p['cover_media_id'] : null),
            'coverAlt' => $p['cover_alt'],
            'highlights' => mx_decode_highlights($p['highlights']),
            'blocks' => mx_decorate_blocks(json_decode($p['blocks'], true) ?: []),
            'status' => $p['status'],
            'publishedAt' => $p['published_at'],
            'author' => $p['author'],
        ]]);
    }

    if ($action === 'delete') {
        $id = (int)($body['id'] ?? 0);
        $stmt = $db->prepare('DELETE FROM posts WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $stmt->close();
        mx_json(200, ['ok' => true]);
    }

    if ($action === 'publish') {
        // Quick publish / unpublish from the list.
        $id = (int)($body['id'] ?? 0);
        $status = ($body['status'] ?? '') === 'published' ? 'published' : 'draft';
        $stmt = $db->prepare(
            "UPDATE posts SET status = ?, published_at = IF(? = 'published', COALESCE(published_at, NOW()), published_at) WHERE id = ?"
        );
        $stmt->bind_param('ssi', $status, $status, $id);
        $stmt->execute();
        $stmt->close();
        mx_json(200, ['ok' => true]);
    }

    if ($action !== 'save') {
        mx_json(400, ['error' => 'Unknown action.']);
    }

    $id = (int)($body['id'] ?? 0);
    $title = mx_text($body['title'] ?? '', 200);
    if ($title === '') {
        mx_json(400, ['error' => 'Give the post a title.']);
    }
    $excerpt = mx_text($body['excerpt'] ?? '', 400);
    $titleFont = mx_choice($body['titleFont'] ?? '', ['sans', 'serif', 'handwritten'], 'sans');
    $category = mx_text($body['category'] ?? '', 60);
    $author = mx_text($body['author'] ?? '', 80);
    $coverAlt = mx_text($body['coverAlt'] ?? '', 300);
    $status = ($body['status'] ?? '') === 'published' ? 'published' : 'draft';

    $cover = (int)($body['coverMediaId'] ?? 0);
    if ($cover > 0 && !mx_media_exists($db, $cover)) {
        mx_json(400, ['error' => 'The header image is missing. Choose it again.']);
    }
    $coverId = $cover > 0 ? $cover : null;

    $highlights = [];
    foreach ((is_array($body['highlights'] ?? null) ? $body['highlights'] : []) as $h) {
        $t = mx_text($h, 300);
        if ($t !== '') {
            $highlights[] = $t;
        }
    }
    $highlights = array_slice($highlights, 0, 8);
    $highlightsJson = json_encode($highlights, JSON_UNESCAPED_UNICODE);

    [$blocks, $searchText] = mx_clean_blocks($db, $body['blocks'] ?? []);
    if ($status === 'published' && count($blocks) === 0) {
        mx_json(400, ['error' => 'Add some content before publishing.']);
    }
    $blocksJson = json_encode($blocks, JSON_UNESCAPED_UNICODE);
    $search = trim($searchText . ' ' . implode(' ', $highlights));

    // Publish date: the editor may set or back/forward-date it; empty means "now" on first publish.
    $publishedAt = null;
    $rawDate = mx_text($body['publishedAt'] ?? '', 19);
    if ($rawDate !== '' && preg_match('/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/', $rawDate) === 1) {
        $ts = strtotime($rawDate);
        if ($ts !== false) {
            $publishedAt = gmdate('Y-m-d H:i:s', $ts);
        }
    }

    $slug = mx_unique_slug($db, (string)($body['slug'] ?? '') !== '' ? (string)$body['slug'] : $title, $id);

    if ($id > 0) {
        $stmt = $db->prepare(
            "UPDATE posts SET slug=?, title=?, excerpt=?, category=?, cover_media_id=?, cover_alt=?, highlights=?, blocks=?,
                search_text=?, status=?, author=?, title_font=?,
                published_at = CASE WHEN ? IS NOT NULL THEN ? WHEN ? = 'published' THEN COALESCE(published_at, NOW()) ELSE published_at END
             WHERE id=?"
        );
        $stmt->bind_param(
            'ssssissssssssssi',
            $slug, $title, $excerpt, $category, $coverId, $coverAlt, $highlightsJson, $blocksJson,
            $search, $status, $author, $titleFont, $publishedAt, $publishedAt, $status, $id
        );
        $stmt->execute();
        $stmt->close();
    } else {
        $stmt = $db->prepare(
            "INSERT INTO posts (slug, title, excerpt, category, cover_media_id, cover_alt, highlights, blocks, search_text, status, author, title_font, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? IS NOT NULL THEN ? WHEN ? = 'published' THEN NOW() ELSE NULL END)"
        );
        $stmt->bind_param(
            'ssssissssssssss',
            $slug, $title, $excerpt, $category, $coverId, $coverAlt, $highlightsJson, $blocksJson,
            $search, $status, $author, $titleFont, $publishedAt, $publishedAt, $status
        );
        $stmt->execute();
        $id = (int)$db->insert_id;
        $stmt->close();
    }
    mx_json(200, ['ok' => true, 'id' => $id, 'slug' => $slug]);
} catch (Throwable $e) {
    error_log('Matrix admin posts failed (' . mx_failure_reason($e) . '): ' . $e->getMessage());
    mx_json(503, ['error' => 'Could not complete that. Please try again.']);
}
