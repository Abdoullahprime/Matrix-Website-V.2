import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Globe2, Handshake, Settings2, Store } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import { getPageMeta } from '../seo/meta';
import Breadcrumbs from '../components/Breadcrumbs';
import SectionLabel from '../components/SectionLabel';
import PartnersCarousel from '../components/PartnersCarousel';

const reasons = [
  {
    icon: <Globe2 size={26} />,
    title: 'Growing across Africa',
    text: 'Our goal is to bring Matrix software to organisations across Africa. We do it through partners who know their markets, their clients and their regulators.',
  },
  {
    icon: <CheckCircle2 size={26} />,
    title: 'Software that is already proven',
    text: 'HR and payroll, accounting, banking and microfinance, and IT infrastructure, built and supported by Matrix Solutions since 2007. We are an Oracle Gold Partner.',
  },
  {
    icon: <Handshake size={26} />,
    title: 'Support that makes you succeed',
    text: 'Training, demo access, co-branded materials and a named Matrix contact, so you are never selling or delivering alone.',
  },
];

const tiers = [
  {
    icon: <Store size={28} />,
    name: 'Reseller Partner',
    who: 'Resellers and distributors',
    commission: '5–7%',
    basis: 'on licence and SaaS sales',
    points: [
      'Sell Matrix products in your territory',
      'Optional exclusive territory rights',
      'Sales training and certification',
      'Co-branded marketing materials',
      'A dedicated partner contact at Matrix',
    ],
  },
  {
    icon: <Globe2 size={28} />,
    name: 'ICT Firm Partner',
    who: 'ICT firms and system integrators',
    commission: '15–25%',
    basis: 'on licence and SaaS sales',
    points: [
      'Sell and deliver Matrix solutions in your territory',
      'A higher margin for your greater sales effort and capability',
      'Optional exclusive territory rights',
      'Full sales and technical training',
      'Joint marketing and tender support',
    ],
  },
  {
    icon: <Settings2 size={28} />,
    name: 'Implementation Partner',
    who: 'Consulting firms with technical delivery teams',
    commission: '10–15%',
    basis: 'referral commission, plus your own implementation fees',
    points: [
      'Implement and support Matrix products for clients',
      'Keep the fees from your own implementation work',
      'Matrix certification for your implementers',
      'Access to technical documentation',
      'Joint tender submissions with Matrix',
    ],
  },
];

const offers = [
  { name: 'HR & Payroll', to: '/solutions/hr-payroll-software-gambia', text: 'HRMIS, payroll, employee self-service and online recruitment.' },
  { name: 'Accounting & Finance', to: '/solutions/accounting-software-gambia', text: 'Accounting, fixed assets, procurement, stock and petty cash.' },
  { name: 'Banking & Microfinance', to: '/solutions/core-banking-microfinance-software-gambia', text: 'Microfinance, credit union and Islamic microfinance banking, internet banking and loans.' },
  { name: 'IT Infrastructure & Security', to: '/solutions/it-infrastructure-cyber-security-gambia', text: 'Backup and recovery, monitoring, networks and cyber security services.' },
];

const steps = [
  { title: 'Apply', text: 'Tell us who you are, where you work and which partner type fits you.' },
  { title: 'Orientation call', text: 'A session with the Matrix team on our products, pricing and your target market.' },
  { title: 'Sign your partner agreement', text: 'One standard agreement covering commission, territory and use of the Matrix brand.' },
  { title: 'Start earning', text: 'Receive your partner kit, demo access and your Matrix contact, then introduce Matrix to your network.' },
];

export default function Partnership() {
  usePageMeta(getPageMeta('/partnership'));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white">
      <section className="bg-matrix-dark-gradient text-white">
        <div className="container-custom py-16 md:py-24 space-y-8">
          <Breadcrumbs light items={[{ name: 'Home', to: '/' }, { name: 'Partnership' }]} />
          <div className="max-w-3xl space-y-6">
            <div className="text-sm font-extrabold uppercase tracking-[0.2em] text-matrix-blue-light">Matrix Partner Network (MPN)</div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Grow your business with Matrix, across Africa.
            </h1>
            <p className="text-lg md:text-xl text-slate-200 font-medium leading-relaxed">
              Join the Matrix Partner Network and earn commission selling and delivering proven HR, payroll, accounting, banking and IT
              solutions to organisations in your market.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link to="/contact?interest=partnership" className="btn-primary">
              Become a partner
            </Link>
            <a
              href="#partner-types"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md font-bold border-2 border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              See partner types
            </a>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mb-14 space-y-4">
            <SectionLabel number="01">Why partner with us</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-matrix-navy leading-tight">
              A partner network built to reach more of Africa.
            </h2>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reasons.map((r) => (
              <li key={r.title} className="p-8 rounded-2xl border border-slate-100 hover:border-matrix-blue-primary hover:shadow-xl transition-all space-y-4">
                <div className="w-14 h-14 rounded-xl bg-matrix-blue-primary/10 text-matrix-blue-primary flex items-center justify-center">{r.icon}</div>
                <h3 className="text-xl font-extrabold text-matrix-navy leading-snug">{r.title}</h3>
                <p className="text-matrix-slate font-medium leading-relaxed">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="partner-types" className="section-padding bg-slate-50/70 border-y border-slate-100 scroll-mt-24">
        <div className="container-custom">
          <div className="max-w-3xl mb-14 space-y-4">
            <SectionLabel number="02">Partner types</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-matrix-navy leading-tight">Choose how you want to work with Matrix.</h2>
            <p className="text-lg text-matrix-slate font-medium">
              Commission rates are agreed in your partner agreement and depend on your territory and sales capacity.
            </p>
          </div>
          <ul className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {tiers.map((t) => (
              <li key={t.name} className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-matrix-blue-primary/10 text-matrix-blue-primary flex items-center justify-center">{t.icon}</div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-matrix-navy">{t.name}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">{t.who}</p>
                  </div>
                  <div>
                    <div className="text-4xl font-extrabold text-matrix-blue-primary tabular-nums">{t.commission}</div>
                    <div className="text-sm font-bold text-matrix-navy">{t.basis}</div>
                  </div>
                </div>
                <ul className="p-8 space-y-3 flex-1">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-matrix-slate font-medium leading-snug">
                      <CheckCircle2 size={18} className="text-matrix-blue-primary shrink-0 mt-0.5" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mb-14 space-y-4">
            <SectionLabel number="03">What you will offer</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-matrix-navy leading-tight">Solutions your clients already need.</h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {offers.map((o) => (
              <li key={o.to}>
                <Link to={o.to} className="group block h-full p-8 rounded-2xl border border-slate-100 hover:border-matrix-blue-primary hover:shadow-xl transition-all">
                  <h3 className="text-xl font-extrabold text-matrix-navy mb-2 group-hover:text-matrix-blue-primary transition-colors">{o.name}</h3>
                  <p className="text-matrix-slate font-medium leading-relaxed mb-4">{o.text}</p>
                  <span className="btn-link">
                    Learn more <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-padding bg-slate-50/70 border-y border-slate-100">
        <div className="container-custom max-w-4xl">
          <div className="mb-12 space-y-4">
            <SectionLabel number="04">How to join</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-matrix-navy leading-tight">Four steps to becoming a partner.</h2>
          </div>
          <ol className="space-y-8">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-6">
                <span className="w-12 h-12 shrink-0 rounded-full bg-matrix-navy text-white font-extrabold text-lg flex items-center justify-center">{i + 1}</span>
                <div className="space-y-1 pt-1">
                  <h3 className="text-xl font-extrabold text-matrix-navy">{s.title}</h3>
                  <p className="text-matrix-slate font-medium leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-padding bg-matrix-navy text-white text-center">
        <div className="container-custom max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">Interested in joining the Matrix Partner Network?</h2>
          <p className="text-lg text-slate-300 font-medium">
            Tell us about your business and your market. Our team will contact you to talk through the right partner type.
          </p>
          <div className="flex justify-center">
            <Link to="/contact?interest=partnership" className="btn-primary px-12 py-5 text-lg">
              Become a partner
            </Link>
          </div>
        </div>
      </section>

      <PartnersCarousel title="Our Partners" />
    </motion.div>
  );
}
