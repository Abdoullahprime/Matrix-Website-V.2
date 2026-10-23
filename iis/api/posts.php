<?php
declare(strict_types=1);

// Public blog API (read only).
//   GET /api/posts.php                      -> list of published posts
//        ?q=word  ?sort=newest|oldest  ?category=Name  ?page=1
//   GET /api/posts.php?slug=my-post         -> one published post with its content blocks
require __DIR__ . '/_cms.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    header('Allow: GET');
    mx_json(405, ['error' => 'Method not allowed.']);
}

const MX_PAGE_SIZE = 9;

try {
    $db = mx_db();
    mx_cms_schema($db);

    $slug = (string)($_GET['slug'] ?? '');
    if ($slug !== '') {
        $stmt = $db->prepare(
            "SELECT id, slug, title, excerpt, category, cover_media_id, cover_alt, highlights, blocks, author, published_at, updated_at
             FROM posts WHERE slug = ? AND status = 'published' AND published_at <= NOW()"
        );
        $stmt->bind_param('s', $slug);
        $stmt->execute();
        $p = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$p) {
            mx_json(404, ['error' => 'Post not found.']);
        }
        mx_json(200, [
            'post' => [
                'slug' => $p['slug'],
                'title' => $p['title'],
                'excerpt' => $p['excerpt'],
                'category' => $p['category'],
                'cover' => mx_media_url($p['cover_media_id'] !== null ? (int)$p['cover_media_id'] : null),
                'coverAlt' => $p['cover_alt'],
                'highlights' => mx_decode_highlights($p['highlights']),
                'blocks' => mx_decorate_blocks(json_decode($p['blocks'], true) ?: []),
                'author' => $p['author'],
                'publishedAt' => $p['published_at'],
                'updatedAt' => $p['updated_at'],
            ],
        ]);
    }

    $q = mx_text($_GET['q'] ?? '', 80);
    $sort = ($_GET['sort'] ?? '') === 'oldest' ? 'ASC' : 'DESC';
    $category = mx_text($_GET['category'] ?? '', 60);
    $page = max(1, (int)($_GET['page'] ?? 1));

    $where = "status = 'published' AND published_at <= NOW()";
    $types = '';
    $args = [];
    if ($q !== '') {
        // Every word must appear somewhere in the title, summary, category or body.
        foreach (preg_split('/\s+/', $q) ?: [] as $word) {
            $like = '%' . addcslashes($word, '%_\\') . '%';
            $where .= ' AND (title LIKE ? OR excerpt LIKE ? OR category LIKE ? OR search_text LIKE ?)';
            $types .= 'ssss';
            array_push($args, $like, $like, $like, $like);
        }
    }
    if ($category !== '') {
        $where .= ' AND category = ?';
        $types .= 's';
        $args[] = $category;
    }

    $stmt = $db->prepare("SELECT COUNT(*) FROM posts WHERE $where");
    if ($types !== '') {
        $stmt->bind_param($types, ...$args);
    }
    $stmt->execute();
    $stmt->bind_result($total);
    $stmt->fetch();
    $stmt->close();

    $offset = ($page - 1) * MX_PAGE_SIZE;
    $limit = MX_PAGE_SIZE;
    $stmt = $db->prepare(
        "SELECT slug, title, excerpt, category, cover_media_id, cover_alt, author, published_at
         FROM posts WHERE $where ORDER BY published_at $sort, id $sort LIMIT $limit OFFSET $offset"
    );
    if ($types !== '') {
        $stmt->bind_param($types, ...$args);
    }
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    $posts = array_map(static fn(array $r): array => [
        'slug' => $r['slug'],
        'title' => $r['title'],
        'excerpt' => $r['excerpt'],
        'category' => $r['category'],
        'cover' => mx_media_url($r['cover_media_id'] !== null ? (int)$r['cover_media_id'] : null),
        'coverAlt' => $r['cover_alt'],
        'author' => $r['author'],
        'publishedAt' => $r['published_at'],
    ], $rows);

    $cats = [];
    $res = $db->query("SELECT DISTINCT category FROM posts WHERE status = 'published' AND published_at <= NOW() AND category <> '' ORDER BY category");
    foreach ($res->fetch_all(MYSQLI_NUM) as $c) {
        $cats[] = $c[0];
    }

    mx_json(200, [
        'posts' => $posts,
        'total' => (int)$total,
        'page' => $page,
        'pageSize' => MX_PAGE_SIZE,
        'categories' => $cats,
    ]);
} catch (Throwable $e) {
    error_log('Matrix blog failed (' . mx_failure_reason($e) . '): ' . $e->getMessage());
    mx_json(503, ['error' => 'The blog is unavailable right now.']);
}
