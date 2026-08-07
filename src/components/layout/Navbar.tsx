import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Dra. Patrícia', path: '/dra-patricia' },
    { name: 'Contato', path: '/#contato' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-clinic-bg border-b border-clinic-border transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-[84px]">
          
          {/* Left Side: Logo + Nav Links */}
          <div className="flex items-center gap-8 lg:gap-12">
            <Link to="/" className="flex items-center">
              <div className="relative w-[160px] md:w-[220px] h-[50px] md:h-[64px] overflow-hidden flex items-center justify-start">
                <img 
                  src="/logo.png" 
                  alt="Ferrer Innovare Clinic" 
                  className="absolute left-0 w-[220px] md:w-[300px] max-w-none h-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              </div>
              <span className="hidden font-serif text-2xl font-medium tracking-wide text-clinic-textPrimary">
                Ferrer Innovare
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className="text-clinic-textSecondary hover:text-clinic-textPrimary transition-colors text-xs font-semibold tracking-widest uppercase"
                >
                  {link.name}
                </a>
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
                <a
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-serif text-clinic-textPrimary hover:text-clinic-gold transition-colors"
                >
                  {link.name}
                </a>
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
