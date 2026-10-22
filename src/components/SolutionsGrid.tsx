import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Landmark, Briefcase, ShieldCheck, Zap } from 'lucide-react';
import SectionLabel from './SectionLabel';

interface SolutionsGridProps {
  showCta?: boolean;
  label?: string;
  labelNumber?: string;
  /** The Solutions page uses h1; on the home page this stays h2. */
  headingLevel?: 'h1' | 'h2';
}

export default function SolutionsGrid({ showCta = true, label, labelNumber, headingLevel = 'h2' }: SolutionsGridProps) {
  const Heading = headingLevel;
  const solutions = [
    {
      title: "Banking & Finance",
      to: "/solutions/core-banking-microfinance-software-gambia",
      description: "Oracle Gold Partner providing core banking, internet banking, and micro-finance systems.",
      icon: <Landmark size={32} />,
      color: "bg-matrix-navy",
    },
    {
      title: "Enterprise Software",
      to: "/solutions/hr-payroll-software-gambia",
      description: "HRMS, Payroll, Accounting, and ERP solutions tailored for government and private sectors.",
      icon: <Briefcase size={32} />,
      color: "bg-matrix-blue-primary",
    },
    {
      title: "IT Infrastructure",
      to: "/solutions/it-infrastructure-cyber-security-gambia",
      description: "Backup, disaster recovery, 24/7 monitoring, and server management services.",
      icon: <Zap size={32} />,
      color: "bg-[#6366f1]",
    },
    {
      title: "Cyber Security",
      to: "/solutions/it-infrastructure-cyber-security-gambia",
      description: "Firewall management, vulnerability assessments, and incident response advisory.",
      icon: <ShieldCheck size={32} />,
      color: "bg-[#7c3aed]",
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          {label && labelNumber && <SectionLabel number={labelNumber}>{label}</SectionLabel>}
          <Heading className="text-4xl md:text-5xl font-extrabold text-matrix-navy">
            Launch faster with Matrix solutions, built for your industry.
          </Heading>
          <p className="text-lg text-slate-600 font-medium">
            Designed with industry expertise, these out-of-the-box solutions align with your workflows, data, and customer needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`${solution.color} sf-card text-white h-full flex flex-col`}
            >
              <h3 className="text-2xl font-extrabold mb-4 pr-12">{solution.title}</h3>
              <p className="text-white/80 font-medium leading-relaxed mb-12 flex-grow">
                {solution.description}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <Link to={solution.to} className="text-sm font-bold hover:underline flex items-center gap-2">
                  Learn more
                </Link>
                <div className="sf-card-badge text-white">
                  {solution.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {showCta && (
          <div className="mt-16 text-center">
            <Link to="/solutions" className="btn-secondary">
              See all solutions
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
