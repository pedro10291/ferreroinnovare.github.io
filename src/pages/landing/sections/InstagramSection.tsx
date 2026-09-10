import React from 'react';

export const InstagramSection = () => {
  const instagramUrl = 'https://www.instagram.com/ferrer.innovareclinic/';

  return (
    <section className="py-24 md:py-36 bg-[#FCFBF9] border-t border-clinic-border/50">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 lg:items-start gap-x-16 gap-y-10 lg:gap-x-24 lg:gap-y-8">
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <span className="text-[10px] uppercase tracking-[0.2em] text-clinic-gold font-bold mb-4 block">
              RESULTADOS
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-clinic-textPrimary mb-6 leading-tight font-normal">
              Veja resultados e acompanhe nosso trabalho.
            </h2>
            <p className="text-xs md:text-sm text-clinic-textSecondary/80 font-light leading-relaxed mb-6 max-w-lg">
              Conheça alguns dos nossos resultados e acompanhe de perto o trabalho da Ferrer Innovare Clinic.
            </p>
            <p className="text-xs text-clinic-textSecondary/80 font-light leading-relaxed max-w-md">
              Resultados, procedimentos e bastidores diretamente no Instagram.
            </p>
          </div>

          <figure className="order-2 lg:order-none lg:col-start-8 lg:col-span-4 lg:row-span-2 w-full max-w-[360px] lg:max-w-[390px] justify-self-center lg:justify-self-end">
            <img
              src={`${import.meta.env.BASE_URL}perfiloplastia-harmonizacao-do-perfil-sem-cirurgia.png`}
              alt="Resultado de procedimento da Ferrer Innovare Clinic"
              className="w-full aspect-[3/4] object-cover border border-clinic-border/40 transition-opacity duration-300 hover:opacity-95"
            />
          </figure>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="order-3 lg:order-none lg:col-span-5 inline-flex w-fit items-center gap-3 text-[11px] font-semibold tracking-[0.3em] uppercase text-clinic-textPrimary hover:text-clinic-gold transition-colors duration-300 group"
          >
            VER MAIS RESULTADOS
            <span className="text-[14px] transition-transform duration-300 group-hover:translate-x-1 font-light">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};
