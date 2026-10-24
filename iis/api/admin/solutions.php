<?php
declare(strict_types=1);

// Admin management of product detail pages. POST JSON {action: list | get | save | delete | publish, ...}
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
    mx_require_admin($db, $action !== 'list' && $action !== 'get');

    if ($action === 'list') {
        $rows = $db->query('SELECT id, slug, product, title, status, updated_at FROM solution_pages ORDER BY title')->fetch_all(MYSQLI_ASSOC);
        mx_json(200, ['pages' => $rows]);
    }

    if ($action === 'get') {
        $id = (int)($body['id'] ?? 0);
        $stmt = $db->prepare('SELECT * FROM solution_pages WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $p = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$p) {
            mx_json(404, ['error' => 'Page not found.']);
        }
        $cid = $p['cover_media_id'] !== null ? (int)$p['cover_media_id'] : null;
        mx_json(200, ['page' => [
            'id' => (int)$p['id'],
            'slug' => $p['slug'],
            'product' => $p['product'],
            'title' => $p['title'],
            'titleFont' => $p['title_font'],
            'excerpt' => $p['excerpt'],
            'coverMediaId' => $cid,
            'coverUrl' => mx_media_url($cid),
            'coverAlt' => $p['cover_alt'],
            'highlights' => mx_decode_highlights($p['highlights']),
            'blocks' => mx_decorate_blocks(json_decode($p['blocks'], true) ?: []),
            'status' => $p['status'],
        ]]);
    }

    if ($action === 'delete') {
        $id = (int)($body['id'] ?? 0);
        $stmt = $db->prepare('DELETE FROM solution_pages WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $stmt->close();
        mx_json(200, ['ok' => true]);
    }

    if ($action === 'publish') {
        $id = (int)($body['id'] ?? 0);
        $status = ($body['status'] ?? '') === 'published' ? 'published' : 'draft';
        $stmt = $db->prepare('UPDATE solution_pages SET status = ? WHERE id = ?');
        $stmt->bind_param('si', $status, $id);
        $stmt->execute();
        $stmt->close();
        mx_json(200, ['ok' => true]);
    }

    if ($action !== 'save') {
        mx_json(400, ['error' => 'Unknown action.']);
    }

    $id = (int)($body['id'] ?? 0);
    $product = mx_text($body['product'] ?? '', 200);
    $title = mx_text($body['title'] ?? '', 200);
    if ($title === '') {
        mx_json(400, ['error' => 'Give the page a title.']);
    }
    $excerpt = mx_text($body['excerpt'] ?? '', 400);
    $titleFont = mx_choice($body['titleFont'] ?? '', ['sans', 'serif', 'handwritten'], 'sans');
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
    $highlights = array_slice($highlights, 0, 12);
    $highlightsJson = json_encode($highlights, JSON_UNESCAPED_UNICODE);

    [$blocks, $searchText] = mx_clean_blocks($db, $body['blocks'] ?? []);
    if ($status === 'published' && count($blocks) === 0 && $excerpt === '') {
        mx_json(400, ['error' => 'Add a summary or some content before publishing.']);
    }
    $blocksJson = json_encode($blocks, JSON_UNESCAPED_UNICODE);
    $search = trim($searchText . ' ' . implode(' ', $highlights));

    $slugWanted = (string)($body['slug'] ?? '') !== '' ? (string)$body['slug'] : ($product !== '' ? $product : $title);
    $slug = mx_unique_slug($db, $slugWanted, $id, 'solution_pages');

    if ($id > 0) {
        $stmt = $db->prepare(
            'UPDATE solution_pages SET slug=?, product=?, title=?, excerpt=?, cover_media_id=?, cover_alt=?, highlights=?, blocks=?, search_text=?, status=?, title_font=? WHERE id=?'
        );
        $stmt->bind_param('ssssissssssi', $slug, $product, $title, $excerpt, $coverId, $coverAlt, $highlightsJson, $blocksJson, $search, $status, $titleFont, $id);
        $stmt->execute();
        $stmt->close();
    } else {
        $stmt = $db->prepare(
            'INSERT INTO solution_pages (slug, product, title, excerpt, cover_media_id, cover_alt, highlights, blocks, search_text, status, title_font) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->bind_param('ssssissssss', $slug, $product, $title, $excerpt, $coverId, $coverAlt, $highlightsJson, $blocksJson, $search, $status, $titleFont);
        $stmt->execute();
        $id = (int)$db->insert_id;
        $stmt->close();
    }
    mx_json(200, ['ok' => true, 'id' => $id, 'slug' => $slug]);
} catch (Throwable $e) {
    error_log('Matrix admin solutions failed (' . mx_failure_reason($e) . '): ' . $e->getMessage());
    mx_json(503, ['error' => 'Could not complete that. Please try again.']);
}
