import React from 'react';
import { motion } from 'motion/react';
import ClientList from '../components/ClientList';
import CaseStudies from '../components/CaseStudies';
import LogoWall from '../components/LogoWall';
import usePageMeta from '../hooks/usePageMeta';

export default function Clients() {
  usePageMeta(
    'Our Clients',
    'Matrix Solutions serves government agencies, banks, hospitals and enterprises across The Gambia and West Africa. Browse our client network and implemented solutions.'
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <ClientList />
      <CaseStudies />
      <LogoWall />
    </motion.div>
  );
}
