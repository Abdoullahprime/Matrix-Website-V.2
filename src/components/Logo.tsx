import React from 'react';

export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Matrix Solutions diamond logo mark">
      <g transform="rotate(45 60 60)">
        <rect x="19" y="19" width="82" height="82" fill="#114568" />
        <rect x="30" y="30" width="60" height="60" fill="#2c6485" />
        <rect x="40" y="40" width="40" height="40" fill="#43789c" />
        <rect x="49" y="49" width="22" height="22" fill="#7e9bb9" />
      </g>
      <text
        x="60"
        y="63.5"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Inter, ui-sans-serif, sans-serif"
        fontWeight="800"
        fontSize="9"
        textLength="100"
        lengthAdjust="spacingAndGlyphs"
      >
        MX + AX + TX + RX + IX
      </text>
    </svg>
  );
}

export default function Logo({ className = "", light = false }: { className?: string, light?: boolean }) {
  const primaryColor = light ? "#FFFFFF" : "#114568";
  const redColor = light ? "#FFFFFF" : "#B22222";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark className="w-14 h-14 shrink-0" />

      {/* Logo Text */}
      <div className="flex flex-col leading-[0.85]">
        <div className="flex flex-col -space-y-0.5">
          <span className="text-lg font-black tracking-[0.08em]" style={{ color: primaryColor }}>MATRIX</span>
          <span className="text-lg font-black tracking-[0.08em]" style={{ color: primaryColor }}>SOLUTIONS</span>
        </div>
        <span className="text-[8px] font-bold uppercase tracking-[0.25em] mt-1" style={{ color: primaryColor }}>Company Limited</span>
        <span className="text-[7px] font-bold mt-0.5" style={{ color: redColor }}>Information Technology Solutions Integrator</span>
      </div>
    </div>
  );
}
