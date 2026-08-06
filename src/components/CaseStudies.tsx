import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Landmark, Building2, HeartPulse, ShieldCheck } from 'lucide-react';

const sectors = [
  { icon: <Landmark size={22} />, label: 'Government & Revenue', detail: 'Revenue authorities, municipal councils, and public agencies' },
  { icon: <Building2 size={22} />, label: 'Banking & Finance', detail: 'Commercial banks, credit unions, and micro-finance institutions' },
  { icon: <HeartPulse size={22} />, label: 'Health & NGOs', detail: 'Hospitals and development organizations across the region' },
  { icon: <ShieldCheck size={22} />, label: 'Insurance & Enterprise', detail: 'Insurers, manufacturers, and service companies' },
];

export default function CaseStudies() {
  return (
    <section className="bg-matrix-dark-gradient text-white overflow-hidden">
      <div className="container-custom py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
              We understand what’s at stake when you count on us.
            </h2>
            <p className="text-xl text-slate-300 font-medium leading-relaxed">
              From national revenue collection to core banking and hospital payroll, our systems run
              mission-critical operations for institutions across The Gambia and West Africa.
            </p>
            <Link to="/clients" className="btn-primary inline-flex items-center gap-3">
              Explore Our Clients
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sectors.map((sector) => (
              <div key={sector.label} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4 hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-matrix-blue-primary/30 rounded-xl flex items-center justify-center text-matrix-blue-light">
                  {sector.icon}
                </div>
                <h3 className="text-lg font-extrabold">{sector.label}</h3>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">{sector.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
