import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, X } from 'lucide-react';

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

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface CardPos {
  top: number;
  left: number;
  placement: Placement;
  arrowTop: number;
  arrowLeft: number;
}

const GAP = 12;    // distance between tile and card
const MARGIN = 12; // minimum distance from viewport edges

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export default function ClientList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [active, setActive] = useState<{ name: string; rect: DOMRect } | null>(null);
  const [pos, setPos] = useState<CardPos | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const lastPointerType = useRef('mouse');

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

  const cancelClose = () => window.clearTimeout(closeTimer.current);

  const close = () => {
    cancelClose();
    setActive(null);
    setPos(null);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(close, 150);
  };

  const open = (name: string, el: HTMLElement) => {
    cancelClose();
    // Keep any existing pos: useLayoutEffect recomputes before the next paint,
    // so the card moves to the new tile without flickering through opacity 0.
    setActive({ name, rect: el.getBoundingClientRect() });
  };

  // Position the card after it renders: pick the side with room, clamp into the viewport
  useLayoutEffect(() => {
    if (!active || !cardRef.current) return;
    const card = cardRef.current;
    const r = active.rect;
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const fits: Record<Placement, boolean> = {
      top: r.top - GAP - ch >= MARGIN,
      bottom: r.bottom + GAP + ch <= vh - MARGIN,
      right: r.right + GAP + cw <= vw - MARGIN,
      left: r.left - GAP - cw >= MARGIN,
    };
    const placement =
      (['top', 'bottom', 'right', 'left'] as Placement[]).find((p) => fits[p]) ?? 'bottom';

    let top: number;
    let left: number;
    if (placement === 'top' || placement === 'bottom') {
      top = placement === 'top' ? r.top - GAP - ch : r.bottom + GAP;
      left = clamp(r.left + r.width / 2 - cw / 2, MARGIN, vw - cw - MARGIN);
      top = clamp(top, MARGIN, vh - ch - MARGIN);
    } else {
      left = placement === 'right' ? r.right + GAP : r.left - GAP - cw;
      top = clamp(r.top + r.height / 2 - ch / 2, MARGIN, vh - ch - MARGIN);
    }

    setPos({
      top,
      left,
      placement,
      arrowLeft: clamp(r.left + r.width / 2 - left, 20, cw - 20),
      arrowTop: clamp(r.top + r.height / 2 - top, 20, ch - 20),
    });
  }, [active]);

  // Close on outside tap, Escape, scroll, or resize
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (cardRef.current?.contains(target)) return;
      if (target.closest?.('[data-client-tile]')) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.name]);

  const arrowStyle = (p: CardPos): React.CSSProperties => {
    switch (p.placement) {
      case 'top': return { left: p.arrowLeft - 8, bottom: -6 };
      case 'bottom': return { left: p.arrowLeft - 8, top: -6 };
      case 'left': return { top: p.arrowTop - 8, right: -6 };
      case 'right': return { top: p.arrowTop - 8, left: -6 };
    }
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-matrix-navy">Our Client Network</h2>
            <p className="text-matrix-slate font-medium">Hover over or tap a client to see implemented solutions.</p>
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
            <motion.button
              key={name}
              type="button"
              data-client-tile
              aria-expanded={active?.name === name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onPointerDown={(e) => { lastPointerType.current = e.pointerType; }}
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') open(name, e.currentTarget); }}
              onPointerLeave={(e) => { if (e.pointerType === 'mouse') scheduleClose(); }}
              onClick={(e) => {
                if (lastPointerType.current === 'mouse') {
                  open(name, e.currentTarget);
                } else if (active?.name === name) {
                  close();
                } else {
                  open(name, e.currentTarget);
                }
              }}
              onFocus={(e) => open(name, e.currentTarget)}
              onBlur={(e) => {
                if (!cardRef.current?.contains(e.relatedTarget as Node)) scheduleClose();
              }}
              className="aspect-square bg-slate-50 rounded-2xl flex flex-col items-center justify-center p-6 border border-slate-100 hover:border-matrix-blue-primary focus-visible:border-matrix-blue-primary hover:bg-white transition-all cursor-pointer shadow-sm hover:shadow-xl group outline-none focus-visible:ring-2 focus-visible:ring-matrix-blue-primary/30"
            >
              <div className="w-16 h-16 bg-matrix-navy rounded-xl flex items-center justify-center text-white font-black text-3xl mb-4 group-hover:bg-matrix-blue-primary transition-colors">
                {name.charAt(0)}
              </div>
              <div className="text-[10px] font-black text-matrix-navy uppercase tracking-widest text-center leading-tight line-clamp-2">
                {name.split(' - ')[0]}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Client detail card. Portalled to <body>: an ancestor with a transform
            (the page's motion wrapper) would otherwise anchor `fixed` to itself
            instead of the viewport, breaking the edge clamping below. */}
        {createPortal(
        <AnimatePresence>
          {active && (
            <motion.div
              key="client-card"
              ref={cardRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: pos ? 1 : 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: -9999 }}
              className="fixed z-50 w-72 max-w-[calc(100vw-24px)]"
              role="dialog"
              aria-label={`Solutions implemented for ${active.name}`}
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') cancelClose(); }}
              onPointerLeave={(e) => { if (e.pointerType === 'mouse') scheduleClose(); }}
              onPointerDown={cancelClose}
            >
              <div className="bg-matrix-navy text-white p-6 rounded-2xl shadow-2xl relative">
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close client details"
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
                <div className="text-xs font-black text-matrix-blue-light uppercase tracking-[0.2em] mb-3 pr-8">Client Profile</div>
                <h4 className="text-lg font-extrabold mb-4 leading-tight pr-4">{active.name}</h4>
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2">Solutions Implemented</div>
                  <ul className="space-y-2">
                    {groupedClients[active.name]?.map((product, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-xs font-medium text-slate-200">
                        <ChevronRight size={14} className="text-matrix-blue-primary shrink-0 mt-0.5" />
                        {product}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Arrow pointing at the tile */}
                {pos && (
                  <div className="absolute w-4 h-4 bg-matrix-navy rotate-45" style={arrowStyle(pos)} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
        )}

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
