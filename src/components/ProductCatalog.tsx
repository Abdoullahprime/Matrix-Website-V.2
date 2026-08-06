import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Server, Shield, Database, Globe, Cpu,
  Calculator, Users, Wallet, ShoppingCart,
  BarChart3, FileText, Truck, HelpCircle, Landmark,
  CreditCard, Smartphone, ShieldCheck, Hotel, Monitor,
  Wifi, Settings, Battery, HardDrive, Lock, Search, Info, X
} from 'lucide-react';

const productCategories = [
  {
    title: "Core Enterprise Products",
    icon: <Database className="text-matrix-blue-primary" />,
    items: [
      { name: "Accounting Management System", icon: <Calculator size={18} />, desc: "Comprehensive financial tracking, general ledger, and automated reporting for enterprise-level fiscal management." },
      { name: "Fixed Assets Management System", icon: <HardDrive size={18} />, desc: "Track, manage, and depreciate physical assets across multiple locations with full audit trails." },
      { name: "Human Resources Management System", icon: <Users size={18} />, desc: "Centralized employee records, performance tracking, and organizational mapping for modern workforces." },
      { name: "Payroll Management System", icon: <Wallet size={18} />, desc: "Automated salary processing, tax compliance, and benefit management with localized regulatory support." },
      { name: "Online Recruitment Management System", icon: <Search size={18} />, desc: "End-to-end applicant tracking, from job posting to onboarding, streamlining the hiring lifecycle." },
      { name: "Procurement System", icon: <ShoppingCart size={18} />, desc: "Manage vendor relationships, purchase orders, and inventory requests with multi-level approval workflows." },
      { name: "Stock Management System", icon: <BarChart3 size={18} />, desc: "Real-time inventory tracking, reorder alerts, and warehouse management for optimized supply chains." },
      { name: "Property Tax Management System", icon: <FileText size={18} />, desc: "Automated billing, collection, and reporting for municipal property taxes and land rates." },
      { name: "Loan Management System", icon: <CreditCard size={18} />, desc: "Complete lifecycle management for credit products, from application and scoring to disbursement and recovery." },
      { name: "Sales Management System", icon: <BarChart3 size={18} />, desc: "Track leads, manage pipelines, and analyze sales performance with integrated CRM capabilities." },
      { name: "Petty Cash System", icon: <Wallet size={18} />, desc: "Secure management of small-scale expenditures with digital receipts and automated reconciliation." },
      { name: "Vehicle Management System", icon: <Truck size={18} />, desc: "Fleet tracking, maintenance scheduling, and fuel consumption monitoring for corporate logistics." },
      { name: "Help Desk System", icon: <HelpCircle size={18} />, desc: "Internal and external support ticketing with SLA tracking and knowledge base integration." }
    ]
  },
  {
    title: "Banking & Financial Systems",
    icon: <Globe className="text-matrix-blue-primary" />,
    items: [
      { name: "Central Bank Compliance Reporting Interface System", icon: <ShieldCheck size={18} />, desc: "Automated data extraction and formatting for regulatory reporting to central banking authorities." },
      { name: "T-Bills Management System", icon: <Landmark size={18} />, desc: "Management of treasury bills, government bonds, and other fixed-income securities for financial institutions." },
      { name: "Internet Banking System", icon: <Smartphone size={18} />, desc: "Secure, feature-rich digital banking platform for retail and corporate customers." },
      { name: "Domestic Money Transfer System", icon: <CreditCard size={18} />, desc: "Real-time local remittance and settlement platform with multi-channel support." },
      { name: "Insurance Management System", icon: <Shield size={18} />, desc: "Policy administration, claims processing, and agent management for general and life insurance." },
      { name: "Micro Banker System for Micro Finance", icon: <Landmark size={18} />, desc: "Tailored core banking for MFIs, supporting group lending and specialized savings products." },
      { name: "Micro Banker System for Credit Union", icon: <Users size={18} />, desc: "Member-centric banking platform optimized for credit unions and cooperatives." },
      { name: "Micro Banker System for Islamic Micro Finance", icon: <Landmark size={18} />, desc: "Sharia-compliant financial management supporting Murabaha, Musharaka, and other Islamic modes." },
      { name: "Receipt System", icon: <FileText size={18} />, desc: "Digital and physical receipt generation with integrated payment gateway support." }
    ]
  },
  {
    title: "Specialized Solutions",
    icon: <Cpu className="text-matrix-blue-primary" />,
    items: [
      { name: "Hotel Front Office & Reservation System", icon: <Hotel size={18} />, desc: "Real-time room booking, guest check-in/out, and billing for hospitality management." },
      { name: "Hotel & Restaurant Management System", icon: <Hotel size={18} />, desc: "Integrated POS and back-office management for full-service hospitality establishments." },
      { name: "Banking Application", icon: <Smartphone size={18} />, desc: "Custom mobile and desktop applications for specialized banking workflows." },
      { name: "Software Development", icon: <Settings size={18} />, desc: "Bespoke software engineering tailored to unique institutional requirements." },
      { name: "Hardware Sales and Maintenance", icon: <Monitor size={18} />, desc: "Procurement and support for enterprise-grade servers, workstations, and peripherals." },
      { name: "Network Connectivity Solutions", icon: <Wifi size={18} />, desc: "Design and implementation of secure LAN/WAN and fiber-optic infrastructures." },
      { name: "Managed Services", icon: <Settings size={18} />, desc: "Outsourced IT operations management with 24/7 technical oversight." },
      { name: "Website Development and Hosting", icon: <Globe size={18} />, desc: "Professional web presence design with high-availability hosting solutions." },
      { name: "Power Backup System", icon: <Battery size={18} />, desc: "Industrial-grade UPS and solar backup solutions for uninterrupted operations." }
    ]
  },
  {
    title: "IT Services",
    icon: <Server className="text-matrix-blue-primary" />,
    items: [
      { name: "Backup and Disaster Recovery", icon: <Database size={18} />, desc: "Automated off-site backups and business continuity planning for data resilience." },
      { name: "Hosting & Colocations Services", icon: <Server size={18} />, desc: "Secure data center space and cloud hosting for mission-critical applications." },
      { name: "24/7 Infrastructure Monitoring", icon: <Monitor size={18} />, desc: "Proactive health tracking of servers, networks, and services with instant alerting." },
      { name: "Servers, Storage, Database, Cloud and Service Desk", icon: <HardDrive size={18} />, desc: "Comprehensive IT infrastructure management and support desk services." },
      { name: "24/7 Alert Monitoring & Threat Advisory", icon: <Shield size={18} />, desc: "Continuous security surveillance and real-time intelligence on emerging threats." },
      { name: "Firewall & Endpoint Security Management", icon: <Lock size={18} />, desc: "Management of network perimeters and device security to prevent unauthorized access." },
      { name: "Identity and Access Management", icon: <Users size={18} />, desc: "Secure user authentication and role-based access control across all systems." },
      { name: "Security Gap Assessment", icon: <ShieldCheck size={18} />, desc: "Comprehensive auditing of security posture to identify and remediate vulnerabilities." },
      { name: "Vulnerability Assessment (VA) & Penetration testing (PT)", icon: <ShieldCheck size={18} />, desc: "Rigorous testing of system defenses to ensure robustness against cyber attacks." }
    ]
  }
];

export default function ProductCatalog() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<{name: string, desc: string} | null>(null);

  return (
    <section className="relative bg-slate-50 pt-32 pb-48 overflow-hidden">
      {/* Oval Bezel Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] aspect-[2/1] bg-white rounded-[100%] -translate-y-1/2 shadow-sm border-b border-slate-100" />
      
      <div className="container-custom relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-matrix-blue-primary/10 text-matrix-blue-primary text-[10px] font-black uppercase tracking-widest mb-6">
            <Info size={14} />
            Our Ecosystem
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-matrix-navy mb-8 tracking-tight">
            One platform for <span className="text-matrix-blue-primary">all your needs</span>.
          </h2>
          <p className="text-matrix-slate text-xl font-medium leading-relaxed">
            A wide variety of generic software solutions, catering to your needs, no matter the industry.
          </p>
        </div>

        <div className="space-y-32">
          {productCategories.map((category, catIdx) => (
            <div key={catIdx} className="space-y-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-matrix-blue-primary/10 rounded-xl flex items-center justify-center text-matrix-blue-primary">
                    {category.icon}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-matrix-navy">{category.title}</h3>
                </div>
                <p className="text-matrix-slate font-medium max-w-md md:text-right">
                  Specialized tools designed to streamline {category.title.toLowerCase()} operations.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12">
                {category.items.map((item, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setSelectedProduct(item)}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 6) * 0.05 }}
                    className="flex flex-col items-center gap-4 group"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-matrix-blue-primary group-hover:shadow-xl group-hover:scale-105 group-hover:border-matrix-blue-primary/30 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-matrix-blue-primary transition-opacity" />
                      <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                        {React.cloneElement(item.icon as React.ReactElement<{ size?: number; strokeWidth?: number }>, { size: 40, strokeWidth: 1.5 })}
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-matrix-navy uppercase tracking-widest text-center leading-tight max-w-[120px] group-hover:text-matrix-blue-primary transition-colors">
                      {item.name.replace(' Management System', '').replace(' System', '')}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Product Info Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProduct(null)}
                className="absolute inset-0 bg-matrix-navy/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/20"
              >
                <div className="p-12">
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-matrix-blue-primary uppercase tracking-[0.3em]">Product Specification</div>
                      <h3 className="text-3xl font-extrabold text-matrix-navy leading-tight">{selectedProduct.name}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedProduct(null)}
                      className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-matrix-navy hover:text-white transition-all shadow-inner"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-8">
                    <p className="text-matrix-slate text-xl leading-relaxed font-medium">
                      {selectedProduct.desc}
                    </p>
                    <div className="pt-8 flex flex-col gap-4">
                      <button
                        onClick={() => navigate('/contact')}
                        className="btn-primary w-full py-5 text-lg shadow-lg shadow-matrix-blue-primary/20"
                      >
                        Request a Demo
                      </button>
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-matrix-navy transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="mt-40 p-12 bg-matrix-dark-gradient rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl shadow-matrix-navy/20">
          <div className="space-y-6 text-center md:text-left">
            <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-matrix-blue-light text-[10px] font-black uppercase tracking-widest">Strategic Alliance</div>
            <h3 className="text-4xl font-extrabold leading-tight">Oracle Gold Partner</h3>
            <p className="text-slate-300 max-w-xl font-medium text-lg">
              We are a certified implementation partner for Oracle Financial Services Software Limited, delivering world-class banking solutions to the region.
            </p>
          </div>
          <div className="bg-white p-10 rounded-[2rem] shadow-xl transform hover:rotate-2 transition-transform text-center">
            <div className="text-[#C74634] font-black text-3xl tracking-tight">ORACLE</div>
            <div className="text-matrix-navy font-black text-[10px] uppercase tracking-[0.2em] mt-4 border-t border-slate-100 pt-4">Gold Partner</div>
          </div>
        </div>
      </div>
    </section>
  );
}
