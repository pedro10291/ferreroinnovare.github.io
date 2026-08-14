import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const HeroEditorial = () => {
  return (
    <section className="bg-clinic-bg pt-32 md:pt-48 pb-20 md:pb-32 overflow-hidden">
      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 lg:px-12 flex flex-col">
        
        {/* Text Content (Bottom on Mobile, Top on Desktop) */}
        <div className="w-full max-w-4xl mx-auto order-2 md:order-1 mt-12 md:mt-0 mb-0 md:mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-4 md:space-y-6"
          >
            <h1 className="font-serif text-clinic-textPrimary">
              <span className="block text-4xl sm:text-6xl lg:text-[76px] leading-[1.05] tracking-tight">
                Ferrer Innovare Clinic
              </span>
              <span className="block text-lg sm:text-2xl lg:text-3xl text-clinic-goldDark font-light leading-relaxed tracking-wider mt-2">
                Dra. Patricia Santana & Equipe
              </span>
            </h1>
            
            <p className="text-xs md:text-sm text-clinic-textSecondary font-semibold tracking-[0.25em] uppercase leading-relaxed max-w-md mx-auto">
              Estética Avançada e Saúde
            </p>
            
            <div className="pt-6 md:pt-8">
              <Link
                to="/agendar"
                className="inline-flex items-center justify-center h-14 md:h-16 px-10 md:px-12 bg-clinic-textPrimary text-white text-[11px] md:text-xs font-semibold tracking-[0.25em] uppercase transition-colors duration-300 hover:bg-clinic-goldDark rounded-none shadow-sm"
              >
                Agendar Avaliação
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Editorial Portrait (Top on Mobile, Bottom on Desktop) */}
        <div className="w-full relative order-1 md:order-2 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
            className="w-full max-w-5xl"
          >
            <div className="relative border border-clinic-border/40 p-2 bg-white/40 shadow-sm">
              <img 
                src="/foto_equipe.jpg" 
                alt="Equipe Ferrer Innovare Clinic" 
                className="w-full h-auto object-contain mx-auto"
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
