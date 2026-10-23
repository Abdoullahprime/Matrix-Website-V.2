import { useEffect } from 'react';
import { DEFAULT_IMAGE, PageMeta, SITE_NAME, SITE_URL, absoluteUrl } from '../seo/meta';

function setTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const meta = (key: 'name' | 'property', name: string, content: string) =>
  setTag(
    `meta[${key}="${name}"]`,
    () => {
      const el = document.createElement('meta');
      el.setAttribute(key, name);
      return el;
    },
    'content',
    content
  );

/**
 * Keeps the tab title, description, canonical address, social-sharing tags and robots
 * directive in step with the page being shown. (The build also writes the same values into
 * each page's own HTML file, so crawlers that do not run JavaScript see them too.)
 */
export default function usePageMeta(page: PageMeta) {
  useEffect(() => {
    const url = absoluteUrl(page.path);
    const image = SITE_URL + (page.image ?? DEFAULT_IMAGE);

    document.title = page.title;
    meta('name', 'description', page.description);
    meta('name', 'robots', page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');

    setTag(
      'link[rel="canonical"]',
      () => {
        const el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        return el;
      },
      'href',
      url
    );

    meta('property', 'og:title', page.title);
    meta('property', 'og:description', page.description);
    meta('property', 'og:url', url);
    meta('property', 'og:image', image);
    meta('property', 'og:site_name', SITE_NAME);
    meta('name', 'twitter:card', 'summary_large_image');
    meta('name', 'twitter:title', page.title);
    meta('name', 'twitter:description', page.description);
    meta('name', 'twitter:image', image);
  }, [page.path, page.title, page.description, page.noindex, page.image]);
}
