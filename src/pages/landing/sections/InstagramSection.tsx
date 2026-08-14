import React from 'react';

export const InstagramSection = () => {
  return (
    <section className="py-24 md:py-36 bg-[#FCFBF9] border-t border-clinic-border/50">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 text-center">
        
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-clinic-gold font-bold mb-6 block">Resultados</span>
          
          <h2 className="text-3xl md:text-5xl font-serif text-clinic-dark mb-6 leading-tight">
            Veja resultados e acompanhe nosso trabalho.
          </h2>
          
          <p className="text-sm md:text-base text-clinic-textSecondary font-light leading-relaxed mb-12 max-w-lg">
            Conheça nossos resultados, acompanhe os procedimentos e veja um pouco mais do trabalho da Ferrer Innovare diretamente no Instagram.
          </p>
          
          <a
            href="https://instagram.com/ferrerinnovare"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-10 h-14 bg-clinic-textPrimary hover:bg-clinic-goldDark text-white rounded-none uppercase tracking-[0.2em] text-[11px] font-semibold transition-colors duration-300 group"
          >
            Ver resultados no Instagram
            <svg 
              className="w-4 h-4 ml-3 transform group-hover:translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
};
