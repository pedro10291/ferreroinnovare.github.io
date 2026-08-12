import React from 'react';
import { Link } from 'react-router-dom';

export const HeroEditorial = () => {
  return (
    <section className="bg-clinic-bg pt-28 md:pt-40 pb-16 md:pb-24 overflow-hidden">
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col">
        
        {/* Text Content (Bottom on Mobile, Top on Desktop) */}
        <div className="w-full max-w-5xl mx-auto order-2 md:order-1 mt-10 md:mt-0 mb-0 md:mb-16 text-center">
          <h1 className="font-serif text-clinic-textPrimary mb-4 md:mb-6">
            <span className="block text-[36px] sm:text-5xl lg:text-[72px] leading-[1.05] mb-2 sm:mb-4 tracking-tight">
              Ferrer Innovare Clinic
            </span>
            <span className="block text-xl sm:text-3xl lg:text-4xl text-clinic-goldDark font-light leading-relaxed tracking-wide">
              Dra. Patricia Santana & Equipe
            </span>
          </h1>
          
          <p className="text-[16px] md:text-xl text-clinic-textSecondary font-light leading-relaxed mb-10 md:mb-12 tracking-wide uppercase">
            Estética Avançada e Saúde
          </p>
          
          <Link
            to="/agendar"
            className="inline-flex items-center justify-center h-14 md:h-16 px-10 md:px-12 bg-clinic-textPrimary text-white text-[12px] md:text-sm font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-clinic-goldDark hover:shadow-lg rounded-none"
          >
            Agendar Avaliação
          </Link>
        </div>

        {/* Editorial Portrait (Top on Mobile, Bottom on Desktop) */}
        <div className="w-full relative order-1 md:order-2">
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

      </div>
    </section>
  );
};
