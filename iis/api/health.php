<?php
declare(strict_types=1);

require __DIR__ . '/_lib.php';

// GET /api/health.php  ->  {"ok":true,"database":"connected"}
// When the database cannot be reached, "reason" says why (never any credentials).
try {
    $db = mx_db();
    mx_ensure_table($db);
    $db->close();
    mx_json(200, ['ok' => true, 'database' => 'connected']);
} catch (Throwable $e) {
    mx_json(200, ['ok' => true, 'database' => 'unavailable', 'reason' => mx_failure_reason($e)]);
}
