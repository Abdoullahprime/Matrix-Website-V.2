import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, Heading2, Image as ImageIcon, List, Loader2, Quote, Trash2, Type, Video, X } from 'lucide-react';
import BlogBlocks from '../../components/BlogBlocks';
import { Block, ImageSize } from '../../lib/blog';
import { adminApi, EditablePost, prepareImage } from './adminApi';
import { productCategories, productSlug } from '../../data/products';

const field =
  'w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-matrix-blue-primary focus:ring-4 focus:ring-matrix-blue-primary/10 outline-none font-medium bg-white';
const label = 'block text-xs font-extrabold text-matrix-navy uppercase tracking-widest mb-2';

const blank = (): EditablePost => ({
  slug: '',
  title: '',
  excerpt: '',
  category: '',
  author: '',
  coverMediaId: null,
  coverUrl: null,
  coverAlt: '',
  highlights: [],
  blocks: [],
  status: 'draft',
  publishedAt: null,
});

const newBlock = (type: Block['type']): Block => {
  switch (type) {
    case 'heading':
      return { type, text: '', level: 2 };
    case 'paragraph':
      return { type, text: '' };
    case 'image':
      return { type, mediaId: 0, size: 'normal', alt: '', caption: '' };
    case 'list':
      return { type, ordered: false, items: [] };
    case 'quote':
      return { type, text: '', cite: '' };
    case 'video':
      return { type, url: '', caption: '' };
  }
};

/** Pick a picture, shrink it, store it, and report the stored id and address. */
function ImagePicker({ onPicked }: { onPicked: (id: number, url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          setBusy(true);
          setError('');
          try {
            const r = await adminApi.upload(await prepareImage(file));
            onPicked(r.id, r.url);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed.');
          } finally {
            setBusy(false);
          }
        }}
      />
      <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn-secondary !py-2.5 !px-5 text-sm flex items-center gap-2">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
        {busy ? 'Uploading…' : 'Choose picture'}
      </button>
      {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}

export default function PostEditor({ postId, kind = 'post' }: { postId: number | null; kind?: 'post' | 'solution' }) {
  const navigate = useNavigate();
  const isSolution = kind === 'solution';
  const basePath = isSolution ? '/admin/solutions' : '/admin';
  const [post, setPost] = useState<EditablePost>(blank());
  const [loading, setLoading] = useState(postId !== null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [preview, setPreview] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (postId === null) return;
    (isSolution ? adminApi.getSolution(postId) : adminApi.get(postId))
      .then((r) => {
        // The server keeps only the video id; rebuild a link so the field is filled and re-saves.
        const blocks = r.post.blocks.map((b) =>
          b.type === 'video' && b.youtubeId && !b.url ? { ...b, url: `https://youtu.be/${b.youtubeId}` } : b
        );
        setPost({ ...r.post, blocks });
        setSlugTouched(true);
      })
      .catch((e: Error) => setMessage({ kind: 'error', text: e.message }))
      .finally(() => setLoading(false));
  }, [postId]);

  const set = <K extends keyof EditablePost>(k: K, v: EditablePost[K]) => setPost((p) => ({ ...p, [k]: v }));
  const setBlock = (i: number, patch: Partial<Block>) =>
    setPost((p) => ({ ...p, blocks: p.blocks.map((b, j) => (j === i ? ({ ...b, ...patch } as Block) : b)) }));
  const move = (i: number, d: -1 | 1) =>
    setPost((p) => {
      const j = i + d;
      if (j < 0 || j >= p.blocks.length) return p;
      const blocks = [...p.blocks];
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      return { ...p, blocks };
    });
  const removeBlock = (i: number) => setPost((p) => ({ ...p, blocks: p.blocks.filter((_, j) => j !== i) }));
  const addBlock = (t: Block['type']) => setPost((p) => ({ ...p, blocks: [...p.blocks, newBlock(t)] }));

  const save = async (status: 'draft' | 'published') => {
    setSaving(true);
    setMessage(null);
    try {
      const r = await (isSolution ? adminApi.saveSolution({ ...post, status }) : adminApi.save({ ...post, status }));
      setPost((p) => ({ ...p, id: r.id, slug: r.slug, status }));
      setSlugTouched(true);
      setMessage({ kind: 'ok', text: status === 'published' ? 'Published.' : 'Saved as draft.' });
      if (postId === null) navigate(isSolution ? `/admin/solutions/${r.id}` : `/admin/posts/${r.id}`, { replace: true });
    } catch (e) {
      setMessage({ kind: 'error', text: e instanceof Error ? e.message : 'Could not save.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader2 className="animate-spin text-slate-400" />;

  const addButtons: { type: Block['type']; text: string; icon: React.ReactNode }[] = [
    { type: 'paragraph', text: 'Paragraph', icon: <Type size={16} /> },
    { type: 'heading', text: 'Heading', icon: <Heading2 size={16} /> },
    { type: 'image', text: 'Image', icon: <ImageIcon size={16} /> },
    { type: 'list', text: 'List', icon: <List size={16} /> },
    { type: 'quote', text: 'Quote', icon: <Quote size={16} /> },
    { type: 'video', text: 'YouTube video', icon: <Video size={16} /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to={basePath} className="text-sm font-bold text-matrix-blue-primary hover:underline">
            ← {isSolution ? 'All solution pages' : 'All posts'}
          </Link>
          <h1 className="text-3xl font-extrabold text-matrix-navy mt-1">{postId === null && !post.id ? (isSolution ? 'New solution page' : 'New post') : (isSolution ? 'Edit solution page' : 'Edit post')}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setPreview((v) => !v)} className="btn-secondary !py-2.5 !px-5 text-sm">
            {preview ? 'Back to editing' : 'Preview'}
          </button>
          <button type="button" onClick={() => save('draft')} disabled={saving} className="btn-secondary !py-2.5 !px-5 text-sm">
            Save draft
          </button>
          <button type="button" onClick={() => save('published')} disabled={saving} className="btn-primary !py-2.5 !px-5 text-sm flex items-center gap-2">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {post.status === 'published' ? 'Update published post' : 'Publish'}
          </button>
        </div>
      </div>

      {message && (
        <p className={`text-sm font-bold ${message.kind === 'ok' ? 'text-emerald-600' : 'text-red-600'}`} role="status">
          {message.text}
        </p>
      )}

      {preview ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            {post.category && <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{post.category}</div>}
            <h2 className="text-4xl md:text-5xl font-extrabold text-matrix-navy leading-tight">{post.title || 'Untitled'}</h2>
            {post.excerpt && <p className="mt-5 text-xl text-slate-600 font-medium">{post.excerpt}</p>}
            {post.coverUrl && <img src={post.coverUrl} alt={post.coverAlt} className="mt-8 w-full max-h-[420px] object-cover rounded-2xl" />}
            {post.highlights.length > 0 && (
              <ul className="mt-8 list-disc pl-5 space-y-2 text-slate-700 font-medium bg-slate-50 rounded-2xl p-6 pl-10">
                {post.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
            <div className="mt-10">
              <BlogBlocks blocks={post.blocks} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <section className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 space-y-6">
            <div>
              <label className={label} htmlFor="p-title">Title</label>
              <input
                id="p-title"
                className={`${field} text-lg`}
                value={post.title}
                maxLength={200}
                onChange={(e) => {
                  set('title', e.target.value);
                  if (!slugTouched) set('slug', '');
                }}
                placeholder="A clear, specific title"
              />
            </div>
            {isSolution && (
              <div>
                <label className={label} htmlFor="p-product">Product on the Solutions page</label>
                <select
                  id="p-product"
                  className={field}
                  value={post.product ?? ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    setPost((p) => ({
                      ...p,
                      product: name,
                      title: p.title || name,
                      slug: slugTouched ? p.slug : name ? productSlug(name) : '',
                    }));
                  }}
                >
                  <option value="">Choose the product this page is for…</option>
                  {productCategories.map((c) => (
                    <optgroup key={c.title} label={c.title}>
                      {c.items.map((i) => (
                        <option key={i.name} value={i.name}>{i.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500 font-medium">Once published, clicking this product on the Solutions page opens this page. The web address is made from the product name.</p>
              </div>
            )}
            {!isSolution && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={label} htmlFor="p-cat">Topic (category)</label>
                <input id="p-cat" className={field} value={post.category} maxLength={60} onChange={(e) => set('category', e.target.value)} placeholder="e.g. HR & Payroll" />
              </div>
              <div>
                <label className={label} htmlFor="p-author">Author</label>
                <input id="p-author" className={field} value={post.author} maxLength={80} onChange={(e) => set('author', e.target.value)} placeholder="Name shown on the post" />
              </div>
            </div>
            )}
            <div>
              <label className={label} htmlFor="p-excerpt">{isSolution ? 'Short summary (shown under the title and in search results)' : 'Short summary (shown on the blog page and in search results)'}</label>
              <textarea id="p-excerpt" className={`${field} resize-none`} rows={3} maxLength={400} value={post.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={label} htmlFor="p-slug">Web address ending</label>
                <input
                  id="p-slug"
                  className={field}
                  value={post.slug}
                  maxLength={120}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set('slug', e.target.value);
                  }}
                  placeholder="made from the title if left empty"
                />
              </div>
              {!isSolution && (
              <div>
                <label className={label} htmlFor="p-date">Publish date (optional)</label>
                <input
                  id="p-date"
                  type="date"
                  className={field}
                  value={post.publishedAt ? post.publishedAt.slice(0, 10) : ''}
                  onChange={(e) => set('publishedAt', e.target.value || null)}
                />
              </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-extrabold text-matrix-navy">Header image</h2>
            <p className="text-sm text-slate-600 font-medium">{isSolution ? 'Shown large below the title. Leave empty for none.' : 'Shown large at the top of the post and on its card in the blog. Leave empty for a post without one.'}</p>
            {post.coverUrl && (
              <div className="relative max-w-md">
                <img src={post.coverUrl} alt="" className="w-full rounded-xl border border-slate-100" />
                <button
                  type="button"
                  onClick={() => setPost((p) => ({ ...p, coverMediaId: null, coverUrl: null }))}
                  className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow"
                  title="Remove header image"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <ImagePicker onPicked={(id, url) => setPost((p) => ({ ...p, coverMediaId: id, coverUrl: url }))} />
            {post.coverUrl && (
              <div className="max-w-md">
                <label className={label} htmlFor="p-calt">Describe the image (for screen readers)</label>
                <input id="p-calt" className={field} value={post.coverAlt} maxLength={300} onChange={(e) => set('coverAlt', e.target.value)} />
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-extrabold text-matrix-navy">{isSolution ? 'Key features (optional)' : 'Key points (optional)'}</h2>
            <p className="text-sm text-slate-600 font-medium">{isSolution ? 'Shown as a feature list near the top of the page. One feature per line.' : 'A short “In this article” box under the header. One point per line.'}</p>
            <textarea
              className={`${field} resize-y`}
              rows={4}
              value={post.highlights.join('\n')}
              onChange={(e) => set('highlights', e.target.value.split('\n').slice(0, 8))}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-matrix-navy">{isSolution ? 'Page content' : 'Post content'}</h2>
            {post.blocks.length === 0 && (
              <p className="text-slate-600 font-medium bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                Nothing here yet. Add paragraphs, headings and pictures below, in the order they should appear.
              </p>
            )}
            {post.blocks.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-matrix-blue-primary">
                    {b.type === 'video' ? 'YouTube video' : b.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-2 rounded hover:bg-slate-100 disabled:opacity-30" title="Move up">
                      <ArrowUp size={16} />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === post.blocks.length - 1} className="p-2 rounded hover:bg-slate-100 disabled:opacity-30" title="Move down">
                      <ArrowDown size={16} />
                    </button>
                    <button type="button" onClick={() => removeBlock(i)} className="p-2 rounded hover:bg-red-50 text-red-600" title="Remove block">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {b.type === 'paragraph' && (
                  <textarea className={`${field} resize-y`} rows={5} maxLength={6000} value={b.text} onChange={(e) => setBlock(i, { text: e.target.value })} placeholder="Write the paragraph…" />
                )}
                {b.type === 'heading' && (
                  <div className="flex gap-3">
                    <input className={field} value={b.text} maxLength={200} onChange={(e) => setBlock(i, { text: e.target.value })} placeholder="Heading" />
                    <select className={`${field} !w-40`} value={b.level} onChange={(e) => setBlock(i, { level: Number(e.target.value) === 3 ? 3 : 2 })}>
                      <option value={2}>Large</option>
                      <option value={3}>Smaller</option>
                    </select>
                  </div>
                )}
                {b.type === 'image' && (
                  <div className="space-y-3">
                    {b.url ? <img src={b.url} alt="" className="max-h-56 rounded-lg border border-slate-100" /> : null}
                    <ImagePicker onPicked={(id, url) => setBlock(i, { mediaId: id, url } as Partial<Block>)} />
                    <div className="grid md:grid-cols-3 gap-3">
                      <select className={field} value={b.size} onChange={(e) => setBlock(i, { size: e.target.value as ImageSize })}>
                        <option value="small">Small</option>
                        <option value="normal">Medium</option>
                        <option value="wide">Wide</option>
                      </select>
                      <input className={field} value={b.caption} maxLength={300} onChange={(e) => setBlock(i, { caption: e.target.value })} placeholder="Caption (optional)" />
                      <input className={field} value={b.alt} maxLength={300} onChange={(e) => setBlock(i, { alt: e.target.value })} placeholder="Describe the image" />
                    </div>
                  </div>
                )}
                {b.type === 'list' && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-matrix-navy">
                      <input type="checkbox" checked={b.ordered} onChange={(e) => setBlock(i, { ordered: e.target.checked })} /> Numbered list
                    </label>
                    <textarea
                      className={`${field} resize-y`}
                      rows={4}
                      value={b.items.join('\n')}
                      onChange={(e) => setBlock(i, { items: e.target.value.split('\n') })}
                      placeholder="One item per line"
                    />
                  </div>
                )}
                {b.type === 'quote' && (
                  <div className="space-y-3">
                    <textarea className={`${field} resize-y`} rows={3} maxLength={1200} value={b.text} onChange={(e) => setBlock(i, { text: e.target.value })} placeholder="The quote" />
                    <input className={field} value={b.cite} maxLength={200} onChange={(e) => setBlock(i, { cite: e.target.value })} placeholder="Who said it (optional)" />
                  </div>
                )}
                {b.type === 'video' && (
                  <div className="space-y-3">
                    <input className={field} value={b.url ?? ''} onChange={(e) => setBlock(i, { url: e.target.value })} placeholder="Paste a YouTube link" />
                    <input className={field} value={b.caption} maxLength={300} onChange={(e) => setBlock(i, { caption: e.target.value })} placeholder="Caption (optional)" />
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-wrap gap-3 pt-2">
              {addButtons.map((a) => (
                <button key={a.type} type="button" onClick={() => addBlock(a.type)} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-bold text-matrix-navy hover:border-matrix-blue-primary hover:text-matrix-blue-primary">
                  {a.icon} Add {a.text.toLowerCase()}
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
