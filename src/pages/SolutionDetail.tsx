import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import solutionPages from '../data/solutionPages.json';
import usePageMeta from '../hooks/usePageMeta';
import { getPageMeta, solutionPath } from '../seo/meta';
import { clientLogo } from '../data/clientLogos';
import { clientDisplayName } from '../data/clients';
import Breadcrumbs from '../components/Breadcrumbs';
import FaqSection from '../components/FaqSection';
import SectionLabel from '../components/SectionLabel';
import NotFound from './NotFound';

function ClientCard({ name }: { name: string }) {
  const display = clientDisplayName(name);
  const logo = clientLogo(name);
  return (
    <li className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-white">
      <div className="w-14 h-14 shrink-0 flex items-center justify-center">
        {logo ? (
          <img src={logo} alt="" loading="lazy" decoding="async" className="max-h-14 max-w-full w-auto h-auto object-contain" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-matrix-navy text-white font-black text-xl flex items-center justify-center">
            {display.charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0 font-extrabold text-matrix-navy text-sm leading-snug">{display}</div>
    </li>
  );
}

export default function SolutionDetail() {
  const { slug } = useParams();
  const page = solutionPages.find((s) => s.slug === slug);

  usePageMeta(
    page
      ? getPageMeta(solutionPath(page.slug))
      : { path: '/404', title: 'Page not found | Matrix Solutions', description: 'This page does not exist.', noindex: true }
  );

  if (!page) return <NotFound />;

  const related = page.related
    .map((s) => solutionPages.find((p) => p.slug === s))
    .filter((p): p is (typeof solutionPages)[number] => Boolean(p));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white">
      {/* Intro band */}
      <section className="bg-matrix-dark-gradient text-white">
        <div className="container-custom py-16 md:py-24 space-y-8">
          <Breadcrumbs
            light
            items={[{ name: 'Home', to: '/' }, { name: 'Solutions', to: '/solutions' }, { name: page.navLabel }]}
          />
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">{page.h1}</h1>
            <p className="text-lg md:text-xl text-slate-200 font-medium leading-relaxed">{page.intro}</p>
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

      {/* What is included */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mb-14 space-y-4">
            <SectionLabel number="01">{page.includedHeading}</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-matrix-navy leading-tight">
              Everything you need, from one local team.
            </h2>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {page.included.map((item) => (
              <li key={item.name} className="p-8 rounded-2xl border border-slate-100 hover:border-matrix-blue-primary hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="text-matrix-blue-primary shrink-0 mt-1" size={22} aria-hidden="true" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-matrix-navy leading-snug">{item.name}</h3>
                    <p className="text-matrix-slate font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who uses it */}
      {page.clients.length > 0 && (
        <section className="section-padding bg-slate-50/70 border-y border-slate-100">
          <div className="container-custom">
            <div className="max-w-3xl mb-12 space-y-4">
              <SectionLabel number="02">In use today</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-extrabold text-matrix-navy leading-tight">{page.clientsHeading}</h2>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {page.clients.map((name) => (
                <ClientCard key={name} name={name} />
              ))}
            </ul>
            <p className="mt-8">
              <Link to="/clients" className="btn-link group">
                See all our clients
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>
        </section>
      )}

      <FaqSection
        items={page.faq}
        emitJsonLd={false}
        labelNumber={page.clients.length > 0 ? '03' : '02'}
        label="Common questions"
        heading="Questions about this solution."
        intro="Short answers to what organizations usually ask before they get in touch."
      />

      {/* Related solutions: real internal links, which help visitors and search engines alike */}
      <section className="section-padding bg-slate-50/70 border-t border-slate-100">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-extrabold text-matrix-navy mb-8">Related solutions</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  to={solutionPath(r.slug)}
                  className="block h-full p-8 rounded-2xl bg-white border border-slate-100 hover:border-matrix-blue-primary hover:shadow-xl transition-all group"
                >
                  <h3 className="text-xl font-extrabold text-matrix-navy mb-3 group-hover:text-matrix-blue-primary transition-colors">
                    {r.navLabel}
                  </h3>
                  <p className="text-sm text-matrix-slate font-medium leading-relaxed mb-5">{r.description}</p>
                  <span className="btn-link">
                    Learn more <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Call to action */}
      <section className="section-padding bg-matrix-navy text-white text-center">
        <div className="container-custom max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">See it working for your organization.</h2>
          <p className="text-lg text-slate-300 font-medium">
            Tell us what you need and a Matrix consultant will arrange a demo.
          </p>
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
