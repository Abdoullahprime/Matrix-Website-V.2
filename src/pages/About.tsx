import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const values = [
  { title: "Integrity", desc: "Transparent, auditable systems for high-trust environments." },
  { title: "Innovation", desc: "Modern tech stacks built for regional infrastructure." },
  { title: "Local Empowerment", desc: "100% local support team for immediate response." },
  { title: "Excellence", desc: "SLA-backed performance and security auditing." }
];

function CompanyIllustration() {
  return (
    <svg viewBox="0 0 400 500" className="w-full h-auto" role="img" aria-label="Abstract illustration of the Matrix Solutions diamond mark">
      <defs>
        <linearGradient id="about-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" rx="16" fill="url(#about-bg)" />
      <g transform="translate(200 250) rotate(45)">
        <rect x="-110" y="-110" width="220" height="220" fill="#114568" />
        <rect x="-78" y="-78" width="156" height="156" fill="#27506b" />
        <rect x="-48" y="-48" width="96" height="96" fill="#43789c" />
        <rect x="-20" y="-20" width="40" height="40" fill="#7e9bb9" />
      </g>
      <text x="200" y="452" textAnchor="middle" fill="#114568" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="16" letterSpacing="4">
        SINCE 2007
      </text>
    </svg>
  );
}

export default function About() {
  usePageMeta(
    'About Us',
    'Matrix Solutions Company Limited is an IT solutions integrator and Oracle Gold Partner providing enterprise software to government, financial and private sector organizations in West Africa.'
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white">
      <section className="section-padding border-b border-slate-100">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="space-y-6">
                <div className="text-matrix-blue-primary text-sm font-extrabold uppercase tracking-[0.2em]">
                  Our Story
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-matrix-navy leading-tight">
                  Expertise is <span className="text-matrix-blue-primary">built in</span>.
                </h1>
                <p className="text-xl text-matrix-slate leading-relaxed font-medium">
                  Matrix Solutions Company Limited is an information technology solutions company which combines a blend of new software and modern technology integrations to provide software solutions to meet the requirements of government, non-government and private sector organizations.
                </p>
                <p className="text-lg text-matrix-slate leading-relaxed">
                  As a <strong>GOLD PARTNER</strong> to Oracle Financial Services Software Limited and a certified implementation partner, we provide our clients with complete project life cycles—from strategy and design to development, implementation, training, and support services.
                </p>
                <p className="text-lg text-matrix-slate leading-relaxed">
                  Through our in-house development team, we have developed highly scalable web-based software solutions that can be operated on standalone systems, network environments, or in the Cloud, tailored to your organization's specific processing and reporting needs.
                </p>
                <p className="text-lg text-matrix-slate leading-relaxed">
                  Our pool of experts enables us to provide our clients with complete project life cycles and management services from strategy, design, development, implementation, training and support services. We believe strongly in building enduring relationships with our clients and focusing everything we do on meeting their needs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-matrix-blue-primary/10 rounded-xl flex items-center justify-center text-matrix-blue-primary shrink-0">
                    <Shield size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-matrix-navy">ISO-Aligned</h4>
                    <p className="text-xs text-matrix-slate font-medium">Methodology & Standards</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-matrix-blue-primary/10 rounded-xl flex items-center justify-center text-matrix-blue-primary shrink-0">
                    <Users size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-matrix-navy">100% Local</h4>
                    <p className="text-xs text-matrix-slate font-medium">Expert Support Team</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-matrix-navy/10 border border-slate-100">
                <CompanyIllustration />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-matrix-navy text-white p-10 rounded-2xl shadow-2xl max-w-xs hidden xl:block">
                <div className="text-5xl font-black mb-2">15+</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Years of Enterprise Excellence & Innovation</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-slate-50/50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-matrix-navy mb-6">Our Core Values</h2>
            <p className="text-matrix-slate text-xl font-medium">The principles that guide our engineering and client relationships.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-matrix-blue-primary/10 text-matrix-blue-primary rounded-xl flex items-center justify-center mb-8">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-2xl font-bold text-matrix-navy mb-4">{v.title}</h3>
                <p className="text-matrix-slate font-medium leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom text-center max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-matrix-navy">Meet the team behind Matrix</h2>
          <p className="text-matrix-slate text-xl font-medium">
            Our leadership and engineering teams are based in The Gambia and dedicated to West Africa's digital transformation. Get in touch to speak with us directly.
          </p>
          <div className="flex justify-center">
            <Link to="/contact" className="btn-primary inline-flex items-center gap-3">
              Contact Our Team
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
