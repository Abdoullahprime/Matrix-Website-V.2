import React, { useEffect, useState } from 'react';

// Partner logos: drop a file in src/assets/partners/ and it appears here (name order = show order).
const modules = import.meta.glob('../assets/partners/*.{png,webp,jpg,jpeg,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const ORDER = ['oracle'];
const logos = Object.entries(modules)
  .map(([path, url]) => ({ name: (path.split('/').pop() ?? '').replace(/\.[^.]+$/, ''), url }))
  .sort((a, b) => {
    const ia = ORDER.indexOf(a.name);
    const ib = ORDER.indexOf(b.name);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.name.localeCompare(b.name);
  });

const TOUCH_HIGHLIGHT_MS = 6000;

/** A logo carousel with a heading and no names. Tap a logo on touch screens for colour. */
export default function PartnersCarousel({ title, tone = 'white' }: { title: string; tone?: 'white' | 'light' }) {
  const all = [...logos, ...logos, ...logos, ...logos];
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active === null) return;
    const clear = (e: PointerEvent) => {
      if (!(e.target as HTMLElement | null)?.closest('[data-partner-item]')) setActive(null);
    };
    const timer = window.setTimeout(() => setActive(null), TOUCH_HIGHLIGHT_MS);
    document.addEventListener('pointerdown', clear);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerdown', clear);
    };
  }, [active]);

  if (logos.length === 0) return null;
  const from = tone === 'light' ? 'from-slate-50' : 'from-white';

  return (
    <section className={`py-12 border-y border-slate-100 overflow-hidden ${tone === 'light' ? 'bg-slate-50' : 'bg-white'}`}>
      <div className="container-custom mb-8 text-center">
        <h2 className="text-sm font-extrabold text-matrix-navy uppercase tracking-[0.2em]">{title}</h2>
      </div>
      <div className="relative flex overflow-hidden">
        <div
          className="flex animate-marquee whitespace-nowrap gap-16 md:gap-28 py-4 items-center"
          style={{ animationPlayState: active !== null ? 'paused' : undefined }}
        >
          {all.map((logo, i) => {
            const isActive = active === i;
            return (
              <div
                key={i}
                data-partner-item
                onPointerDown={(e) => {
                  if (e.pointerType !== 'mouse') setActive(isActive ? null : i);
                }}
                className={`shrink-0 transition-all cursor-pointer hover:opacity-100 hover:grayscale-0 ${
                  isActive ? 'grayscale-0 opacity-100' : 'grayscale opacity-50'
                }`}
              >
                <img src={logo.url} alt="" decoding="async" loading="lazy" className="h-12 md:h-14 w-auto max-w-[180px] object-contain" />
              </div>
            );
          })}
        </div>
        <div className={`absolute inset-y-0 left-0 w-32 bg-gradient-to-r ${from} to-transparent z-10 pointer-events-none`} />
        <div className={`absolute inset-y-0 right-0 w-32 bg-gradient-to-l ${from} to-transparent z-10 pointer-events-none`} />
      </div>
    </section>
  );
}
