import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-matrix-gradient bezel-bottom">
      {/* Hero Content */}
      <div className="container-custom pt-20 pb-40 md:pt-28 md:pb-56">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-16 lg:gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold text-matrix-navy leading-[1.1]">
                More <span className="text-matrix-blue-primary">for your mission.</span>
              </h1>
              <p className="text-xl md:text-2xl text-matrix-slate font-medium max-w-xl leading-relaxed">
                Essential solutions for the organizations that change the world.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <Link to="/contact" className="btn-primary w-full sm:w-auto">
                Request a Demo
              </Link>
              <Link to="/solutions" className="btn-link group">
                Explore Solutions
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

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
                src="/hris-desktop.webp"
                alt="Matrix HRIS dashboard on a desktop browser, showing workforce totals, new joins and pending approvals"
                width={2000}
                height={1347}
                fetchPriority="high"
                decoding="async"
                className="w-full h-auto select-none"
              />
              <motion.img
                src="/hris-mobile.webp"
                alt="The same Matrix HRIS dashboard on a mobile phone"
                width={560}
                height={1101}
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
