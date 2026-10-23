<?php
declare(strict_types=1);

// Serves an uploaded blog picture: GET /api/media.php?id=12
require __DIR__ . '/_cms.php';

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    http_response_code(404);
    exit;
}

try {
    $db = mx_db();
    mx_cms_schema($db);
    $stmt = $db->prepare('SELECT mime, data, sha1 FROM media WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $m = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$m) {
        http_response_code(404);
        exit;
    }
    $etag = '"' . $m['sha1'] . '"';
    header('ETag: ' . $etag);
    // A picture never changes once stored (a new upload gets a new id), so browsers may keep it.
    header('Cache-Control: public, max-age=31536000, immutable');
    if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) {
        http_response_code(304);
        exit;
    }
    header('Content-Type: ' . $m['mime']);
    header('X-Content-Type-Options: nosniff');
    header('Content-Length: ' . strlen($m['data']));
    echo $m['data'];
} catch (Throwable $e) {
    error_log('Matrix media failed: ' . $e->getMessage());
    http_response_code(503);
}
