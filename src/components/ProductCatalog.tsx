import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X } from 'lucide-react';
import { fixedSolutionSlug, productCategories, productSlug } from '../data/products';

export default function ProductCatalog() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<{name: string, desc: string} | null>(null);
  // Products that have their own page written in the admin area (a failed load just means none).
  const [ownPages, setOwnPages] = useState<Map<string, string>>(new Map());
  useEffect(() => {
    fetch('/api/solutions.php')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        // product (by its address-style name) -> the page that opens for it
        const map = new Map<string, string>();
        for (const p of d.pages as { slug: string; product: string; also?: string[] }[]) {
          for (const name of [p.product, ...(p.also ?? [])]) if (name) map.set(productSlug(name), p.slug);
        }
        setOwnPages(map);
      })
      .catch(() => undefined);
  }, []);

  // A product opens its own page if it has one, else the fixed solution page that covers it,
  // else the quick "Request a Demo" card.
  const openProduct = (item: { name: string; desc: string }) => {
    const own = ownPages.get(productSlug(item.name));
    if (own) return navigate(`/solutions/${own}`);
    const fixed = fixedSolutionSlug(item.name);
    if (fixed) return navigate(`/solutions/${fixed}`);
    setSelectedProduct(item);
  };

  return (
    <section className="relative bg-slate-50 pb-48 overflow-hidden">
      {/* Intro block. The white oval is sized to THIS block (twice its height, centred
          on its top edge), so its lowest point always sits at the bottom of the intro
          and the product categories below can never run into the curve. */}
      <div className="relative pt-16 md:pt-20 pb-28">
        <div className="absolute left-1/2 -translate-x-1/2 top-[-100%] h-[200%] w-[150%] bg-white rounded-[100%] shadow-sm border-b border-slate-100" />

        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-matrix-blue-primary/10 text-matrix-blue-primary text-[10px] font-black uppercase tracking-widest mb-6">
              <Info size={14} />
              Our Ecosystem
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-matrix-navy mb-8 tracking-tight">
              One platform for <span className="text-matrix-blue-primary">all your needs</span>.
            </h1>
            <p className="text-matrix-slate text-xl font-medium leading-relaxed">
              A wide variety of generic software solutions, catering to your needs, no matter the industry.
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom relative z-10 pt-20">
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
                    onClick={() => openProduct(item)}
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
