import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import { getPageMeta } from '../seo/meta';
import { PostList, SortOrder, fetchPosts, formatDate } from '../lib/blog';

/**
 * The blog: newest first by default, sortable, searchable, filterable by topic. The choices live
 * in the address (?q=…&sort=oldest&category=…&page=2) so a search can be shared or bookmarked.
 */
export default function BlogIndex() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const sort: SortOrder = params.get('sort') === 'oldest' ? 'oldest' : 'newest';
  const category = params.get('category') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  // Searches, sorts and topic filters are not pages worth indexing: they point back to /blog.
  // Page 2, 3... of the plain list are real pages and keep their own address.
  const base = getPageMeta('/blog');
  usePageMeta({
    ...base,
    path: page > 1 && !q && !category && sort === 'newest' ? `/blog?page=${page}` : '/blog',
    noindex: q !== '' || category !== '' || sort === 'oldest',
  });

  const [typed, setTyped] = useState(q);
  const [data, setData] = useState<PostList | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  // The topic chips come from the first (unfiltered) load so they do not vanish while filtering.
  const [topics, setTopics] = useState<string[]>([]);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!('page' in changes)) next.delete('page');
    setParams(next, { replace: true });
  };

  // Wait for a pause in typing before searching.
  useEffect(() => {
    if (typed === q) return;
    const t = window.setTimeout(() => update({ q: typed.trim() || null }), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed]);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    fetchPosts({ q, sort, category, page })
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setTopics((prev) => (d.categories.length >= prev.length || !category ? d.categories : prev));
        setState('ready');
      })
      .catch(() => !cancelled && setState('error'));
    return () => {
      cancelled = true;
    };
  }, [q, sort, category, page]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const filtered = q !== '' || category !== '';

  return (
    <div className="bg-white">
      <section className="bg-matrix-navy text-white section-padding !pb-16">
        <div className="container-custom space-y-5">
          <div className="text-sm font-extrabold uppercase tracking-[0.2em] text-matrix-blue-primary">Insights</div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">The Matrix Solutions Blog</h1>
          <p className="text-xl text-white/80 font-medium max-w-2xl">
            Guides, news and ideas on HR and payroll, banking systems and IT infrastructure.
          </p>
        </div>
      </section>

      <section className="section-padding !pt-12">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-8">
            <div className="relative flex-1 max-w-xl">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Search the blog"
                aria-label="Search the blog"
                className="w-full pl-11 pr-4 py-3.5 rounded-full border border-slate-200 focus:border-matrix-blue-primary focus:ring-4 focus:ring-matrix-blue-primary/10 outline-none font-medium"
              />
            </div>
            <label className="flex items-center gap-3 text-sm font-bold text-matrix-navy">
              Sort by
              <select
                value={sort}
                onChange={(e) => update({ sort: e.target.value === 'oldest' ? 'oldest' : null })}
                className="px-4 py-3 rounded-full border border-slate-200 bg-white font-semibold focus:border-matrix-blue-primary outline-none"
              >
                <option value="newest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
          </div>

          {topics.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-3 mb-10" role="tablist" aria-label="Topics">
              {['', ...topics].map((t) => {
                const on = t === category;
                return (
                  <button
                    key={t || 'all'}
                    type="button"
                    onClick={() => update({ category: t || null })}
                    aria-pressed={on}
                    className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-bold border transition-colors ${
                      on
                        ? 'border-matrix-blue-primary text-matrix-blue-primary bg-matrix-blue-primary/5 ring-2 ring-matrix-blue-primary/20'
                        : 'border-transparent bg-slate-100 text-matrix-navy hover:bg-slate-200'
                    }`}
                  >
                    {t || 'All'}
                  </button>
                );
              })}
            </div>
          )}

          {state === 'loading' && !data && (
            <div className="py-24 flex justify-center text-slate-400">
              <Loader2 className="animate-spin" />
            </div>
          )}

          {state === 'error' && (
            <p className="py-24 text-center text-slate-600 font-medium">The blog could not be loaded right now. Please try again shortly.</p>
          )}

          {data && state !== 'error' && (
            <div className={state === 'loading' ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              {data.posts.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <p className="text-xl font-bold text-matrix-navy">
                    {filtered ? 'No posts match your search.' : 'No posts yet. Check back soon.'}
                  </p>
                  {filtered && (
                    <button
                      type="button"
                      onClick={() => {
                        setTyped('');
                        setParams({}, { replace: true });
                      }}
                      className="btn-secondary"
                    >
                      Clear search and filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-500 mb-6" aria-live="polite">
                    {data.total} {data.total === 1 ? 'post' : 'posts'}
                    {q && <> for “{q}”</>}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                    {data.posts.map((p) => (
                      <article key={p.slug} className="group">
                        <Link to={`/blog/${p.slug}`} className="block space-y-4">
                          <div className="aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-br from-matrix-navy to-matrix-blue-primary">
                            {p.cover && (
                              <img
                                src={p.cover}
                                alt={p.coverAlt}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                            <span>{formatDate(p.publishedAt)}</span>
                            {p.category && (
                              <span className="px-3 py-1 rounded-full border border-matrix-navy text-matrix-navy">{p.category}</span>
                            )}
                          </div>
                          <h2 className="text-2xl font-extrabold text-matrix-navy leading-snug group-hover:text-matrix-blue-primary transition-colors">
                            {p.title}
                          </h2>
                          {p.excerpt && <p className="text-slate-600 font-medium leading-relaxed line-clamp-3">{p.excerpt}</p>}
                        </Link>
                      </article>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <nav className="mt-16 flex items-center justify-center gap-4" aria-label="Pages">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => update({ page: String(page - 1) })}
                        className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-slate-200 font-bold text-matrix-navy disabled:opacity-40"
                      >
                        <ChevronLeft size={18} /> Previous
                      </button>
                      <span className="text-sm font-bold text-slate-500">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => update({ page: String(page + 1) })}
                        className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-slate-200 font-bold text-matrix-navy disabled:opacity-40"
                      >
                        Next <ChevronRight size={18} />
                      </button>
                    </nav>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
