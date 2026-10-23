import config from './pages.json';
import solutionPages from '../data/solutionPages.json';

// One list of pages feeds BOTH the running site (usePageMeta) and the build step that writes
// each page's own HTML, sitemap.xml and web.config rules (scripts/seo-build.mjs).

export const SITE_URL: string = config.siteUrl;
export const SITE_NAME: string = config.siteName;
export const DEFAULT_IMAGE: string = config.defaultImage;

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  h1?: string;
  noindex?: boolean;
  /** Share image, as a path on this site (defaults to the site-wide image). */
  image?: string;
}

export const solutionPath = (slug: string) => `/solutions/${slug}`;

const solutionMeta: PageMeta[] = solutionPages.map((s) => ({
  path: solutionPath(s.slug),
  title: s.title,
  description: s.description,
  h1: s.h1,
}));

export const allPages: PageMeta[] = [...(config.pages as PageMeta[]), ...solutionMeta];

export function getPageMeta(path: string): PageMeta {
  const page = allPages.find((p) => p.path === path);
  if (!page) throw new Error(`No SEO entry for ${path}. Add it to src/seo/pages.json.`);
  return page;
}

export const absoluteUrl = (path: string) => (path === '/' ? SITE_URL + '/' : SITE_URL + path);
