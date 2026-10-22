import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  name: string;
  to?: string; // the last crumb (the current page) has no link
}

/** Trail such as Home / Solutions / HR & Payroll. Helps visitors and shows in search results. */
export default function Breadcrumbs({ items, light = false }: { items: Crumb[]; light?: boolean }) {
  const link = light ? 'text-slate-300 hover:text-white' : 'text-matrix-slate hover:text-matrix-navy';
  const current = light ? 'text-white' : 'text-matrix-navy';
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm font-medium">
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className={light ? 'text-slate-400' : 'text-slate-300'} aria-hidden="true" />}
            {item.to ? (
              <Link to={item.to} className={`${link} transition-colors`}>
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className={`font-bold ${current}`}>
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
