import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Preloader from './components/Preloader';
import Home from './pages/Home';
import Solutions from './pages/Solutions';
import Clients from './pages/Clients';
import About from './pages/About';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

const PRELOADER_KEY = 'matrix-preloader-shown';

export default function App() {
  const [loading, setLoading] = useState(() => {
    try {
      return sessionStorage.getItem(PRELOADER_KEY) !== '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
      try {
        sessionStorage.setItem(PRELOADER_KEY, '1');
      } catch {
        // sessionStorage unavailable; preloader will simply show again next load
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        {loading ? (
          <Preloader key="loader" />
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="solutions" element={<Solutions />} />
                <Route path="clients" element={<Clients />} />
                <Route path="about" element={<About />} />
                <Route path="resources" element={<Resources />} />
                <Route path="contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
}
