import React from 'react';

const logos = [
  { name: "GRA - GAMBIA REVENUE AUTHORITY" },
  { name: "TBL - TRUST BANK GAMBIA LIMITED" },
  { name: "NCAC - NATIONAL ARTS AND CULTURE" },
  { name: "RFH - RIDERS FOR HEALTH" },
  { name: "NFSPMC - NATIONAL FOOD SECURITY PRODUCTION AND MARKETING CORPORATION" },
  { name: "BAC - BRIKAMA AREA COUNCIL" },
  { name: "SAMA KAIRO" },
  { name: "LOGIX" },
  { name: "EFANET" },
  { name: "IHRDA - INSTITUTE FOR HUMAN RIGHTS AND DEVELOPMENT IN AFRICA" },
  { name: "SUNSHINE INSURANCE" },
  { name: "BANJUL FISHERIES JETTY" },
  { name: "ATLANTIC CLEANING SERVICES" },
  { name: "BANSANG HOSPITAL" },
  { name: "KGH - KANIFING GENERAL HOSPITAL" },
  { name: "GPPC - GAMBIA PRINTING AND PUBLISHING CORPORATION" },
  { name: "MUHAMMED SILLAH & SONS" },
  { name: "KMC - KANIFING MUNICIPAL COUNCIL" },
  { name: "GLMA - GAMBIA LIVESTOCK MARKETING AGENCY" },
  { name: "JAH MULTI INDUSTRIES" },
  { name: "SOMAGEC" },
  { name: "GNIC - GAMBIA NATIONAL INSURANCE COMPANY" },
  { name: "BSIC - BANQUE SAHELO-SAHARIENNE POUR L'INVESTISSEMENT ET LE COMMERCE" },
  { name: "SAFE HAND CREDIT UNION" },
];

export default function LogoWall() {
  // Duplicate logos for seamless loop
  const allLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <section className="py-12 bg-white border-y border-slate-100 overflow-hidden">
      <div className="container-custom mb-8">
        <div className="text-center">
          <p className="text-sm font-extrabold text-matrix-navy uppercase tracking-[0.2em]">Trusted by many Institutions across the region</p>
        </div>
      </div>
      
      <div className="relative flex overflow-hidden group">
        <div className="flex animate-marquee whitespace-nowrap gap-12 md:gap-24 py-4 items-center">
          {allLogos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center gap-4 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer group/logo shrink-0"
            >
              <div className="w-10 h-10 bg-matrix-navy rounded-lg flex items-center justify-center text-white font-black text-xl group-hover/logo:bg-matrix-blue-primary transition-colors">
                {logo.name.charAt(0)}
              </div>
              <span className="text-xs font-black text-matrix-navy text-left max-w-[120px] leading-tight uppercase tracking-tight whitespace-normal">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
        
        {/* Gradient overlays for smooth fade */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
}
