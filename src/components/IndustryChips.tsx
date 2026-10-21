import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionLabel from './SectionLabel';

// Sectors drawn from the existing client list and product catalogue.
const industries = [
  'Government & Public Sector',
  'Revenue Authorities',
  'Municipal Councils',
  'Commercial Banking',
  'Microfinance & Credit Unions',
  'Islamic Finance',
  'Insurance',
  'Healthcare',
  'NGOs & Development',
  'Hospitality',
  'Manufacturing',
  'Retail & POS',
  'Logistics & Fleet',
];

export default function IndustryChips() {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-10 lg:gap-16 items-start">
          <div className="space-y-4">
            <SectionLabel number="04">Sectors we serve</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-extrabold text-matrix-navy leading-tight">
              Applied across the institutions that run the country.
            </h2>
          </div>
          <div className="space-y-8">
            <ul className="flex flex-wrap gap-3">
              {industries.map((name) => (
                <li
                  key={name}
                  className="px-5 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-bold text-matrix-navy hover:border-matrix-blue-primary hover:text-matrix-blue-primary transition-colors"
                >
                  {name}
                </li>
              ))}
            </ul>
            <Link to="/clients" className="btn-link group">
              See who we work with
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
