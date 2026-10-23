<?php
declare(strict_types=1);

// A product page's own HTML head for crawlers and share previews: GET /solutions/<slug> for
// pages written in the admin area (web.config sends it here after the fixed solution pages).
require __DIR__ . '/_cms.php';

$slug = (string)($_GET['slug'] ?? '');
$indexFile = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'index.html';
$html = is_readable($indexFile) ? (string)file_get_contents($indexFile) : '';
if ($html === '') {
    http_response_code(500);
    echo 'Site files are missing.';
    exit;
}
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=60');

$page = null;
try {
    $db = mx_db();
    mx_cms_schema($db);
    $stmt = $db->prepare("SELECT title, excerpt, cover_media_id, cover_alt, blocks FROM solution_pages WHERE slug = ? AND status = 'published'");
    $stmt->bind_param('s', $slug);
    $stmt->execute();
    $page = $stmt->get_result()->fetch_assoc() ?: null;
    $stmt->close();
} catch (Throwable $e) {
    error_log('Matrix solution page: ' . mx_failure_reason($e));
    echo $html; // the React page still loads the content itself
    exit;
}

if ($page === null) {
    http_response_code(404);
    echo mx_swap($html, '~<meta name="robots"[^>]*>~', '<meta name="robots" content="noindex, follow" />');
    exit;
}

$base = 'https://matrixgambia.com';
if (preg_match('~<link rel="canonical" href="(https?://[^/"]+)~', $html, $m)) {
    $base = $m[1];
}
$url = $base . '/solutions/' . $slug;
$title = mx_seo_title((string)$page['title']);
$blocks = json_decode((string)$page['blocks'], true) ?: [];
$desc = trim((string)$page['excerpt']);
if ($desc === '') {
    foreach ($blocks as $b) {
        if (($b['type'] ?? '') === 'paragraph') {
            $desc = (string)$b['text'];
            break;
        }
    }
}
$desc = preg_replace('/\s+/', ' ', $desc) ?? $desc;
if (mx_len($desc) > 158) {
    $desc = rtrim(function_exists('mb_substr') ? mb_substr($desc, 0, 155, 'UTF-8') : substr($desc, 0, 155)) . '…';
}
$hasCover = $page['cover_media_id'] !== null;
$cover = $hasCover ? $base . '/api/media.php?id=' . (int)$page['cover_media_id'] : $base . '/og-image.jpg';
$alt = $page['cover_alt'] !== '' ? (string)$page['cover_alt'] : (string)$page['title'];

$html = mx_swap($html, '~<title>.*?</title>~s', '<title>' . mx_esc($title) . '</title>');
$html = mx_swap($html, '~<meta name="description"[^>]*>~', '<meta name="description" content="' . mx_esc($desc) . '" />');
$html = mx_swap($html, '~<link rel="canonical"[^>]*>~', '<link rel="canonical" href="' . mx_esc($url) . '" />');
$html = mx_swap($html, '~<meta property="og:title"[^>]*>~', '<meta property="og:title" content="' . mx_esc($title) . '" />');
$html = mx_swap($html, '~<meta property="og:description"[^>]*>~', '<meta property="og:description" content="' . mx_esc($desc) . '" />');
$html = mx_swap($html, '~<meta property="og:url"[^>]*>~', '<meta property="og:url" content="' . mx_esc($url) . '" />');
$html = mx_swap($html, '~<meta property="og:image"[^>]*>~', '<meta property="og:image" content="' . mx_esc($cover) . '" />');
$html = mx_swap($html, '~<meta property="og:image:alt"[^>]*>~', '<meta property="og:image:alt" content="' . mx_esc($alt) . '" />');
if ($hasCover) {
    $html = preg_replace('~\s*<meta property="og:image:(width|height)"[^>]*>~', '', $html) ?? $html;
}
$html = mx_swap($html, '~<meta name="twitter:title"[^>]*>~', '<meta name="twitter:title" content="' . mx_esc($title) . '" />');
$html = mx_swap($html, '~<meta name="twitter:description"[^>]*>~', '<meta name="twitter:description" content="' . mx_esc($desc) . '" />');
$html = mx_swap($html, '~<meta name="twitter:image"[^>]*>~', '<meta name="twitter:image" content="' . mx_esc($cover) . '" />');

$ld = [
    '@context' => 'https://schema.org',
    '@graph' => [
        [
            '@type' => 'Service',
            'name' => (string)$page['title'],
            'description' => $desc,
            'url' => $url,
            'image' => $cover,
            'provider' => ['@id' => $base . '/#organization'],
            'areaServed' => ['@type' => 'Country', 'name' => 'The Gambia'],
        ],
        [
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => $base . '/'],
                ['@type' => 'ListItem', 'position' => 2, 'name' => 'Solutions', 'item' => $base . '/solutions'],
                ['@type' => 'ListItem', 'position' => 3, 'name' => (string)$page['title'], 'item' => $url],
            ],
        ],
    ],
];
$json = str_replace('</', '<\\/', json_encode($ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
$html = str_replace('</head>', '    <script type="application/ld+json">' . $json . "</script>\n  </head>", $html);

$bodyHtml = '<h1>' . mx_esc((string)$page['title']) . '</h1>';
if ($page['excerpt'] !== '') {
    $bodyHtml .= '<p>' . mx_esc((string)$page['excerpt']) . '</p>';
}
foreach ($blocks as $b) {
    $t = $b['type'] ?? '';
    if ($t === 'heading') {
        $bodyHtml .= '<h2>' . mx_esc((string)$b['text']) . '</h2>';
    } elseif ($t === 'paragraph') {
        $bodyHtml .= '<p>' . mx_esc((string)$b['text']) . '</p>';
    } elseif ($t === 'list') {
        $bodyHtml .= '<ul>' . implode('', array_map(static fn($i) => '<li>' . mx_esc((string)$i) . '</li>', $b['items'] ?? [])) . '</ul>';
    }
}
echo mx_swap($html, '~<noscript>.*?</noscript>~s', '<noscript><main>' . $bodyHtml . '</main></noscript>');
