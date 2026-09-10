import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const HeroEditorial = () => {
  return (
    <section className="bg-clinic-bg pt-6 md:pt-10 lg:pt-12 pb-12 md:pb-24 lg:pb-24 overflow-hidden">
      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 lg:px-12 flex flex-col lg:flex-row lg:items-center lg:gap-16 xl:gap-24">
        
        {/* Editorial Portrait (Top on Mobile, Left on Desktop) */}
        <div className="w-full lg:w-1/2 relative order-1 flex justify-center lg:justify-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
            className="w-full max-w-5xl lg:max-w-none"
          >
            {/* Extremely subtle editorial frame */}
            <div className="relative border border-clinic-border/40 p-2 lg:p-3 bg-white/40 shadow-sm">
              <img 
                src={`${import.meta.env.BASE_URL}dra-patricia.jpg`} 
                alt="Dra. Patricia Santana" 
                className="w-full h-auto object-contain mx-auto"
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Text Content (Bottom on Mobile, Right on Desktop) */}
        <div className="w-full lg:w-1/2 order-2 mt-8 lg:mt-0 text-center lg:text-left z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-4 md:space-y-6 lg:max-w-[560px]"
          >
            {/* Eyebrow - Desktop only or subtle on mobile */}
            <span className="hidden lg:block text-[10px] font-semibold tracking-[0.3em] uppercase text-clinic-goldDark mb-6">
              A Clínica
            </span>

            <h1 className="font-serif text-clinic-textPrimary">
              <span className="block text-4xl sm:text-6xl lg:text-[72px] xl:text-[80px] leading-[1.05] tracking-tight">
                Ferrer Innovare Clinic
              </span>
              <span className="block text-lg sm:text-2xl lg:text-3xl text-clinic-goldDark font-light leading-relaxed tracking-wider mt-2 lg:mt-4">
                Dra. Patricia Santana & Equipe
              </span>
            </h1>
            
            <p className="text-xs md:text-sm text-clinic-textSecondary font-semibold tracking-[0.25em] uppercase leading-relaxed max-w-md mx-auto lg:mx-0 pt-2 lg:pt-4">
              Estética Avançada e Saúde
            </p>
            
            <div className="pt-6 md:pt-8 flex flex-col items-center lg:items-start space-y-5">
              <Link
                to="/agendar"
                className="inline-flex items-center justify-center h-14 md:h-16 px-10 md:px-12 bg-clinic-textPrimary text-white text-[11px] md:text-xs font-semibold tracking-[0.25em] uppercase transition-colors duration-300 hover:bg-clinic-goldDark rounded-none shadow-sm"
              >
                Agendar Avaliação
              </Link>
              <Link
                to="/dra-patricia"
                className="inline-flex items-center gap-2 text-[10px] md:text-[11px] font-semibold tracking-[0.2em] uppercase text-clinic-textSecondary hover:text-clinic-goldDark transition-colors duration-300 group"
              >
                Sobre mim
                <span className="font-light group-hover:translate-x-[2px] transition-transform duration-300">→</span>
              </Link>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
