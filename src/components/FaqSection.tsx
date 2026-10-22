import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, ArrowRight } from 'lucide-react';
import SectionLabel from './SectionLabel';

// Answers only restate what the rest of the site already says about Matrix.
export interface FaqItem {
  q: string;
  a: string;
}

export const HOME_FAQS: FaqItem[] = [
  {
    q: 'What does Matrix Solutions do?',
    a: 'Matrix Solutions is an information technology solutions company. We build and implement software for government, non-government and private sector organizations, deliver core banking and financial systems as an Oracle Financial Services Software gold partner, and provide IT infrastructure and cyber security services.',
  },
  {
    q: 'Who do you work with?',
    a: 'Our clients include revenue authorities, municipal councils, banks, credit unions, insurers, hospitals, NGOs and private companies across The Gambia. You can browse them on our Clients page.',
  },
  {
    q: 'Can the systems run on our own servers or in the cloud?',
    a: 'Both. Our web-based solutions can be operated on standalone systems, in a network environment, or in the cloud, depending on what suits your organization.',
  },
  {
    q: 'Do you only supply software?',
    a: 'No. We cover the complete project life cycle, from strategy and design through development, implementation, training and support. We also supply hardware, networking, hosting, backup and disaster recovery, and managed IT services.',
  },
  {
    q: 'Is support provided locally?',
    a: 'Yes. Support comes from our local team in The Gambia, and we offer 24/7 infrastructure monitoring as a managed service for organizations that need round-the-clock coverage.',
  },
  {
    q: 'How do we get started?',
    a: 'Request a demo through our contact page, or call or email us directly. A Matrix consultant will get back to you to understand your requirements.',
  },
];

interface FaqSectionProps {
  items?: FaqItem[];
  labelNumber?: string;
  label?: string;
  heading?: string;
  intro?: string;
  /** Emit FAQPage structured data from here. Solution pages get it from the build instead. */
  emitJsonLd?: boolean;
}

export default function FaqSection({
  items = HOME_FAQS,
  labelNumber = '05',
  label = 'Questions we get asked',
  heading = 'Before you get in touch.',
  intro = 'The short answers to what organizations usually ask us first.',
  emitJsonLd = true,
}: FaqSectionProps) {
  const [open, setOpen] = useState<number | null>(0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section className="section-padding bg-white">
      {emitJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-12 lg:gap-20 items-start">
          <div className="space-y-5 lg:sticky lg:top-32">
            <SectionLabel number={labelNumber}>{label}</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-extrabold text-matrix-navy leading-tight">
              {heading}
            </h2>
            <p className="text-matrix-slate text-lg font-medium">
              {intro}
            </p>
            <Link to="/contact" className="btn-link group">
              Ask us something else
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-button-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-6 py-6 text-left group"
                    >
                      <span className="text-lg md:text-xl font-extrabold text-matrix-navy group-hover:text-matrix-blue-primary transition-colors">
                        {item.q}
                      </span>
                      <span
                        className={`w-8 h-8 shrink-0 rounded-full border flex items-center justify-center transition-all ${
                          isOpen
                            ? 'bg-matrix-blue-primary border-matrix-blue-primary text-white rotate-45'
                            : 'border-slate-300 text-matrix-navy group-hover:border-matrix-blue-primary'
                        }`}
                      >
                        <Plus size={16} />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-button-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-7 pr-12 text-matrix-slate font-medium leading-relaxed">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
