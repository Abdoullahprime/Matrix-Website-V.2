import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Landmark, Briefcase, ShieldCheck, Zap } from 'lucide-react';

interface SolutionsGridProps {
  showCta?: boolean;
}

export default function SolutionsGrid({ showCta = true }: SolutionsGridProps) {
  const solutions = [
    {
      title: "Banking & Finance",
      description: "Oracle Gold Partner providing core banking, internet banking, and micro-finance systems.",
      icon: <Landmark size={32} />,
      color: "bg-matrix-navy",
    },
    {
      title: "Enterprise Software",
      description: "HRMS, Payroll, Accounting, and ERP solutions tailored for government and private sectors.",
      icon: <Briefcase size={32} />,
      color: "bg-matrix-blue-primary",
    },
    {
      title: "IT Infrastructure",
      description: "Backup, disaster recovery, 24/7 monitoring, and server management services.",
      icon: <Zap size={32} />,
      color: "bg-[#6366f1]",
    },
    {
      title: "Cyber Security",
      description: "Firewall management, vulnerability assessments, and incident response advisory.",
      icon: <ShieldCheck size={32} />,
      color: "bg-[#7c3aed]",
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-matrix-navy">
            Launch faster with Matrix solutions, built for your industry.
          </h2>
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
                <Link to="/solutions" className="text-sm font-bold hover:underline flex items-center gap-2">
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
