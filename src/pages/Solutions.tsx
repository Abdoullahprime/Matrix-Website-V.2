import React from 'react';
import { motion } from 'motion/react';
import ProductCatalog from '../components/ProductCatalog';
import PartnersCarousel from '../components/PartnersCarousel';
import usePageMeta from '../hooks/usePageMeta';
import { getPageMeta } from '../seo/meta';

export default function Solutions() {
  usePageMeta(getPageMeta('/solutions'));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <ProductCatalog />
      <PartnersCarousel title="Our Valued Partners" />
    </motion.div>
  );
}
