import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import Breadcrumbs from '../components/Breadcrumbs';
import BlogBlocks from '../components/BlogBlocks';
import OtherApps from '../components/OtherApps';
import NotFound from './NotFound';
import { Block, seoTitle } from '../lib/blog';

interface ProductPage {
  slug: string;
  product: string;
  title: string;
  excerpt: string;
  cover: string | null;
  coverAlt: string;
  highlights: string[];
  blocks: Block[];
}

/** A product's own page, written in the admin area (Solutions menu). */
export default function ProductSolutionPage({ slug }: { slug: string }) {
  const [page, setPage] = useState<ProductPage | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    setPage(null);
    fetch('/api/solutions.php?slug=' + encodeURIComponent(slug))
      .then(async (r) => {
        if (r.status === 404) return 'missing' as const;
        if (!r.ok) throw new Error('failed');
        return (await r.json()).page as ProductPage;
      })
      .then((d) => {
        if (cancelled) return;
        if (d === 'missing') setState('missing');
        else {
          setPage(d);
          setState('ready');
        }
      })
      .catch(() => !cancelled && setState('error'));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  usePageMeta({
    path: `/solutions/${slug}`,
    title: page ? seoTitle(page.title) : 'Solutions | Matrix Solutions',
    description: page?.excerpt || 'Software and IT services from Matrix Solutions in The Gambia.',
    noindex: state === 'missing',
    image: page?.cover ?? undefined,
  });

  if (state === 'missing') return <NotFound />;
  if (state !== 'ready' || !page) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500 px-6 text-center">
        {state === 'error' ? 'This page could not be loaded right now. Please try again shortly.' : <Loader2 className="animate-spin" />}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white">
      <section className="bg-matrix-dark-gradient text-white">
        <div className="container-custom py-16 md:py-24 space-y-8">
          <Breadcrumbs light items={[{ name: 'Home', to: '/' }, { name: 'Solutions', to: '/solutions' }, { name: page.product || page.title }]} />
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">{page.title}</h1>
            {page.excerpt && <p className="text-lg md:text-xl text-slate-200 font-medium leading-relaxed">{page.excerpt}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link to="/contact" className="btn-primary">
              Request a Demo
            </Link>
            <Link
              to="/solutions"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md font-bold border-2 border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              Browse all solutions
            </Link>
          </div>
        </div>
      </section>

      {page.cover && (
        <div className="container-custom max-w-5xl -mt-10 relative z-10">
          <img src={page.cover} alt={page.coverAlt} decoding="async" className="w-full h-auto max-h-[520px] object-cover rounded-2xl shadow-2xl" />
        </div>
      )}

      <section className="section-padding">
        <div className="container-custom max-w-6xl space-y-16">
          {page.highlights.length > 0 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-matrix-navy mb-6">Key features</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {page.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 p-5 rounded-2xl border border-slate-100">
                    <CheckCircle2 className="text-matrix-blue-primary shrink-0 mt-0.5" size={20} aria-hidden="true" />
                    <span className="font-medium text-slate-700 leading-snug">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <BlogBlocks blocks={page.blocks} spacious />
        </div>
      </section>

      <OtherApps currentSlug={page.slug} currentProduct={page.product} />

      <section className="section-padding bg-matrix-navy text-white text-center">
        <div className="container-custom max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">See it working for your organization.</h2>
          <p className="text-lg text-slate-300 font-medium">Tell us what you need and a Matrix consultant will arrange a demo.</p>
          <div className="flex justify-center">
            <Link to="/contact" className="btn-primary px-12 py-5 text-lg">
              Request a Demo
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
