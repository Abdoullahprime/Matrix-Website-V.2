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
    $cfg = ['DB_HOST' => 'localhost', 'DB_PORT' => '3306', 'DB_NAME' => '', 'DB_USER' => '', 'DB_PASSWORD' => ''];

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
