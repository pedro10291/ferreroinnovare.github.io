import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'A Clínica', path: '/dra-patricia' },
    { name: 'Tratamentos', path: '/#tratamentos' },
    { name: 'Contato', path: '/#contato' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-clinic-bg/95 backdrop-blur-md border-b border-clinic-border/60 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-[70px] md:h-[90px]">
          
          {/* Left Side: Logo + Nav Links */}
          <div className="flex items-center gap-10 lg:gap-16">
            <Link to="/" className="flex items-center w-[120px] md:w-[220px] shrink-0 transition-opacity duration-300 hover:opacity-90">
              <img 
                src="/logo-ferrer-compact.png" 
                alt="Ferrer Innovare Clinic" 
                className="w-full h-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes('logo-ferrer-compact.png')) {
                    target.src = '/logo.png'; // fallback for existing logo
                  } else {
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }
                }}
              />
              <span className="hidden font-serif text-2xl font-medium tracking-wide text-clinic-textPrimary">
                Ferrer Innovare Clinic
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (location.hash && link.path.includes(location.hash));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`transition-colors duration-300 text-[11px] font-semibold tracking-[0.2em] uppercase ${
                      isActive ? 'text-clinic-goldDark' : 'text-clinic-textSecondary hover:text-clinic-textPrimary'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Right Side: CTA (Editorial/Alfaiataria look) */}
          <div className="hidden md:flex items-center">
            <Link
              to="/agendar"
              className="bg-clinic-textPrimary text-white px-8 h-12 flex items-center justify-center rounded-none text-[11px] font-semibold tracking-[0.2em] uppercase hover:bg-clinic-goldDark transition-colors duration-300"
            >
              Agendar Avaliação
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-clinic-textPrimary transition-colors focus:outline-none p-2"
            >
              {isOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-clinic-bg border-b border-clinic-border overflow-hidden"
          >
            <div className="px-6 pt-4 pb-8 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-serif text-clinic-textPrimary hover:text-clinic-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-clinic-border">
                <Link
                  to="/agendar"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-clinic-textPrimary text-white px-6 py-4 rounded-none text-xs font-semibold tracking-widest uppercase hover:bg-clinic-gold transition-colors"
                >
                  Agendar Avaliação
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
