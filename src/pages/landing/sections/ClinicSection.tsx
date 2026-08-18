import React from 'react';
import { motion } from 'framer-motion';

export const ClinicSection = () => {
  return (
    <section className="bg-clinic-surface py-20 md:py-32 border-t border-clinic-border/40">
      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#9A8175] font-bold block mb-4">Institucional</span>
              <h2 className="text-4xl md:text-5xl font-serif text-clinic-textPrimary mb-6">
                Ferrer Innovare Clinic
              </h2>
              <h3 className="text-sm md:text-base text-[#77655D] font-semibold tracking-[0.2em] uppercase mb-6">
                Nossa Equipe
              </h3>
              <p className="text-sm md:text-base text-clinic-textSecondary font-light leading-relaxed max-w-lg mb-6">
                Atendimento individualizado e personalizado, com análise facial rigorosa para desenhar o tratamento ideal a cada paciente.
              </p>
              <p className="text-sm md:text-base text-clinic-textSecondary font-light leading-relaxed max-w-lg">
                Protocolos baseados em evidências científicas. Segurança em primeiro lugar, utilizando ativos e técnicas comprovadas para entregar resultados naturais.
              </p>
            </motion.div>
          </div>
          
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            >
              <div className="relative border border-clinic-border/40 p-2 bg-white shadow-sm">
                <img 
                  src="/foto_equipe.jpg" 
                  alt="Equipe Ferrer Innovare Clinic" 
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
