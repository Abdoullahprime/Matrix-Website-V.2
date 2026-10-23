import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import BlogBlocks from '../components/BlogBlocks';
import NotFound from './NotFound';
import { PostFull, fetchPost, formatDate, readingMinutes, seoTitle } from '../lib/blog';

export default function BlogPost() {
  const { slug = '' } = useParams();
  const [post, setPost] = useState<PostFull | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    setPost(null);
    fetchPost(slug)
      .then((p) => {
        if (cancelled) return;
        setPost(p);
        setState('ready');
      })
      .catch((e: Error) => !cancelled && setState(/not found/i.test(e.message) ? 'missing' : 'error'));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Title, description and canonical follow the post once it has loaded.
  usePageMeta({
    path: `/blog/${slug}`,
    title: post ? seoTitle(post.title) : 'Blog | Matrix Solutions',
    description: post?.excerpt || 'News, guides and insights from Matrix Solutions.',
    noindex: state === 'missing',
    image: post?.cover ?? undefined,
  });

  if (state === 'missing') return <NotFound />;

  if (state === 'loading' || state === 'error' || !post) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500 px-6 text-center">
        {state === 'error' ? 'This post could not be loaded right now. Please try again shortly.' : <Loader2 className="animate-spin" />}
      </div>
    );
  }

  return (
    <article className="bg-white">
      <header className="container-custom pt-12 md:pt-16 max-w-4xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-matrix-blue-primary hover:underline mb-8">
          <ArrowLeft size={16} /> All posts
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-5">
          {post.category && <span className="px-3 py-1 rounded-full border border-matrix-navy text-matrix-navy">{post.category}</span>}
          <span>{formatDate(post.publishedAt)}</span>
          <span className="flex items-center gap-1">
            <Clock size={13} /> {readingMinutes(post.blocks)} min read
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-matrix-navy leading-tight">{post.title}</h1>
        {post.excerpt && <p className="mt-6 text-xl text-slate-600 font-medium leading-relaxed">{post.excerpt}</p>}
        {post.author && <p className="mt-6 text-sm font-bold text-matrix-navy">By {post.author}</p>}
      </header>

      {post.cover && (
        <div className="container-custom max-w-5xl mt-10">
          <img src={post.cover} alt={post.coverAlt} decoding="async" className="w-full h-auto max-h-[560px] object-cover rounded-2xl" />
        </div>
      )}

      <div className="container-custom max-w-4xl py-14 md:py-20">
        <div className="grid grid-cols-1 gap-10">
          {post.highlights.length > 0 && (
            <aside className="rounded-2xl bg-slate-50 border border-slate-100 p-7">
              <div className="text-sm font-extrabold uppercase tracking-widest text-matrix-blue-primary mb-3">In this article</div>
              <ul className="list-disc pl-5 space-y-2 text-slate-700 font-medium">
                {post.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </aside>
          )}
          <BlogBlocks blocks={post.blocks} />
        </div>

        <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <Link to="/blog" className="inline-flex items-center gap-2 font-bold text-matrix-blue-primary hover:underline">
            <ArrowLeft size={16} /> Back to the blog
          </Link>
          <Link to="/contact" className="btn-primary text-center">
            Talk to Matrix Solutions
          </Link>
        </div>
      </div>
    </article>
  );
}
