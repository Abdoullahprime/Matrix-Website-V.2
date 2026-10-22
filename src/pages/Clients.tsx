import React from 'react';
import { motion } from 'motion/react';
import ClientList from '../components/ClientList';
import CaseStudies from '../components/CaseStudies';
import LogoWall from '../components/LogoWall';
import usePageMeta from '../hooks/usePageMeta';
import { getPageMeta } from '../seo/meta';

export default function Clients() {
  usePageMeta(getPageMeta('/clients'));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <ClientList />
      <CaseStudies />
      <LogoWall />
    </motion.div>
  );
}
