import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ChevronRight } from 'lucide-react';

const clientData = [
  { client: "GRA - GAMBIA REVENUE AUTHORITY", product: "Human Resources Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "TBL - TRUST BANK GAMBIA LIMITED", product: "Inventory Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "TBL - TRUST BANK GAMBIA LIMITED", product: "Online Recruitment Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "TBL - TRUST BANK GAMBIA LIMITED", product: "Central Bank Compliance Reporting Interface System", date: "10 Nov 2025", type: "Standard" },
  { client: "NCAC - NATIONAL ARTS AND CULTURE", product: "Human Resource and Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "RFH - RIDERS FOR HEALTH", product: "Human Resource and Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "NFSPMC - NATIONAL FOOD SECURITY PRODUCTION AND MARKETING CORPORATION", product: "Human Resource and Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "NFSPMC - NATIONAL FOOD SECURITY PRODUCTION AND MARKETING CORPORATION", product: "POS System", date: "10 Nov 2025", type: "Standard" },
  { client: "BAC - BRIKAMA AREA COUNCIL", product: "Human Resource and Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "BAC - BRIKAMA AREA COUNCIL", product: "Accounts Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "SAMA KAIRO", product: "Human Resource and Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "LOGIX", product: "Human Resource and Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "EFANET", product: "Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "EFANET", product: "Document Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "IHRDA - INSTITUTE FOR HUMAN RIGHTS AND DEVELOPMENT IN AFRICA", product: "Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "IHRDA - INSTITUTE FOR HUMAN RIGHTS AND DEVELOPMENT IN AFRICA", product: "Accounts Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "SUNSHINE INSURANCE", product: "Human Resource and Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "BANJUL FISHERIES JETTY", product: "Accounts Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "ATLANTIC CLEANING SERVICES", product: "Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "BANSANG HOSPITAL", product: "Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "BANSANG HOSPITAL", product: "Human Resource and Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "KGH - KANIFING GENERAL HOSPITAL", product: "Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "KGH - KANIFING GENERAL HOSPITAL", product: "Human Resource and Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "GPPC - GAMBIA PRINTING AND PUBLISHING CORPORATION", product: "Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "MUHAMMED SILLAH & SONS", product: "POS System", date: "10 Nov 2025", type: "Standard" },
  { client: "KMC - KANIFING MUNICIPAL COUNCIL", product: "Property Tax Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "GLMA - GAMBIA LIVESTOCK MARKETING AGENCY", product: "Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "JAH MULTI INDUSTRIES", product: "Cement Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "SOMAGEC", product: "Payroll Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "GNIC - GAMBIA NATIONAL INSURANCE COMPANY", product: "Fixed Assets Management System", date: "10 Nov 2025", type: "Standard" },
  { client: "BSIC - BANQUE SAHELO-SAHARIENNE POUR L'INVESTISSEMENT ET LE COMMERCE", product: "Central Bank Compliance Reporting Interface System", date: "10 Nov 2025", type: "Standard" },
  { client: "SAFE HAND CREDIT UNION", product: "Micro Banker for Credit Union System", date: "10 Nov 2025", type: "Standard" },
];

export default function ClientList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredClient, setHoveredClient] = useState<string | null>(null);

  // Group products by client
  const groupedClients = clientData.reduce((acc, curr) => {
    if (!acc[curr.client]) {
      acc[curr.client] = [];
    }
    acc[curr.client].push(curr.product);
    return acc;
  }, {} as Record<string, string[]>);

  const clientNames = Object.keys(groupedClients);

  const filteredClientNames = clientNames.filter(name => 
    name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    groupedClients[name].some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-matrix-navy">Our Client Network</h2>
            <p className="text-matrix-slate font-medium">Hover over a logo to see implemented solutions.</p>
          </div>
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search clients or solutions..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-matrix-blue-primary focus:ring-2 focus:ring-matrix-blue-primary/10 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {filteredClientNames.map((name, index) => (
            <div 
              key={index}
              className="relative group"
              onMouseEnter={() => setHoveredClient(name)}
              onMouseLeave={() => setHoveredClient(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="aspect-square bg-slate-50 rounded-2xl flex flex-col items-center justify-center p-6 border border-slate-100 group-hover:border-matrix-blue-primary group-hover:bg-white transition-all cursor-pointer shadow-sm group-hover:shadow-xl"
              >
                <div className="w-16 h-16 bg-matrix-navy rounded-xl flex items-center justify-center text-white font-black text-3xl mb-4 group-hover:bg-matrix-blue-primary transition-colors">
                  {name.charAt(0)}
                </div>
                <div className="text-[10px] font-black text-matrix-navy uppercase tracking-widest text-center leading-tight line-clamp-2">
                  {name.split(' - ')[0]}
                </div>
              </motion.div>

              {/* Hover Modal / Tooltip */}
              <AnimatePresence>
                {hoveredClient === name && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 pointer-events-none"
                  >
                    <div className="bg-matrix-navy text-white p-6 rounded-2xl shadow-2xl relative">
                      <div className="text-xs font-black text-matrix-blue-light uppercase tracking-[0.2em] mb-3">Client Profile</div>
                      <h4 className="text-lg font-extrabold mb-4 leading-tight">{name}</h4>
                      <div className="space-y-3">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2">Solutions Implemented</div>
                        <ul className="space-y-2">
                          {groupedClients[name].map((product, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2 text-xs font-medium text-slate-200">
                              <ChevronRight size={14} className="text-matrix-blue-primary shrink-0 mt-0.5" />
                              {product}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-4 bg-matrix-navy rotate-45 -translate-y-2" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {filteredClientNames.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="text-slate-300">
              <Search size={48} className="mx-auto opacity-20" />
            </div>
            <p className="text-matrix-slate font-medium">No clients found for "{searchTerm}"</p>
          </div>
        )}
      </div>
    </section>
  );
}
