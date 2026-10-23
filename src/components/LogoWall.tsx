import React, { useEffect, useState } from 'react';
import { clientLogo } from '../data/clientLogos';
import { clientDisplayName, clientNames } from '../data/clients';

// Same clients, same order as the client list: both read src/data/clients.ts.
const logos = clientNames.map((name) => ({ name }));

// On a touch screen there is no hover, so tapping a logo shows it in colour for a few seconds.
const TOUCH_HIGHLIGHT_MS = 6000;

export default function LogoWall() {
  // Duplicate logos for seamless loop
  const allLogos = [...logos, ...logos, ...logos, ...logos];
  const [active, setActive] = useState<number | null>(null);

  // Tapping anywhere else, or waiting, puts the logo back to grey.
  useEffect(() => {
    if (active === null) return;
    const clearOnOutsideTap = (e: PointerEvent) => {
      if (!(e.target as HTMLElement | null)?.closest('[data-logo-item]')) setActive(null);
    };
    const timer = window.setTimeout(() => setActive(null), TOUCH_HIGHLIGHT_MS);
    document.addEventListener('pointerdown', clearOnOutsideTap);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerdown', clearOnOutsideTap);
    };
  }, [active]);

  return (
    <section className="py-12 bg-white border-y border-slate-100 overflow-hidden">
      <div className="container-custom mb-8">
        <div className="text-center">
          <p className="text-sm font-extrabold text-matrix-navy uppercase tracking-[0.2em]">Trusted by many Institutions across the region</p>
        </div>
      </div>

      <div className="relative flex overflow-hidden group">
        <div
          className="flex animate-marquee whitespace-nowrap gap-12 md:gap-24 py-4 items-center"
          // Hold the carousel still while a logo is highlighted, so it can be looked at.
          style={{ animationPlayState: active !== null ? 'paused' : undefined }}
        >
          {allLogos.map((logo, index) => {
            const src = clientLogo(logo.name);
            const display = clientDisplayName(logo.name);
            const isActive = active === index;
            return (
              <div
                key={index}
                data-logo-item
                onPointerDown={(e) => {
                  // Mouse users already get colour on hover; this is for touch and pen.
                  if (e.pointerType !== 'mouse') setActive(isActive ? null : index);
                }}
                className={`flex items-center gap-4 transition-all cursor-pointer group/logo shrink-0 hover:opacity-100 hover:grayscale-0 ${
                  isActive ? 'grayscale-0 opacity-100' : 'grayscale opacity-40'
                }`}
              >
                {src ? (
                  <img
                    src={src}
                    alt=""
                    decoding="async"
                    fetchPriority="low"
                    className="h-14 w-auto max-w-[104px] object-contain shrink-0"
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-xl transition-colors group-hover/logo:bg-matrix-blue-primary ${
                      isActive ? 'bg-matrix-blue-primary' : 'bg-matrix-navy'
                    }`}
                  >
                    {display.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-black text-matrix-navy text-left max-w-[150px] leading-tight uppercase tracking-tight whitespace-normal">
                  {display}
                </span>
              </div>
            );
          })}
        </div>

        {/* Gradient overlays for smooth fade */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
}
