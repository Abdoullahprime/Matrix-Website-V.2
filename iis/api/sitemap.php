<?php
declare(strict_types=1);

// The live /sitemap.xml (web.config sends that address here): the fixed pages written at build
// time (sitemap-pages.xml) plus every published blog post. If the database is down, the fixed
// pages are still served.
require __DIR__ . '/_cms.php';

$urls = [];
$file = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'sitemap-pages.xml';
$base = 'https://matrixgambia.com';
if (is_readable($file)) {
    $xml = (string)file_get_contents($file);
    if (preg_match_all('~<url>.*?</url>~s', $xml, $m)) {
        $urls = $m[0];
    }
    if (preg_match('~<loc>(https?://[^/<]+)~', $xml, $b)) {
        $base = $b[1];
    }
}

try {
    $db = mx_db();
    mx_cms_schema($db);
    $res = $db->query(
        "SELECT slug, COALESCE(updated_at, published_at) AS m FROM posts
         WHERE status = 'published' AND published_at <= NOW() ORDER BY published_at DESC LIMIT 5000"
    );
    foreach ($res->fetch_all(MYSQLI_ASSOC) as $r) {
        $loc = htmlspecialchars($base . '/blog/' . $r['slug'], ENT_XML1);
        $urls[] = '<url><loc>' . $loc . '</loc><lastmod>' . substr((string)$r['m'], 0, 10) . '</lastmod></url>';
    }
} catch (Throwable $e) {
    error_log('Matrix sitemap: posts skipped (' . mx_failure_reason($e) . ')');
}

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
    . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n  "
    . implode("\n  ", $urls) . "\n</urlset>\n";
