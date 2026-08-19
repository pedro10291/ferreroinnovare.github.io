import React from 'react';
import { motion } from 'framer-motion';

export const ClinicSection = () => {
  return (
    <section className="bg-clinic-surface pt-20 pb-20 md:pt-32 md:pb-28 border-t border-clinic-border/40">
      <div className="max-w-[1400px] w-full mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Top Content: Text and Image */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col max-w-2xl mx-auto lg:mx-0"
            >
              {/* b) Pequeno identificador */}
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-[1px] bg-clinic-goldDark/50 block"></span>
                <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-clinic-goldDark font-semibold block">
                  Institucional
                </span>
              </div>
              
              {/* c) NOSSA ABORDAGEM */}
              <h3 className="text-2xl md:text-3xl font-serif text-clinic-textPrimary mb-8 md:mb-10 leading-[1.15]">
                NOSSA ABORDAGEM
              </h3>
              
              {/* d) Texto Institucional */}
              <div className="space-y-6">
                <p className="text-[15px] sm:text-[17px] md:text-lg text-clinic-textSecondary font-light leading-[1.8]">
                  <strong className="font-serif italic font-normal text-[17px] sm:text-[19px] md:text-xl text-clinic-textPrimary">A Ferrer Innovare Clinic</strong> é uma clínica dedicada à estética e ao rejuvenescimento, com uma abordagem baseada em avaliação individual, planejamento e personalização dos tratamentos.
                </p>
                <p className="text-[15px] sm:text-[17px] md:text-lg text-clinic-textSecondary font-light leading-[1.8]">
                  Entendemos que cada pessoa possui características únicas. Por isso, não trabalhamos com protocolos padronizados: cada indicação é pensada de acordo com a necessidade, anatomia e objetivo de cada paciente.
                </p>
                <p className="text-[15px] sm:text-[17px] md:text-lg text-clinic-textSecondary font-light leading-[1.8]">
                  Nossa filosofia une conhecimento técnico, atualização profissional, tecnologias selecionadas e olhar estético, buscando resultados equilibrados, naturais e coerentes com cada indivíduo.
                </p>
                <p className="text-[15px] sm:text-[17px] md:text-lg text-clinic-textSecondary font-light leading-[1.8]">
                  <span className="font-medium text-clinic-textPrimary/80">Aqui, cada detalhe importa da avaliação ao acompanhamento.</span>
                </p>
              </div>
            </motion.div>
          </div>
          
          <div className="w-full md:w-[85%] lg:w-1/2 mx-auto lg:mt-0 flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="w-full flex justify-center"
            >
              <img 
                src="/fotoequipe.jpg" 
                alt="Equipe Ferrer Innovare Clinic" 
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>

        {/* Bottom Content: Signature */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="mt-6 md:mt-12 text-center max-w-3xl mx-auto flex flex-col items-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-clinic-textPrimary italic mb-4 md:mb-5">
            Ferrer Innovare Clinic
          </h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-clinic-goldDark font-medium tracking-[0.2em] uppercase leading-[1.8]">
            Estética com propósito,<br className="sm:hidden" /> planejamento e responsabilidade.
          </p>
        </motion.div>

      </div>
    </section>
  );
};
