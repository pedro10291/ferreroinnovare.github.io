import React from 'react';
import { Link } from 'react-router-dom';

export const ExpertiseSection = () => {
  return (
    <section id="tratamentos" className="py-24 md:py-36 bg-clinic-bg border-t border-clinic-border/50 scroll-mt-20 md:scroll-mt-28">
      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 lg:items-start gap-x-16 gap-y-10 lg:gap-x-24 lg:gap-y-8">
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <span className="text-[9px] uppercase tracking-[0.3em] text-clinic-goldDark font-semibold mb-4 block">
              PORTFÓLIO CLÍNICO
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-clinic-textPrimary mb-6 font-normal tracking-wide leading-tight">
              Tratamentos
            </h2>
            <p className="text-clinic-textSecondary font-serif italic font-light text-xl md:text-2xl tracking-wide mb-6 leading-relaxed">
              "Precisão, naturalidade e cuidado em cada escolha."
            </p>
            <p className="text-xs md:text-sm text-clinic-textSecondary/80 font-light leading-relaxed max-w-lg">
              Cada tratamento na Ferrer Innovare Clinic é planejado e executado de forma individualizada. Compreendemos a anatomia única de cada paciente para realçar sua essência com técnicas avançadas e resultados discretos e elegantes.
            </p>
          </div>

          <figure className="order-2 lg:order-none lg:col-start-8 lg:col-span-4 lg:row-span-2 w-full max-w-[360px] lg:max-w-[390px] justify-self-center lg:justify-self-end">
            <img
              src={`${import.meta.env.BASE_URL}toxina-botulinica-botox.png`}
              alt="Abordagem de tratamentos da Ferrer Innovare Clinic"
              className="w-full aspect-[3/4] object-cover border border-clinic-border/40 transition-opacity duration-300 hover:opacity-95"
            />
          </figure>

          <Link
            to="/tratamentos"
            className="order-3 lg:order-none lg:col-span-5 inline-flex w-fit items-center gap-3 text-[11px] font-semibold tracking-[0.3em] uppercase text-clinic-textPrimary hover:text-clinic-gold transition-colors duration-300 group"
          >
            CONHECER TRATAMENTOS
            <span className="text-[14px] transition-transform duration-300 group-hover:translate-x-1 font-light">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
