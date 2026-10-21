import React from 'react';

interface SectionLabelProps {
  number: string;
  children: React.ReactNode;
  light?: boolean;
  className?: string;
}

/** Small numbered eyebrow, e.g. "03 // How we work". Gives long pages wayfinding. */
export default function SectionLabel({ number, children, light = false, className = '' }: SectionLabelProps) {
  return (
    <div
      className={`text-[10px] font-black uppercase tracking-[0.3em] ${
        light ? 'text-matrix-blue-light' : 'text-matrix-blue-primary'
      } ${className}`}
    >
      {number} <span aria-hidden="true">//</span> {children}
    </div>
  );
}
