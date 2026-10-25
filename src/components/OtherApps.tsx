import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fixedSolutionSlug, productCategories, productSlug } from '../data/products';

interface Card {
  name: string;
  desc: string;
  icon: React.ReactElement<{ size?: number; strokeWidth?: number }>;
  to: string;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * "A standalone or one suite": a random three of OTHER products at the bottom of a product page.
 * Only products that really have a page to open are offered, and no two cards go to the same page.
 */
export default function OtherApps({ currentSlug, currentProduct, count = 3 }: { currentSlug: string; currentProduct?: string; count?: number }) {
  const [ownPages, setOwnPages] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/solutions.php')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => !cancelled && setOwnPages(new Set(d ? (d.pages as { slug: string }[]).map((p) => p.slug) : [])))
      .catch(() => !cancelled && setOwnPages(new Set()));
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo<Card[]>(() => {
    if (!ownPages) return [];
    const seen = new Set<string>([currentSlug]);
    const out: Card[] = [];
    const all = productCategories.flatMap((c) => c.items);
    for (const item of shuffle(all)) {
      if (item.name === currentProduct) continue;
      const own = productSlug(item.name);
      const dest = ownPages.has(own) ? own : fixedSolutionSlug(item.name);
      if (!dest || seen.has(dest)) continue;
      seen.add(dest);
      out.push({ name: item.name, desc: item.desc, icon: item.icon as Card['icon'], to: `/solutions/${dest}` });
      if (out.length >= count) break;
    }
    return out;
  }, [ownPages, currentSlug, currentProduct, count]);

  if (cards.length === 0) return null;

  return (
    <section className="section-padding bg-slate-50/70 border-t border-slate-100">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-matrix-navy leading-tight">A standalone or one suite.</h2>
          <p className="text-lg text-slate-600 font-medium">Use any Matrix solution on its own, or combine several as one suite. Here are a few more to explore.</p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c) => (
            <li key={c.to}>
              <Link
                to={c.to}
                className="group flex h-full items-start gap-5 p-6 rounded-2xl bg-white border border-slate-100 hover:border-matrix-blue-primary hover:shadow-xl transition-all"
              >
                <span className="w-14 h-14 shrink-0 rounded-xl bg-matrix-blue-primary/10 text-matrix-blue-primary flex items-center justify-center">
                  {React.cloneElement(c.icon, { size: 28, strokeWidth: 1.6 })}
                </span>
                <span className="space-y-2">
                  <span className="block font-extrabold text-matrix-navy leading-snug group-hover:text-matrix-blue-primary transition-colors">{c.name}</span>
                  <span className="block text-sm text-slate-600 font-medium leading-relaxed line-clamp-2">{c.desc}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center">
          <Link to="/solutions" className="btn-link group">
            See all solutions
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </p>
      </div>
    </section>
  );
}
