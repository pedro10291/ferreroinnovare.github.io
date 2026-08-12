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
    <nav className="fixed w-full z-50 bg-clinic-bg border-b border-clinic-border transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-[64px] md:h-[84px]">
          
          {/* Left Side: Logo + Nav Links */}
          <div className="flex items-center gap-8 lg:gap-12">
            <Link to="/" className="flex items-center w-[110px] md:w-[210px] shrink-0">
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
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-clinic-textSecondary hover:text-clinic-textPrimary transition-colors text-xs font-semibold tracking-widest uppercase"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right Side: CTA */}
          <div className="hidden md:flex items-center">
            <Link
              to="/agendar"
              className="bg-clinic-textPrimary text-white px-8 h-12 flex items-center rounded-2xl text-xs font-semibold tracking-widest uppercase hover:bg-clinic-goldDark transition-colors duration-500"
            >
              Agendar Avaliação
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-clinic-textPrimary transition-colors focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
            transition={{ duration: 0.4, ease: "easeInOut" }}
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
                  className="block w-full text-center bg-clinic-textPrimary text-white px-6 py-4 rounded-xl text-sm font-medium tracking-widest uppercase hover:bg-clinic-gold transition-colors"
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
