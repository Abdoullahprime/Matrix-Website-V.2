import React from 'react';
import { motion } from 'motion/react';
import SectionLabel from './SectionLabel';

// Taken from the project life cycle described on the About page:
// "strategy and design to development, implementation, training, and support".
const steps = [
  { title: 'Strategy', desc: 'We start by understanding your organization, its processes and what the system must achieve.' },
  { title: 'Design', desc: 'Requirements become a clear solution design, tailored to your processing and reporting needs.' },
  { title: 'Development', desc: 'Our in-house team builds or configures the system on scalable, web-based technology.' },
  { title: 'Implementation', desc: 'We deploy to your environment, whether standalone, networked or in the cloud, and migrate your data.' },
  { title: 'Training', desc: 'Your staff are trained so the system is used properly from the first day.' },
  { title: 'Support', desc: 'After go-live, our local team stays on hand to support and improve the system.' },
];

export default function ProcessStrip() {
  return (
    <section className="section-padding bg-slate-50/70 border-y border-slate-100">
      <div className="container-custom">
        <div className="max-w-3xl mb-16 space-y-4">
          <SectionLabel number="03">How we work</SectionLabel>
          <h2 className="text-4xl md:text-5xl font-extrabold text-matrix-navy leading-tight">
            Six steps, from first meeting to ongoing support.
          </h2>
          <p className="text-lg text-matrix-slate font-medium">
            A complete project life cycle under one team, so nothing falls between vendors.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-x-8 gap-y-12">
          {steps.map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="space-y-3 border-t-2 border-matrix-blue-primary/30 pt-5"
            >
              <div className="text-[11px] font-black text-matrix-blue-primary tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="text-xl font-extrabold text-matrix-navy">{step.title}</h3>
              <p className="text-sm text-matrix-slate font-medium leading-relaxed">{step.desc}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
