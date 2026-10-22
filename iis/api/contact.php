<?php
declare(strict_types=1);

require __DIR__ . '/_lib.php';

const MX_RATE_MAX = 5; // submissions allowed per IP per hour

/** A trimmed, non-empty string of at most $max characters, or null. */
function mx_field(mixed $value, int $max): ?string
{
    if (!is_string($value)) {
        return null;
    }
    $v = trim($value);
    if ($v === '') {
        return null;
    }
    $len = function_exists('mb_strlen') ? mb_strlen($v, 'UTF-8') : strlen($v);
    return $len > $max ? null : $v;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    mx_json(405, ['error' => 'Method not allowed.']);
}

$raw = file_get_contents('php://input', false, null, 0, 32769);
if ($raw === false || strlen($raw) > 32768) {
    mx_json(413, ['error' => 'Request too large.']);
}
$body = json_decode($raw, true);
if (!is_array($body)) {
    mx_json(400, ['error' => 'Invalid request.']);
}

// Honeypot: bots fill the hidden "website" field. Pretend success, store nothing.
if (isset($body['website']) && is_string($body['website']) && trim($body['website']) !== '') {
    mx_json(200, ['ok' => true]);
}

$fullName     = mx_field($body['fullName'] ?? null, 120);
$email        = mx_field($body['email'] ?? null, 200);
$organization = mx_field($body['organization'] ?? null, 200);
$interest     = mx_field($body['interest'] ?? null, 200);
$message      = mx_field($body['message'] ?? null, 5000);

if ($fullName === null || $email === null || $organization === null || $interest === null || $message === null) {
    mx_json(400, ['error' => 'Please fill in all required fields.']);
}
if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    mx_json(400, ['error' => 'Please provide a valid email address.']);
}

$ip = substr((string)($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45);

try {
    $db = mx_db();
    mx_ensure_table($db);

    // Rate limit: at most MX_RATE_MAX submissions per IP per hour.
    $stmt = $db->prepare('SELECT COUNT(*) FROM contact_submissions WHERE ip = ? AND created_at > (NOW() - INTERVAL 1 HOUR)');
    $stmt->bind_param('s', $ip);
    $stmt->execute();
    $stmt->bind_result($recent);
    $stmt->fetch();
    $stmt->close();
    if ((int)$recent >= MX_RATE_MAX) {
        mx_json(429, ['error' => 'Too many submissions. Please try again later.']);
    }

    // Prepared statement: values are never interpolated into the SQL.
    $stmt = $db->prepare(
        'INSERT INTO contact_submissions (full_name, email, organization, interest, message, ip) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('ssssss', $fullName, $email, $organization, $interest, $message, $ip);
    $stmt->execute();
    $stmt->close();
    $db->close();

    mx_json(200, ['ok' => true]);
} catch (Throwable $e) {
    error_log('Matrix contact form failed (' . mx_failure_reason($e) . '): ' . $e->getMessage());
    mx_json(503, ['error' => 'We could not save your message right now. Please email info@matrixgambia.com.']);
}
