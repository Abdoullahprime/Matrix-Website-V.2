import React from 'react';
import { motion } from 'motion/react';
import SolutionsGrid from '../components/SolutionsGrid';
import ProductCatalog from '../components/ProductCatalog';
import usePageMeta from '../hooks/usePageMeta';
import { getPageMeta } from '../seo/meta';

export default function Solutions() {
  usePageMeta(getPageMeta('/solutions'));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <SolutionsGrid showCta={false} headingLevel="h1" />
      <ProductCatalog />
    </motion.div>
  );
}
