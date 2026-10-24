// Types and helpers shared by the public blog and the admin area.

export type ImageSize = 'small' | 'normal' | 'wide';

export type Align = 'left' | 'center' | 'right';
export type TitleFont = 'sans' | 'serif' | 'handwritten';

export interface ButtonItem {
  label: string;
  url: string;
  style: 'primary' | 'secondary';
}

export type Block =
  | { type: 'heading'; text: string; level: 1 | 2 | 3; font?: TitleFont; align?: Align; highlight?: string }
  | { type: 'paragraph'; text: string; align?: Align }
  | { type: 'image'; mediaId: number; url?: string; size: ImageSize; alt: string; caption: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'quote'; text: string; cite: string }
  | { type: 'video'; youtubeId?: string; url?: string; caption: string }
  | { type: 'buttons'; items: ButtonItem[]; align?: Align }
  | {
      type: 'split';
      side: 'left' | 'right';
      heading: string;
      text: string;
      mediaId: number;
      url?: string;
      youtubeId?: string;
      video?: string;
      alt: string;
      font?: TitleFont;
      buttons: ButtonItem[];
    };

export interface PostSummary {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover: string | null;
  coverAlt: string;
  author: string;
  publishedAt: string;
}

export interface PostFull extends PostSummary {
  highlights: string[];
  blocks: Block[];
  updatedAt: string;
}

export interface PostList {
  posts: PostSummary[];
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
}

export type SortOrder = 'newest' | 'oldest';

/** Dates come from the server as UTC "YYYY-MM-DD HH:MM:SS". */
export function parseServerDate(value: string): Date {
  return new Date(value.replace(' ', 'T') + 'Z');
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = parseServerDate(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function readingMinutes(blocks: Block[]): number {
  const words = blocks
    .map((b) => {
      if (b.type === 'paragraph' || b.type === 'heading' || b.type === 'quote') return b.text;
      if (b.type === 'split') return `${b.heading} ${b.text}`;
      if (b.type === 'list') return b.items.join(' ');
      return '';
    })
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

async function readJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.error) || 'Something went wrong. Please try again.');
  return data as T;
}

export async function fetchPosts(opts: { q?: string; sort?: SortOrder; category?: string; page?: number }): Promise<PostList> {
  const params = new URLSearchParams();
  if (opts.q) params.set('q', opts.q);
  if (opts.sort === 'oldest') params.set('sort', 'oldest');
  if (opts.category) params.set('category', opts.category);
  if (opts.page && opts.page > 1) params.set('page', String(opts.page));
  const qs = params.toString();
  return readJson<PostList>(await fetch('/api/posts.php' + (qs ? `?${qs}` : '')));
}

export async function fetchPost(slug: string): Promise<PostFull> {
  const data = await readJson<{ post: PostFull }>(await fetch('/api/posts.php?slug=' + encodeURIComponent(slug)));
  return data.post;
}

/** Browser-tab / search title for a post: keep it near 60 characters (same rule as api/post.php). */
export function seoTitle(title: string): string {
  const suffix = ' | Matrix Solutions';
  if ((title + suffix).length <= 62) return title + suffix;
  if (title.length <= 62) return title;
  return title.slice(0, 59).replace(/[\s,.;:-]+$/, '') + '…';
}
