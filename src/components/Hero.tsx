import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Zap, Landmark, Users, BarChart3 } from 'lucide-react';

function DashboardIllustration() {
  return (
    <svg viewBox="0 0 500 500" className="w-full h-auto" role="img" aria-label="Illustration of an enterprise software dashboard">
      <defs>
        <linearGradient id="hero-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#114568" />
          <stop offset="100%" stopColor="#27506b" />
        </linearGradient>
      </defs>
      <rect width="500" height="500" rx="24" fill="url(#hero-bg)" />
      {/* Window chrome */}
      <rect x="40" y="40" width="420" height="420" rx="16" fill="#ffffff" opacity="0.06" />
      <circle cx="66" cy="66" r="5" fill="#7e9bb9" />
      <circle cx="84" cy="66" r="5" fill="#43789c" />
      <circle cx="102" cy="66" r="5" fill="#b8b8c1" />
      {/* Sidebar */}
      <rect x="56" y="90" width="90" height="350" rx="10" fill="#ffffff" opacity="0.08" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="68" y={108 + i * 34} width="66" height="10" rx="5" fill="#7e9bb9" opacity={i === 0 ? 0.9 : 0.35} />
      ))}
      {/* Stat cards */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={162 + i * 100} y="90" width="92" height="64" rx="10" fill="#ffffff" opacity="0.1" />
          <rect x={174 + i * 100} y="104" width="40" height="8" rx="4" fill="#7e9bb9" opacity="0.6" />
          <rect x={174 + i * 100} y="122" width="60" height="12" rx="6" fill="#ffffff" opacity="0.7" />
        </g>
      ))}
      {/* Chart panel */}
      <rect x="162" y="170" width="292" height="160" rx="10" fill="#ffffff" opacity="0.08" />
      <polyline
        points="180,300 230,265 280,285 330,230 380,245 435,195"
        fill="none"
        stroke="#7e9bb9"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[
        [180, 300], [230, 265], [280, 285], [330, 230], [380, 245], [435, 195],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="#ffffff" />
      ))}
      {/* Table rows */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="162" y={346 + i * 32} width="292" height="24" rx="6" fill="#ffffff" opacity={0.08 - i * 0.015} />
          <rect x="174" y={353 + i * 32} width="80" height="10" rx="5" fill="#7e9bb9" opacity="0.5" />
          <rect x="380" y={353 + i * 32} width="60" height="10" rx="5" fill="#7e9bb9" opacity="0.35" />
        </g>
      ))}
    </svg>
  );
}

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-matrix-gradient bezel-bottom">
      {/* Hero Content */}
      <div className="container-custom pt-20 pb-48 md:pt-32 md:pb-64">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-extrabold text-matrix-navy leading-[1.1]">
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

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            {/* Main Illustration */}
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-matrix-navy/20">
              <DashboardIllustration />
            </div>

            {/* Floating UI Elements */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-12 z-20 bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 hidden md:flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-matrix-blue-primary/10 rounded-xl flex items-center justify-center text-matrix-blue-primary">
                <Landmark size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-matrix-navy uppercase tracking-widest">Core Banking</div>
                <div className="text-[10px] font-bold text-slate-400">Oracle Gold Partner</div>
              </div>
              <div className="absolute -bottom-2 -left-2 bg-matrix-blue-primary text-white p-2 rounded-full shadow-lg">
                <Zap size={16} />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-12 -left-12 z-20 bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 hidden md:block max-w-[200px]"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-matrix-blue-primary">
                  <ShieldCheck size={20} />
                  <span className="text-xs font-bold text-matrix-navy uppercase tracking-widest">Trust Layer</span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 leading-tight">
                  Secure, compliant data processing for enterprise scale.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
