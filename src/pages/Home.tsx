import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, Globe, Handshake } from 'lucide-react';
import Hero from '../components/Hero';
import LogoWall from '../components/LogoWall';
import SolutionsGrid from '../components/SolutionsGrid';
import CaseStudies from '../components/CaseStudies';
import usePageMeta from '../hooks/usePageMeta';

const stats = [
  {
    value: '20+',
    label: 'Software Products',
    desc: 'A wide portfolio of enterprise software solutions, catering to your needs, no matter the industry.',
  },
  {
    value: '30+',
    label: 'Institutions Served',
    desc: 'Government agencies, banks, hospitals, and enterprises across the region run on Matrix systems.',
  },
  {
    value: '24/7',
    label: 'Support & Monitoring',
    desc: 'We are customer centric, with round-the-clock infrastructure monitoring and a local support team.',
  },
];

const expertise = [
  { title: 'Our People', desc: 'Dedicated specialists with deep domain expertise in your sector.', icon: <Users size={40} /> },
  { title: 'Our Partners', desc: 'A global network of technology and implementation leaders.', icon: <Globe size={40} /> },
  { title: 'Our Community', desc: 'Join a growing network of users sharing best practices and insights.', icon: <Handshake size={40} /> },
];

export default function Home() {
  usePageMeta(
    'Enterprise IT Solutions in The Gambia',
    'Enterprise software, core banking, HR & payroll, IT infrastructure and cyber security for government, financial and private sector organizations across West Africa.'
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Hero />
      <LogoWall />

      {/* Stats Section */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-4">
                <div className="text-5xl md:text-6xl font-extrabold text-matrix-navy">{stat.value}</div>
                <p className="text-lg text-matrix-slate font-medium">{stat.label}</p>
                <p className="text-sm text-matrix-slate">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SolutionsGrid />

      {/* Expertise Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-matrix-navy mb-6">Expertise is built in.</h2>
            <p className="text-matrix-slate text-xl font-medium">
              Our ecosystem of experts, partners, and community members ensures your success at every stage.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {expertise.map((item) => (
              <div key={item.title} className="p-10 rounded-2xl border border-slate-100 hover:border-matrix-blue-primary hover:shadow-xl transition-all group">
                <div className="text-matrix-blue-primary mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-2xl font-extrabold text-matrix-navy mb-4">{item.title}</h3>
                <p className="text-matrix-slate font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CaseStudies />

      {/* CTA Section */}
      <section className="section-padding bg-matrix-navy text-white text-center">
        <div className="container-custom max-w-4xl mx-auto space-y-10">
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Ready to see what Matrix can do for you?
          </h2>
          <div className="flex justify-center">
            <Link to="/contact" className="btn-primary px-12 py-6 text-xl">
              Request a Demo
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
