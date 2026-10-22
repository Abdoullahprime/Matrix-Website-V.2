// Runs after `vite build`. A single-page app serves the same index.html for every address, so
// the title, description, canonical address and social tags are only correct once JavaScript
// has run. This step gives every page its OWN HTML file with the right tags already in it, and
// writes sitemap.xml, robots.txt and the web.config rules that serve those files.
//
// Everything comes from src/seo/pages.json and src/data/solutionPages.json, the same files the
// running site reads, so the two cannot drift apart.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const cfg = readJson('src/seo/pages.json');
const solutions = readJson('src/data/solutionPages.json');
const SITE = cfg.siteUrl;
const NAME = cfg.siteName;

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  throw new Error('dist/index.html not found. Run "npm run build" first.');
}
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (p) => (p === '/' ? `${SITE}/` : `${SITE}${p}`);

const pages = [
  ...cfg.pages,
  ...solutions.map((s) => ({
    path: `/solutions/${s.slug}`,
    title: s.title,
    description: s.description,
    h1: s.h1,
    solution: s,
  })),
];

// ---- tag replacement (each one must match exactly once, or the build fails loudly) ----------
function replaceOnce(html, regex, replacement, what) {
  if (!regex.test(html)) throw new Error(`index.html has no ${what}; scripts/seo-build.mjs expects it.`);
  return html.replace(regex, replacement);
}
const metaRe = (attr, value) => new RegExp(`<meta\\s+${attr}="${value}"\\s+content="[^"]*"\\s*/?>`);
const setMeta = (html, attr, value, content) =>
  replaceOnce(html, metaRe(attr, value), `<meta ${attr}="${value}" content="${esc(content)}" />`, `<meta ${attr}="${value}">`);

function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

function structuredData(page) {
  const blocks = [];
  if (page.path !== '/') {
    const trail = [{ name: 'Home', path: '/' }];
    if (page.solution) trail.push({ name: 'Solutions', path: '/solutions' });
    trail.push({ name: page.solution ? page.solution.navLabel : page.h1 || page.title, path: page.path });
    blocks.push(
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: url(t.path) })),
      })
    );
  }
  if (page.solution) {
    const s = page.solution;
    blocks.push(
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: s.h1,
        description: s.description,
        url: url(page.path),
        provider: { '@id': `${SITE}/#organization` },
        areaServed: { '@type': 'Country', name: 'The Gambia' },
      }),
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: s.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      })
    );
  }
  return blocks.join('\n    ');
}

// Plain-HTML fallback for crawlers and visitors without JavaScript. It lives in <noscript>, so
// nobody sees it flash up before the app starts, and nothing is hidden from people.
function noscript(page) {
  const links = [
    ['/', 'Home'],
    ['/solutions', 'Solutions'],
    ...solutions.map((s) => [`/solutions/${s.slug}`, s.navLabel]),
    ['/clients', 'Clients'],
    ['/about', 'About'],
    ['/resources', 'Resources'],
    ['/contact', 'Contact'],
  ];
  const body = page.solution
    ? `<p>${esc(page.solution.intro)}</p><h2>${esc(page.solution.includedHeading)}</h2><ul>${page.solution.included
        .map((i) => `<li><strong>${esc(i.name)}</strong>: ${esc(i.desc)}</li>`)
        .join('')}</ul>`
    : `<p>${esc(page.description)}</p>`;
  return `<noscript><main><h1>${esc(page.h1 || page.title)}</h1>${body}<nav aria-label="Site"><ul>${links
    .map(([p, label]) => `<li><a href="${p}">${esc(label)}</a></li>`)
    .join('')}</ul></nav><p>${esc(NAME)}, Kanifing, The Gambia. info@matrixgambia.com</p></main></noscript>`;
}

function render(page) {
  const u = url(page.path);
  let html = template;
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`, '<title>');
  html = setMeta(html, 'name', 'description', page.description);
  html = replaceOnce(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${u}" />`, 'canonical link');
  html = setMeta(html, 'property', 'og:title', page.title);
  html = setMeta(html, 'property', 'og:description', page.description);
  html = setMeta(html, 'property', 'og:url', u);
  html = setMeta(html, 'name', 'twitter:title', page.title);
  html = setMeta(html, 'name', 'twitter:description', page.description);
  const extra = structuredData(page);
  if (extra) html = html.replace('</head>', `    ${extra}\n  </head>`);
  html = replaceOnce(html, /<noscript>\s*<\/noscript>/, noscript(page), '<noscript></noscript> placeholder');
  return html;
}

// ---- write one HTML file per page ----------------------------------------------------------
const report = [];
for (const page of pages) {
  const html = render(page);
  const file = page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`;
  const target = path.join(dist, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
  report.push({ file, title: page.title.length, desc: page.description.length, page });
}

// ---- sitemap.xml and robots.txt --------------------------------------------------------------
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${url(p.path)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`);

// ---- web.config: serve each page's own HTML file --------------------------------------------
const tplPath = path.join(root, 'iis', 'web.config');
const marker = '<!-- SEO_ROUTE_RULES -->';
const tpl = fs.readFileSync(tplPath, 'utf8');
if (!tpl.includes(marker)) throw new Error(`iis/web.config must contain ${marker}`);
const rules = pages
  .filter((p) => p.path !== '/')
  .map((p) => {
    const rel = p.path.slice(1);
    return `        <rule name="Page ${rel}" stopProcessing="true">\n          <match url="^${rel}/?$" />\n          <action type="Rewrite" url="/${rel}.html" />\n        </rule>`;
  })
  .join('\n');
fs.writeFileSync(path.join(dist, 'web.config'), tpl.replace(marker, rules));

// ---- report ------------------------------------------------------------------------------------
let warnings = 0;
console.log('\nSEO build: one HTML file per page');
for (const r of report) {
  const flag = [r.title > 65 ? `title ${r.title} chars (over 65)` : '', r.desc > 160 ? `description ${r.desc} chars (over 160)` : '', r.desc < 70 ? 'description is short' : '']
    .filter(Boolean)
    .join('; ');
  if (flag) warnings++;
  console.log(`  ${r.file.padEnd(58)} title ${String(r.title).padStart(2)}  desc ${String(r.desc).padStart(3)}${flag ? '   <-- ' + flag : ''}`);
}
console.log(`  sitemap.xml: ${pages.length} URLs   robots.txt   web.config: ${pages.length - 1} page rules`);
console.log(warnings ? `\n${warnings} page(s) need a look (search results cut long titles and descriptions).` : '\nAll titles and descriptions are a good length.');
