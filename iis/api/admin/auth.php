<?php
declare(strict_types=1);

// Admin sign-in. POST JSON {action: status | setup | login | logout, ...}
//   status: who is signed in, and whether first-time setup is still needed
//   setup:  create the FIRST admin (needs ADMIN_SETUP_KEY from matrix.env; works only while no admin exists)
//   login / logout
require dirname(__DIR__) . '/_cms.php';

const MX_LOGIN_MAX_IP = 10;     // failed sign-ins per IP per 15 minutes
const MX_LOGIN_MAX_USER = 6;    // failed sign-ins per username per 15 minutes

header('Cache-Control: no-store');
$body = mx_read_json(4096);
$action = (string)($body['action'] ?? 'status');

try {
    $db = mx_db();
    mx_cms_schema($db);
    mx_session_start();

    $count = (int)$db->query('SELECT COUNT(*) FROM admin_users')->fetch_row()[0];

    if ($action === 'status') {
        $admin = mx_current_admin($db);
        if ($admin !== null && empty($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        }
        mx_json(200, [
            'admin' => $admin ? ['username' => $admin['username']] : null,
            'csrf' => $admin ? $_SESSION['csrf'] : null,
            'needsSetup' => $count === 0,
        ]);
    }

    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        mx_json(405, ['error' => 'Method not allowed.']);
    }

    $ip = mx_client_ip();

    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        mx_json(200, ['ok' => true]);
    }

    $username = mx_text($body['username'] ?? '', 60);
    $password = is_string($body['password'] ?? null) ? $body['password'] : '';

    // Throttle guessing: count recent failures by address and by username.
    $stmt = $db->prepare(
        'SELECT SUM(ip = ?), SUM(username = ?) FROM admin_login_attempts
         WHERE success = 0 AND created_at > (NOW() - INTERVAL 15 MINUTE)'
    );
    $stmt->bind_param('ss', $ip, $username);
    $stmt->execute();
    $stmt->bind_result($byIp, $byUser);
    $stmt->fetch();
    $stmt->close();
    if ((int)$byIp >= MX_LOGIN_MAX_IP || (int)$byUser >= MX_LOGIN_MAX_USER) {
        mx_json(429, ['error' => 'Too many attempts. Try again in 15 minutes.']);
    }

    $record = static function (bool $ok) use ($db, $ip, $username): void {
        $s = $ok ? 1 : 0;
        $st = $db->prepare('INSERT INTO admin_login_attempts (ip, username, success) VALUES (?, ?, ?)');
        $st->bind_param('ssi', $ip, $username, $s);
        $st->execute();
        $st->close();
    };

    if ($action === 'setup') {
        $key = (string)(mx_config()['ADMIN_SETUP_KEY'] ?? '');
        $sent = is_string($body['setupKey'] ?? null) ? $body['setupKey'] : '';
        if ($count > 0) {
            mx_json(403, ['error' => 'An admin already exists. Please sign in.']);
        }
        if ($key === '' || strlen($key) < 8) {
            mx_json(403, ['error' => 'Setup is not enabled. Add ADMIN_SETUP_KEY (8+ characters) to matrix.env first.']);
        }
        if (!hash_equals($key, $sent)) {
            $record(false);
            mx_json(403, ['error' => 'The setup key is not correct.']);
        }
        if (preg_match('/^[A-Za-z0-9._-]{3,60}$/', $username) !== 1) {
            mx_json(400, ['error' => 'Username: 3-60 letters, numbers, dot, dash or underscore.']);
        }
        if (strlen($password) < 10 || strlen($password) > 200) {
            mx_json(400, ['error' => 'Password must be at least 10 characters.']);
        }
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)');
        $stmt->bind_param('ss', $username, $hash);
        $stmt->execute();
        $uid = (int)$db->insert_id;
        $stmt->close();
        session_regenerate_id(true);
        $_SESSION['uid'] = $uid;
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        mx_json(200, ['ok' => true, 'admin' => ['username' => $username], 'csrf' => $_SESSION['csrf']]);
    }

    if ($action === 'login') {
        $stmt = $db->prepare('SELECT id, password_hash FROM admin_users WHERE username = ?');
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $u = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        // Same work and same message whether the username or the password was wrong.
        $hash = $u['password_hash'] ?? '$2y$10$usesomesillystringfore7hnbRJHxXVLeakoG8K30oukPsA.ztMG';
        $ok = password_verify($password, $hash) && $u;
        $record((bool)$ok);
        if (!$ok) {
            mx_json(401, ['error' => 'Wrong username or password.']);
        }
        session_regenerate_id(true);
        $_SESSION['uid'] = (int)$u['id'];
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        $db->query('UPDATE admin_users SET last_login = NOW() WHERE id = ' . (int)$u['id']);
        $db->query('DELETE FROM admin_login_attempts WHERE created_at < (NOW() - INTERVAL 7 DAY)');
        mx_json(200, ['ok' => true, 'admin' => ['username' => $username], 'csrf' => $_SESSION['csrf']]);
    }

    mx_json(400, ['error' => 'Unknown action.']);
} catch (Throwable $e) {
    error_log('Matrix admin auth failed (' . mx_failure_reason($e) . '): ' . $e->getMessage());
    mx_json(503, ['error' => 'The admin area is unavailable right now.']);
}
