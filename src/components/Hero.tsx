import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
// Imported (not placed in public/) so the build gives them a content hash, which lets the
// server cache them for a year.
import desktopShot from '../assets/hris-desktop.webp';
import mobileShot from '../assets/hris-mobile.webp';

// Every one of these is a kind of organisation Matrix already serves (see the client list).
const WORDS = ['Banks', 'Hospitals', 'Councils', 'Insurers', 'Agencies', 'Businesses'];
const ROTATE_MS = 2600;
const EASE = [0.22, 1, 0.36, 1] as const;
const FULL_SENTENCE = 'Banks, hospitals, councils, insurers, agencies and businesses run on Matrix.';

/** The word that changes. Words slide through a clipped window, so the layout never moves. */
function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Hold still while the tab is in the background: the browser pauses animations there, and
    // a running timer would queue up word changes that all play at once on return.
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((n) => (n + 1) % WORDS.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="relative block h-[1.2em] overflow-hidden text-matrix-blue-primary">
      <AnimatePresence initial={false}>
        <motion.span
          key={WORDS[index]}
          className="absolute inset-x-0 top-0 block"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** "run on Matrix." with each word rising into place. */
function Tagline({ animate }: { animate: boolean }) {
  return (
    <span className="flex flex-wrap gap-x-[0.28em]">
      {['run', 'on', 'Matrix.'].map((word, i) => (
        <span key={word} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <motion.span
            className="inline-block"
            initial={animate ? { y: '115%' } : false}
            animate={{ y: '0%' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 + i * 0.1 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  // People who have asked their device to reduce motion get a still headline.
  const reduceMotion = useReducedMotion() ?? false;

  const fadeUp = (delay: number) => ({
    initial: reduceMotion ? false : ({ opacity: 0, y: 18 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  });

  return (
    <div className="relative overflow-hidden bg-matrix-gradient bezel-bottom">
      {/* Hero Content */}
      <div className="container-custom pt-20 pb-40 md:pt-28 md:pb-56">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-16 lg:gap-10 items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <motion.p
                {...fadeUp(0)}
                className="text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] text-matrix-blue-primary"
              >
                Enterprise software &amp; IT services in The Gambia
              </motion.p>
              {/* Screen readers get the whole sentence once, not a word that keeps changing. */}
              <h1 className="text-5xl sm:text-6xl font-extrabold text-matrix-navy leading-[1.1] tracking-tight">
                <span className="sr-only">{FULL_SENTENCE}</span>
                <span aria-hidden="true" className="block">
                  {reduceMotion ? (
                    <span className="block text-matrix-blue-primary">{WORDS[0]}</span>
                  ) : (
                    <RotatingWord />
                  )}
                  <Tagline animate={!reduceMotion} />
                </span>
              </h1>

              <motion.p
                {...fadeUp(0.55)}
                className="text-xl md:text-2xl text-matrix-slate font-medium max-w-xl leading-relaxed"
              >
                Banking systems, HR and payroll, IT infrastructure and cyber security,
                delivered by one local team in The Gambia.
              </motion.p>
            </div>

            <motion.div
              {...fadeUp(0.75)}
              className="flex flex-col sm:flex-row items-center gap-6 pt-4"
            >
              <Link to="/contact" className="btn-primary w-full sm:w-auto">
                Request a Demo
              </Link>
              <Link to="/solutions" className="btn-link group">
                Explore Solutions
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Product showcase: desktop window with the phone view overlapping its corner.
              z-20 keeps it above the curved white bezel at the bottom of the hero. */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="relative z-20 pb-10 md:pb-14 pr-3 md:pr-8 lg:-mr-10 xl:-mr-16"
          >
            <div className="relative">
              <img
                src={desktopShot}
                alt="Matrix HRIS dashboard on a desktop browser, showing workforce totals, new joins and pending approvals"
                width={1400}
                height={943}
                fetchPriority="high"
                decoding="async"
                className="w-full h-auto select-none"
              />
              <motion.img
                src={mobileShot}
                alt="The same Matrix HRIS dashboard on a mobile phone"
                width={400}
                height={786}
                decoding="async"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.5 }}
                className="absolute -bottom-10 md:-bottom-14 -right-3 md:-right-8 w-[33%] md:w-[27%] h-auto select-none"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
