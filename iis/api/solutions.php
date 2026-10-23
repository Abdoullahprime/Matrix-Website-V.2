<?php
declare(strict_types=1);

// Public API for the product detail pages written in the admin area (read only).
//   GET /api/solutions.php              -> [{slug, product}] for every published page
//   GET /api/solutions.php?slug=x       -> that page with its content blocks
require __DIR__ . '/_cms.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    header('Allow: GET');
    mx_json(405, ['error' => 'Method not allowed.']);
}

try {
    $db = mx_db();
    mx_cms_schema($db);

    $slug = (string)($_GET['slug'] ?? '');
    if ($slug === '') {
        $rows = $db->query("SELECT slug, product, title FROM solution_pages WHERE status = 'published' ORDER BY title")->fetch_all(MYSQLI_ASSOC);
        header('Cache-Control: public, max-age=60');
        mx_json(200, ['pages' => $rows]);
    }

    $stmt = $db->prepare(
        "SELECT slug, product, title, excerpt, cover_media_id, cover_alt, highlights, blocks, updated_at
         FROM solution_pages WHERE slug = ? AND status = 'published'"
    );
    $stmt->bind_param('s', $slug);
    $stmt->execute();
    $p = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$p) {
        mx_json(404, ['error' => 'Page not found.']);
    }
    header('Cache-Control: public, max-age=60');
    mx_json(200, ['page' => [
        'slug' => $p['slug'],
        'product' => $p['product'],
        'title' => $p['title'],
        'excerpt' => $p['excerpt'],
        'cover' => mx_media_url($p['cover_media_id'] !== null ? (int)$p['cover_media_id'] : null),
        'coverAlt' => $p['cover_alt'],
        'highlights' => mx_decode_highlights($p['highlights']),
        'blocks' => mx_decorate_blocks(json_decode($p['blocks'], true) ?: []),
        'updatedAt' => $p['updated_at'],
    ]]);
} catch (Throwable $e) {
    error_log('Matrix solutions failed (' . mx_failure_reason($e) . '): ' . $e->getMessage());
    mx_json(503, ['error' => 'Solution pages are unavailable right now.']);
}
