<?php
declare(strict_types=1);

// A blog post's own page for crawlers and share previews: GET /blog/<slug> (web.config sends it
// here). It takes the built site's index.html and swaps in this post's title, description,
// canonical address, share image and structured data. The React page then loads as usual.
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

function esc(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Same rule as seoTitle() in src/lib/blog.ts: keep the whole title near 60 characters. */
function seo_title(string $title): string
{
    $suffix = ' | Matrix Solutions';
    if (mx_len($title . $suffix) <= 62) {
        return $title . $suffix;
    }
    if (mx_len($title) <= 62) {
        return $title;
    }
    $cut = function_exists('mb_substr') ? mb_substr($title, 0, 59, 'UTF-8') : substr($title, 0, 59);
    return rtrim($cut, " ,.;:-") . '…';
}

/** Replace the first match of a tag pattern with $new (no-op if it is not there). */
function swap(string $html, string $pattern, string $new): string
{
    return preg_replace($pattern, str_replace(['\\', '$'], ['\\\\', '\\$'], $new), $html, 1) ?? $html;
}

$post = null;
try {
    $db = mx_db();
    mx_cms_schema($db);
    $stmt = $db->prepare(
        "SELECT title, excerpt, category, cover_media_id, cover_alt, blocks, author, published_at, updated_at
         FROM posts WHERE slug = ? AND status = 'published' AND published_at <= NOW()"
    );
    $stmt->bind_param('s', $slug);
    $stmt->execute();
    $post = $stmt->get_result()->fetch_assoc() ?: null;
    $stmt->close();
    $found = $post !== null;
} catch (Throwable $e) {
    error_log('Matrix post page: ' . mx_failure_reason($e));
    echo $html; // database trouble: the React page still loads the post itself
    exit;
}

if (!$found) {
    http_response_code(404);
    echo swap($html, '~<meta name="robots"[^>]*>~', '<meta name="robots" content="noindex, follow" />');
    exit;
}

$base = 'https://matrixgambia.com';
if (preg_match('~<link rel="canonical" href="(https?://[^/"]+)~', $html, $m)) {
    $base = $m[1];
}
$url = $base . '/blog/' . $slug;
$title = seo_title((string)$post['title']);
$blocks = json_decode((string)$post['blocks'], true) ?: [];
$desc = trim((string)$post['excerpt']);
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
$cover = $post['cover_media_id'] !== null ? $base . '/api/media.php?id=' . (int)$post['cover_media_id'] : $base . '/og-image.jpg';
$hasCover = $post['cover_media_id'] !== null;
$alt = $post['cover_alt'] !== '' ? (string)$post['cover_alt'] : (string)$post['title'];
$published = gmdate('c', strtotime((string)$post['published_at'] . ' UTC'));
$modified = gmdate('c', strtotime((string)$post['updated_at'] . ' UTC'));

$html = swap($html, '~<title>.*?</title>~s', '<title>' . esc($title) . '</title>');
$html = swap($html, '~<meta name="description"[^>]*>~', '<meta name="description" content="' . esc($desc) . '" />');
$html = swap($html, '~<link rel="canonical"[^>]*>~', '<link rel="canonical" href="' . esc($url) . '" />');
$html = swap($html, '~<meta property="og:type"[^>]*>~', '<meta property="og:type" content="article" />');
$html = swap($html, '~<meta property="og:title"[^>]*>~', '<meta property="og:title" content="' . esc($title) . '" />');
$html = swap($html, '~<meta property="og:description"[^>]*>~', '<meta property="og:description" content="' . esc($desc) . '" />');
$html = swap($html, '~<meta property="og:url"[^>]*>~', '<meta property="og:url" content="' . esc($url) . '" />');
$html = swap($html, '~<meta property="og:image"[^>]*>~', '<meta property="og:image" content="' . esc($cover) . '" />');
$html = swap($html, '~<meta property="og:image:alt"[^>]*>~', '<meta property="og:image:alt" content="' . esc($alt) . '" />');
if ($hasCover) {
    // The cover's real size is not 1200x630, so do not claim it.
    $html = preg_replace('~\s*<meta property="og:image:(width|height)"[^>]*>~', '', $html) ?? $html;
}
$html = swap($html, '~<meta name="twitter:title"[^>]*>~', '<meta name="twitter:title" content="' . esc($title) . '" />');
$html = swap($html, '~<meta name="twitter:description"[^>]*>~', '<meta name="twitter:description" content="' . esc($desc) . '" />');
$html = swap($html, '~<meta name="twitter:image"[^>]*>~', '<meta name="twitter:image" content="' . esc($cover) . '" />');

$ld = [
    '@context' => 'https://schema.org',
    '@graph' => [
        [
            '@type' => 'BlogPosting',
            'headline' => mx_len((string)$post['title']) > 110
                ? (function_exists('mb_substr') ? mb_substr((string)$post['title'], 0, 110, 'UTF-8') : substr((string)$post['title'], 0, 110))
                : (string)$post['title'],
            'description' => $desc,
            'image' => [$cover],
            'datePublished' => $published,
            'dateModified' => $modified,
            'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $url],
            'author' => $post['author'] !== ''
                ? ['@type' => 'Person', 'name' => (string)$post['author']]
                : ['@id' => $base . '/#organization'],
            'publisher' => ['@id' => $base . '/#organization'],
            'inLanguage' => 'en',
        ],
        [
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => $base . '/'],
                ['@type' => 'ListItem', 'position' => 2, 'name' => 'Blog', 'item' => $base . '/blog'],
                ['@type' => 'ListItem', 'position' => 3, 'name' => (string)$post['title'], 'item' => $url],
            ],
        ],
    ],
];
// "</" is escaped so post text can never close the script tag.
$json = str_replace('</', '<\\/', json_encode($ld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
$html = str_replace('</head>', '    <script type="application/ld+json">' . $json . "</script>\n  </head>", $html);

// Readable text for crawlers that do not run scripts.
$body = '<h1>' . esc((string)$post['title']) . '</h1>';
foreach ($blocks as $b) {
    $t = $b['type'] ?? '';
    if ($t === 'heading') {
        $body .= '<h2>' . esc((string)$b['text']) . '</h2>';
    } elseif ($t === 'paragraph') {
        $body .= '<p>' . esc((string)$b['text']) . '</p>';
    } elseif ($t === 'list') {
        $body .= '<ul>' . implode('', array_map(static fn($i) => '<li>' . esc((string)$i) . '</li>', $b['items'] ?? [])) . '</ul>';
    } elseif ($t === 'quote') {
        $body .= '<blockquote>' . esc((string)$b['text']) . '</blockquote>';
    }
}
$html = swap($html, '~<noscript>.*?</noscript>~s', '<noscript><main>' . $body . '</main></noscript>');

echo $html;
