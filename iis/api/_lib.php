<?php
declare(strict_types=1);

// Shared helpers for the contact API. Not an endpoint: requesting it directly returns 404.
if (basename((string)($_SERVER['SCRIPT_FILENAME'] ?? '')) === '_lib.php') {
    http_response_code(404);
    exit;
}

// Never print PHP warnings into a response: they would corrupt the JSON the site expects
// (a failed database connection raises one). They are still written to the error log.
ini_set('display_errors', '0');

/** Send a JSON response and stop. */
function mx_json(int $status, array $payload): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Database settings, from matrix.env.
 *
 * The file lives in the hosting account's HOME directory: the folder that contains the
 * site folders (httpdocs, preview.example.com, ...). That is ABOVE the web root, so it can
 * never be downloaded. Format: one KEY=value per line, # for comments.
 */
function mx_config(): array
{
    static $cfg = null;
    if ($cfg !== null) {
        return $cfg;
    }
    $cfg = [
        'DB_HOST' => 'localhost', 'DB_PORT' => '3306', 'DB_NAME' => '', 'DB_USER' => '', 'DB_PASSWORD' => '',
        // Email notifications. Only SMTP_USER and SMTP_PASSWORD need setting for Gmail.
        'SMTP_HOST' => 'smtp.gmail.com', 'SMTP_PORT' => '465', 'SMTP_SECURE' => '',
        'SMTP_USER' => '', 'SMTP_PASSWORD' => '',
        'MAIL_FROM_NAME' => 'Matrix Solutions Website', 'MAIL_TO' => 'info@matrixgambia.com',
    ];

    $candidates = [
        (string)getenv('MATRIX_ENV_FILE'),
        dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'matrix.env',
    ];
    foreach ($candidates as $file) {
        if ($file === '' || !is_readable($file)) {
            continue;
        }
        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        foreach ($lines as $i => $line) {
            if ($i === 0) {
                $line = preg_replace('/^\xEF\xBB\xBF/', '', $line) ?? $line; // editors sometimes add a BOM
            }
            $line = trim($line);
            if ($line === '' || $line[0] === '#') {
                continue;
            }
            $eq = strpos($line, '=');
            if ($eq === false) {
                continue;
            }
            $key = trim(substr($line, 0, $eq));
            $val = trim(substr($line, $eq + 1));
            $n = strlen($val);
            if ($n >= 2 && (($val[0] === '"' && $val[$n - 1] === '"') || ($val[0] === "'" && $val[$n - 1] === "'"))) {
                $val = substr($val, 1, -1);
            }
            if (array_key_exists($key, $cfg)) {
                $cfg[$key] = $val;
            }
        }
        break; // first readable file wins
    }
    return $cfg;
}

/**
 * Open the database connection. Throws mysqli_sql_exception (or RuntimeException when the
 * settings or the extension are missing); see mx_failure_reason().
 */
function mx_db(): mysqli
{
    if (!extension_loaded('mysqli')) {
        throw new RuntimeException('extension_missing');
    }
    $c = mx_config();
    if ($c['DB_NAME'] === '' || $c['DB_USER'] === '') {
        throw new RuntimeException('not_configured');
    }
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $db = mysqli_init();
    $db->options(MYSQLI_OPT_CONNECT_TIMEOUT, 8);
    $db->real_connect($c['DB_HOST'], $c['DB_USER'], $c['DB_PASSWORD'], $c['DB_NAME'], (int)$c['DB_PORT']);
    $db->set_charset('utf8mb4');
    return $db;
}

/** Create the table on first use. */
function mx_ensure_table(mysqli $db): void
{
    $db->query(
        'CREATE TABLE IF NOT EXISTS contact_submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(120) NOT NULL,
            email VARCHAR(200) NOT NULL,
            organization VARCHAR(200) NOT NULL,
            interest VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            ip VARCHAR(45) NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_created_at (created_at),
            INDEX idx_ip_created (ip, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
}

/** A short, safe label for why the database is unavailable. Never includes credentials. */
function mx_failure_reason(Throwable $e): string
{
    if ($e instanceof RuntimeException && in_array($e->getMessage(), ['extension_missing', 'not_configured'], true)) {
        return $e->getMessage();
    }
    return match ((int)$e->getCode()) {
        1045 => 'access_denied',          // wrong user or password
        1044 => 'database_not_permitted', // user may not use this database
        1049 => 'unknown_database',       // wrong database name
        2002, 2003, 2006 => 'cannot_connect', // wrong host/port, or the server is unreachable
        default => 'error',
    };
}

// ---------------------------------------------------------------------------------------
// Email notifications: a tiny SMTP client, so the site needs no mail library and no
// server-side mail setup. Failures carry a short reason code, never credentials.
// ---------------------------------------------------------------------------------------

final class MxMailException extends RuntimeException
{
}

/** Read one SMTP reply (it may span several lines). Returns [code, text]. */
function mx_smtp_read($fp): array
{
    $text = '';
    while (($line = fgets($fp, 1024)) !== false) {
        $text .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') {
            return [(int)substr($line, 0, 3), $text];
        }
        if (strlen($line) < 4) {
            break;
        }
    }
    throw new MxMailException('no_response');
}

/** Send a command (empty = just read) and require one of the expected reply codes. */
function mx_smtp_cmd($fp, string $command, array $okCodes, string $reason): string
{
    if ($command !== '') {
        fwrite($fp, $command . "\r\n");
    }
    [$code, $text] = mx_smtp_read($fp);
    if (!in_array($code, $okCodes, true)) {
        throw new MxMailException($reason);
    }
    return $text;
}

/** Remove anything that could end a header line early (header injection). */
function mx_clean_header(string $value): string
{
    return trim(preg_replace('/[\r\n\0]+/', ' ', $value) ?? '');
}

/**
 * Send one plain-text email through the configured SMTP account.
 * Throws MxMailException with a reason: not_configured, cannot_connect, tls_failed,
 * no_response, rejected, auth_failed, recipient_refused, send_failed.
 */
function mx_send_mail(string $to, string $subject, string $body, string $replyTo = ''): void
{
    $c = mx_config();
    $user = trim($c['SMTP_USER']);
    $pass = $c['SMTP_PASSWORD'];
    if ($user === '' || $pass === '') {
        throw new MxMailException('not_configured');
    }
    // Google shows app passwords as "abcd efgh ijkl mnop"; the spaces are not part of it.
    if (preg_match('/^[a-z]{4}( [a-z]{4}){3}$/i', $pass) === 1) {
        $pass = str_replace(' ', '', $pass);
    }

    $host = $c['SMTP_HOST'];
    $port = (int)$c['SMTP_PORT'];
    $secure = strtolower(trim($c['SMTP_SECURE']));
    if ($secure === '') {
        $secure = $port === 465 ? 'ssl' : ($port === 587 ? 'starttls' : 'none');
    }

    // Verify the server's certificate against a bundled CA list, because Windows PHP often
    // has none configured. Credentials are only ever sent over a verified connection.
    $ctx = stream_context_create(['ssl' => [
        'verify_peer' => true,
        'verify_peer_name' => true,
        'peer_name' => $host,
        'SNI_enabled' => true,
        'cafile' => __DIR__ . DIRECTORY_SEPARATOR . 'cacert.pem',
    ]]);
    $target = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
    $fp = @stream_socket_client($target, $errno, $errstr, 8, STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) {
        throw new MxMailException(stripos((string)$errstr, 'ssl') !== false || stripos((string)$errstr, 'certificate') !== false
            ? 'tls_failed' : 'cannot_connect');
    }
    stream_set_timeout($fp, 8);

    try {
        mx_smtp_cmd($fp, '', [220], 'rejected');
        $name = preg_replace('/[^a-z0-9.-]/i', '', (string)($_SERVER['SERVER_NAME'] ?? '')) ?: 'localhost';
        mx_smtp_cmd($fp, 'EHLO ' . $name, [250], 'rejected');

        if ($secure === 'starttls') {
            mx_smtp_cmd($fp, 'STARTTLS', [220], 'rejected');
            if (!@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new MxMailException('tls_failed');
            }
            mx_smtp_cmd($fp, 'EHLO ' . $name, [250], 'rejected');
        }

        mx_smtp_cmd($fp, 'AUTH LOGIN', [334], 'auth_failed');
        mx_smtp_cmd($fp, base64_encode($user), [334], 'auth_failed');
        mx_smtp_cmd($fp, base64_encode($pass), [235], 'auth_failed');

        mx_smtp_cmd($fp, 'MAIL FROM:<' . $user . '>', [250], 'rejected');
        mx_smtp_cmd($fp, 'RCPT TO:<' . $to . '>', [250, 251], 'recipient_refused');
        mx_smtp_cmd($fp, 'DATA', [354], 'rejected');

        $subject = mx_clean_header($subject);
        $encodedSubject = function_exists('mb_encode_mimeheader')
            ? mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n")
            : '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $fromName = mx_clean_header($c['MAIL_FROM_NAME']);
        $headers = [
            'Date: ' . gmdate('D, d M Y H:i:s') . ' +0000',
            'From: ' . (function_exists('mb_encode_mimeheader') ? mb_encode_mimeheader($fromName, 'UTF-8', 'B', "\r\n") : $fromName) . ' <' . $user . '>',
            'To: <' . $to . '>',
            'Subject: ' . $encodedSubject,
            'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $name . '>',
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: quoted-printable',
        ];
        if ($replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL) !== false) {
            $headers[] = 'Reply-To: <' . $replyTo . '>';
        }
        // Line breaks must be CRLF *before* quoted-printable encoding, or PHP encodes a bare
        // LF as "=0A" and the whole message arrives as one long line.
        $bodyCrlf = preg_replace('/\r\n|\r|\n/', "\r\n", $body) ?? $body;
        $message = implode("\r\n", $headers) . "\r\n\r\n" . quoted_printable_encode($bodyCrlf);
        $message = preg_replace('/^\./m', '..', $message) ?? $message; // SMTP "dot stuffing"

        fwrite($fp, $message . "\r\n.\r\n");
        [$code] = mx_smtp_read($fp);
        if ($code !== 250) {
            throw new MxMailException('send_failed');
        }
        @fwrite($fp, "QUIT\r\n");
    } finally {
        @fclose($fp);
    }
}
