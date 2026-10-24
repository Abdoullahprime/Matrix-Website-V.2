import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import ChatWidget from './components/ChatWidget';
import Preloader from './components/Preloader';
import Home from './pages/Home';
import Solutions from './pages/Solutions';
import SolutionDetail from './pages/SolutionDetail';
import Clients from './pages/Clients';
import About from './pages/About';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import Partnership from './pages/Partnership';
import NotFound from './pages/NotFound';
import BlogIndex from './pages/BlogIndex';
import BlogPost from './pages/BlogPost';

// The admin area is only for staff, so it is loaded separately and never slows the public site.
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));

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
                <Route path="solutions/:slug" element={<SolutionDetail />} />
                <Route path="clients" element={<Clients />} />
                <Route path="partnership" element={<Partnership />} />
                <Route path="about" element={<About />} />
                <Route path="resources" element={<Resources />} />
                <Route path="blog" element={<BlogIndex />} />
                <Route path="blog/:slug" element={<BlogPost />} />
                <Route path="contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route
                path="admin/*"
                element={
                  <Suspense fallback={<div className="p-10 text-slate-500">Loading…</div>}>
                    <AdminApp />
                  </Suspense>
                }
              />
            </Routes>
            <ChatWidget />
          </motion.div>
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
}
