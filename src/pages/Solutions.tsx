import React from 'react';
import { motion } from 'motion/react';
import SolutionsGrid from '../components/SolutionsGrid';
import ProductCatalog from '../components/ProductCatalog';
import usePageMeta from '../hooks/usePageMeta';

export default function Solutions() {
  usePageMeta(
    'Solutions',
    'Explore Matrix Solutions products: core banking and financial systems, HR & payroll, accounting and ERP, IT infrastructure, and cyber security services.'
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <SolutionsGrid showCta={false} />
      <ProductCatalog />
    </motion.div>
  );
}
