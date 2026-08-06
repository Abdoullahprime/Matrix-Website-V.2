import React from 'react';

export default function Logo({ className = "", light = false }: { className?: string, light?: boolean }) {
  const primaryColor = light ? "#FFFFFF" : "#114568";
  const secondaryColor = light ? "#FFFFFF" : "#43789c";
  const redColor = light ? "#FFFFFF" : "#A52A2A";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Diamond Logo Mark */}
      <div className="relative w-10 h-10 flex items-center justify-center rotate-45 shrink-0">
        {/* Concentric Diamonds */}
        <div className="absolute inset-0 border-[2.5px] border-matrix-navy opacity-100 bg-matrix-navy"></div>
        <div className="absolute inset-[15%] border-[1.5px] border-matrix-blue-dark opacity-80 bg-matrix-blue-dark"></div>
        <div className="absolute inset-[30%] border-[1.5px] border-matrix-blue-primary opacity-60 bg-matrix-blue-primary"></div>
        <div className="absolute inset-[45%] border-[1px] border-matrix-blue-light opacity-40 bg-matrix-blue-light"></div>
        
        {/* Text inside diamond - very small */}
        <div className="absolute inset-0 flex items-center justify-center -rotate-45">
          <span className="text-[4px] font-bold text-white tracking-tighter whitespace-nowrap">
            MX + AX + TX + RX + IX
          </span>
        </div>
      </div>

      {/* Logo Text */}
      <div className="flex flex-col leading-[0.85]">
        <div className="flex flex-col -space-y-0.5">
          <span className="text-lg font-black tracking-tight" style={{ color: primaryColor }}>MATRIX</span>
          <span className="text-lg font-black tracking-tight" style={{ color: primaryColor }}>SOLUTIONS</span>
        </div>
        <span className="text-[8px] font-bold uppercase tracking-wider mt-1" style={{ color: primaryColor }}>COMPANY LIMITED</span>
        <span className="text-[6px] font-medium italic mt-0.5" style={{ color: redColor }}>Information Technology Solutions Integrator</span>
      </div>
    </div>
  );
}
