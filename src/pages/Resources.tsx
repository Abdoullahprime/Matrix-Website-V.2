import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileText, ArrowRight } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';

const resources = [
  { title: 'Company Profile', desc: 'An overview of Matrix Solutions, our history, partnerships, and service portfolio.' },
  { title: 'HRMIS & Payroll Brochure', desc: 'Features and technical details of our Human Resources and Payroll Management Systems.' },
  { title: 'Banking Systems Overview', desc: 'Our core banking, micro-finance, and compliance reporting solutions for financial institutions.' },
  { title: 'IT Services Catalogue', desc: 'Infrastructure monitoring, backup and disaster recovery, and managed security services.' },
];

export default function Resources() {
  usePageMeta(
    'Resources',
    'Request Matrix Solutions company profiles, product brochures, and service catalogues for enterprise software, banking systems, and IT services.'
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white">
      <div className="bg-matrix-navy py-24 text-white">
        <div className="container-custom">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">Resources</h1>
          <p className="text-xl text-slate-300 max-w-2xl font-medium">
            Company profiles, product brochures, and service catalogues — available on request from our team.
          </p>
        </div>
      </div>

      <div className="section-padding container-custom">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {resources.map((item) => (
            <Link
              key={item.title}
              to="/contact"
              className="p-10 bg-white rounded-2xl border border-slate-100 flex items-center justify-between gap-6 group hover:border-matrix-blue-primary hover:shadow-2xl hover:shadow-matrix-navy/5 transition-all"
            >
              <div className="text-left space-y-2">
                <h2 className="text-xl font-extrabold text-matrix-navy group-hover:text-matrix-blue-primary transition-colors">{item.title}</h2>
                <p className="text-sm text-matrix-slate font-medium leading-relaxed">{item.desc}</p>
                <p className="text-xs text-matrix-blue-primary uppercase tracking-widest font-bold flex items-center gap-2 pt-2">
                  Request a copy
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
              <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-matrix-navy group-hover:bg-matrix-blue-primary group-hover:text-white transition-all shrink-0">
                <FileText size={24} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
