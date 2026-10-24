import { Block } from '../../lib/blog';

export interface AdminPostRow {
  id: number;
  slug: string;
  title: string;
  category: string;
  status: 'draft' | 'published';
  published_at: string | null;
  updated_at: string;
  cover_media_id: number | null;
}

export interface AdminSolutionRow {
  id: number;
  slug: string;
  product: string;
  title: string;
  status: 'draft' | 'published';
  updated_at: string;
}

export interface EditablePost {
  id?: number;
  /** Solution pages only: the product on the Solutions page this page belongs to. */
  product?: string;
  slug: string;
  title: string;
  /** Font of the page's main title. */
  titleFont?: 'sans' | 'serif' | 'handwritten';
  excerpt: string;
  category: string;
  author: string;
  coverMediaId: number | null;
  coverUrl: string | null;
  coverAlt: string;
  highlights: string[];
  blocks: Block[];
  status: 'draft' | 'published';
  publishedAt: string | null;
}

export interface Session {
  admin: { username: string } | null;
  csrf: string | null;
  needsSetup: boolean;
}

let csrf = '';
export const setCsrf = (t: string | null) => {
  csrf = t ?? '';
};

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error((data && data.error) || 'Something went wrong. Please try again.') as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export const adminApi = {
  status: () => post<Session>('/api/admin/auth.php', { action: 'status' }),
  login: (username: string, password: string) =>
    post<{ admin: { username: string }; csrf: string }>('/api/admin/auth.php', { action: 'login', username, password }),
  setup: (setupKey: string, username: string, password: string) =>
    post<{ admin: { username: string }; csrf: string }>('/api/admin/auth.php', { action: 'setup', setupKey, username, password }),
  logout: () => post<{ ok: true }>('/api/admin/auth.php', { action: 'logout' }),
  list: () => post<{ posts: AdminPostRow[] }>('/api/admin/posts.php', { action: 'list' }),
  get: (id: number) => post<{ post: EditablePost }>('/api/admin/posts.php', { action: 'get', id }),
  save: (p: EditablePost) => post<{ id: number; slug: string }>('/api/admin/posts.php', { action: 'save', ...p }),
  remove: (id: number) => post<{ ok: true }>('/api/admin/posts.php', { action: 'delete', id }),
  setStatus: (id: number, status: 'draft' | 'published') => post<{ ok: true }>('/api/admin/posts.php', { action: 'publish', id, status }),
  listSolutions: () => post<{ pages: AdminSolutionRow[] }>('/api/admin/solutions.php', { action: 'list' }),
  getSolution: async (id: number) => ({ post: (await post<{ page: EditablePost }>('/api/admin/solutions.php', { action: 'get', id })).page }),
  saveSolution: (p: EditablePost) => post<{ id: number; slug: string }>('/api/admin/solutions.php', { action: 'save', ...p }),
  removeSolution: (id: number) => post<{ ok: true }>('/api/admin/solutions.php', { action: 'delete', id }),
  setSolutionStatus: (id: number, status: 'draft' | 'published') => post<{ ok: true }>('/api/admin/solutions.php', { action: 'publish', id, status }),
  upload: (dataUrl: string) => post<{ id: number; url: string }>('/api/admin/media.php', { dataUrl }),
};

/** Shrink a chosen picture in the browser (max 1600px wide) so uploads are small and quick. */
export async function prepareImage(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Choose a JPEG, PNG or WebP picture.');
  const bitmap = await createImageBitmap(file);
  const MAX = 1600;
  const scale = Math.min(1, MAX / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot prepare pictures.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  let out = canvas.toDataURL('image/webp', 0.82);
  if (!out.startsWith('data:image/webp')) out = canvas.toDataURL('image/jpeg', 0.85);
  // ~4 base64 chars per 3 bytes; the server allows 3 MB of picture.
  if (out.length > 3.9 * 1024 * 1024) out = canvas.toDataURL('image/jpeg', 0.6);
  if (out.length > 3.9 * 1024 * 1024) throw new Error('That picture is too large. Try a smaller one.');
  return out;
}
