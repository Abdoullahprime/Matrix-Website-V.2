<?php
declare(strict_types=1);

// Admin picture upload. POST JSON {dataUrl: "data:image/jpeg;base64,..."} -> {id, url, width, height}
// The admin page shrinks the picture first; this checks it is really a JPEG, PNG or WebP.
require dirname(__DIR__) . '/_cms.php';

header('Cache-Control: no-store');
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    mx_json(405, ['error' => 'Method not allowed.']);
}

try {
    $db = mx_db();
    mx_cms_schema($db);
    mx_require_admin($db, true);
    $body = mx_read_json((int)(MX_MAX_IMAGE_BYTES * 1.4) + 1024);

    $url = (string)($body['dataUrl'] ?? '');
    if (preg_match('~^data:image/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$~', $url, $m) !== 1) {
        mx_json(400, ['error' => 'Choose a JPEG, PNG or WebP picture.']);
    }
    $bin = base64_decode($m[1], true);
    if ($bin === false || strlen($bin) === 0) {
        mx_json(400, ['error' => 'That picture could not be read.']);
    }
    if (strlen($bin) > MX_MAX_IMAGE_BYTES) {
        mx_json(413, ['error' => 'Picture is too large (3 MB maximum).']);
    }
    $info = @getimagesizefromstring($bin);
    $types = [IMAGETYPE_JPEG => 'image/jpeg', IMAGETYPE_PNG => 'image/png', IMAGETYPE_WEBP => 'image/webp'];
    if ($info === false || !isset($types[$info[2]]) || $info[0] > 6000 || $info[1] > 6000) {
        mx_json(400, ['error' => 'Choose a JPEG, PNG or WebP picture.']);
    }
    $mime = $types[$info[2]];
    $w = (int)$info[0];
    $h = (int)$info[1];
    $bytes = strlen($bin);
    $sha = sha1($bin);

    // The same picture uploaded twice is stored once.
    $stmt = $db->prepare('SELECT id FROM media WHERE sha1 = ?');
    $stmt->bind_param('s', $sha);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if ($existing) {
        $id = (int)$existing['id'];
    } else {
        $stmt = $db->prepare('INSERT INTO media (mime, width, height, bytes, sha1, data) VALUES (?, ?, ?, ?, ?, ?)');
        $null = null;
        $stmt->bind_param('siiisb', $mime, $w, $h, $bytes, $sha, $null);
        $stmt->send_long_data(5, $bin);
        $stmt->execute();
        $id = (int)$db->insert_id;
        $stmt->close();
    }
    mx_json(200, ['id' => $id, 'url' => mx_media_url($id), 'width' => $w, 'height' => $h]);
} catch (Throwable $e) {
    error_log('Matrix media upload failed (' . mx_failure_reason($e) . '): ' . $e->getMessage());
    mx_json(503, ['error' => 'The picture could not be saved.']);
}
