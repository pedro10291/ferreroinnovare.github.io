import React from 'react';
import { Link } from 'react-router-dom';

export const ExpertiseSection = () => {
  return (
    <section id="tratamentos" className="py-24 md:py-36 bg-clinic-bg border-t border-clinic-border/50 scroll-mt-20 md:scroll-mt-28">
      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 lg:px-12">
        <div className="max-w-3xl flex flex-col items-start text-left">
          <span className="text-[9px] uppercase tracking-[0.3em] text-clinic-goldDark font-semibold mb-4 block">
            Portfólio Clínico
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-clinic-textPrimary mb-6 font-normal tracking-wide">
            Tratamentos
          </h2>
          <p className="text-clinic-textSecondary font-serif italic font-light text-xl md:text-2xl tracking-wide mb-8">
            "Precisão, naturalidade e cuidado em cada escolha."
          </p>
          <p className="text-sm md:text-base text-clinic-textSecondary font-light leading-relaxed mb-10 max-w-2xl">
            Cada tratamento na Ferrer Innovare Clinic é planejado e executado de forma totalmente individualizada. Compreendemos a anatomia única de cada paciente para realçar sua essência com técnicas avançadas e resultados discretos e elegantes.
          </p>
          <Link
            to="/tratamentos"
            className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.3em] uppercase text-clinic-textPrimary hover:text-clinic-gold transition-colors duration-300 group"
          >
            Conhecer tratamentos
            <span className="text-[14px] transition-transform duration-300 group-hover:translate-x-1 font-light">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
