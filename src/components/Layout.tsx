import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { Menu, X, Globe, Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import Logo from './Logo';

const navItems = [
  { name: 'Solutions', to: '/solutions' },
  { name: 'Clients', to: '/clients' },
  { name: 'About', to: '/about' },
  { name: 'Resources', to: '/resources' },
];

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-matrix-navy text-white py-2 text-[10px] font-bold uppercase tracking-widest hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex justify-end gap-8">
          <span className="flex items-center gap-2">
            <Globe size={12} />
            West Africa (EN)
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`glass-nav transition-all duration-300 ${scrolled ? 'py-3 shadow-md' : 'py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" aria-label="Matrix Solutions home">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-bold transition-colors hover:text-matrix-blue-primary ${
                    isActive ? 'text-matrix-blue-primary' : 'text-matrix-navy'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <Link to="/contact" className="btn-primary py-3 px-8 text-sm">
              Request a Demo
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-matrix-navy"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-xl"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-lg font-bold text-left ${
                        isActive ? 'text-matrix-blue-primary' : 'text-matrix-navy'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
                <Link
                  to="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-primary w-full"
                >
                  Request a Demo
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-matrix-navy text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            <div className="space-y-8">
              <Logo light />
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                Empowering West Africa's digital transformation through secure, scalable, and compliant enterprise software since 2007.
              </p>
              <div className="flex gap-4">
                <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="Matrix Solutions on LinkedIn" className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-matrix-blue-primary hover:border-matrix-blue-primary transition-all">
                  <Linkedin size={18} />
                </a>
                <a href="https://x.com/" target="_blank" rel="noreferrer" aria-label="Matrix Solutions on X" className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-matrix-blue-primary hover:border-matrix-blue-primary transition-all">
                  <Twitter size={18} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-8 uppercase text-xs tracking-widest">Solutions</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><Link to="/solutions" className="hover:text-white transition-colors">Public Sector & Governance</Link></li>
                <li><Link to="/solutions" className="hover:text-white transition-colors">Financial & Banking Systems</Link></li>
                <li><Link to="/solutions" className="hover:text-white transition-colors">Human Capital Management</Link></li>
                <li><Link to="/solutions" className="hover:text-white transition-colors">Enterprise Operations</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-8 uppercase text-xs tracking-widest">Company</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><Link to="/about" className="hover:text-white transition-colors">About Matrix</Link></li>
                <li><Link to="/clients" className="hover:text-white transition-colors">Our Clients</Link></li>
                <li><Link to="/resources" className="hover:text-white transition-colors">Resources</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Sales</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-8 uppercase text-xs tracking-widest">Contact Us</h4>
              <ul className="space-y-6 text-sm text-slate-400 font-medium">
                <li className="flex gap-4">
                  <MapPin size={20} className="text-matrix-blue-light shrink-0" />
                  <span>Alhagie Kebba Conteh Memorial Plaza, Kanifing East Layout - KMC, P.O. BOX 699, Banjul, The Gambia</span>
                </li>
                <li className="flex gap-4">
                  <Phone size={20} className="text-matrix-blue-light shrink-0" />
                  <span>(+220) 7101931 | 2893652 | 3888551</span>
                </li>
                <li className="flex gap-4">
                  <Mail size={20} className="text-matrix-blue-light shrink-0" />
                  <a href="mailto:info@matrixgambia.com" className="hover:text-white transition-colors">info@matrixgambia.com</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 text-xs text-slate-500 font-bold uppercase tracking-widest">
            <p>© {new Date().getFullYear()} Matrix Solutions Company Limited. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
