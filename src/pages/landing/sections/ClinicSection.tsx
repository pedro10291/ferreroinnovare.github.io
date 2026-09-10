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
              
              {/* c) NOSSA EQUIPE */}
              <h3 className="text-2xl md:text-3xl font-serif text-clinic-textPrimary mb-10 leading-[1.15]">
                Nossa Equipe
              </h3>
              
              {/* d) Team List */}
              <div className="space-y-10">
                {/* Profissional 1 */}
                <div>
                  <h4 className="text-xl md:text-2xl font-serif text-clinic-textPrimary mb-1">Dra. Patricia Santana</h4>
                  <p className="text-[11px] md:text-xs font-sans text-clinic-goldDark/90 uppercase tracking-widest mb-3 leading-relaxed">
                    Biomédica | Estética Avançada | Patologia Clínica e Análises Clínicas | Perita Judicial
                  </p>
                  <p className="text-[15px] sm:text-[16px] md:text-lg text-clinic-textSecondary font-light leading-[1.8]">
                    Bacharel em Biomedicina, graduada em Estética e Cosmetologia, com pós-graduação e residência em Estética Avançada, além de formação em Patologia Clínica e Análises Clínicas e Perícia Judicial.
                  </p>
                </div>

                {/* Profissional 2 */}
                <div>
                  <h4 className="text-xl md:text-2xl font-serif text-clinic-textPrimary mb-1">Shaiane Santos</h4>
                  <p className="text-[11px] md:text-xs font-sans text-clinic-goldDark/90 uppercase tracking-widest mb-3 leading-relaxed">
                    Esteticista | Graduanda em Fisioterapia
                  </p>
                  <p className="text-[15px] sm:text-[16px] md:text-lg text-clinic-textSecondary font-light leading-[1.8]">
                    Especialista em Limpeza de Pele e Estética Tradicional, com diversos cursos de aperfeiçoamento na área da estética.
                  </p>
                </div>

                {/* Profissional 3 */}
                <div>
                  <h4 className="text-xl md:text-2xl font-serif text-clinic-textPrimary mb-1">Luana Paula</h4>
                  <p className="text-[11px] md:text-xs font-sans text-clinic-goldDark/90 uppercase tracking-widest mb-3 leading-relaxed">
                    Especialista em Dermomicropigmentação | Graduanda em Nutrição
                  </p>
                  <p className="text-[15px] sm:text-[16px] md:text-lg text-clinic-textSecondary font-light leading-[1.8]">
                    Mais de 10 anos de experiência e dedicação à beleza e à estética, com especialização em Dermomicropigmentação.
                  </p>
                </div>
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
          className="mt-16 md:mt-24 text-center max-w-3xl mx-auto flex flex-col items-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-clinic-textPrimary italic mb-4 md:mb-5">
            Ferrer Innovare Clinic
          </h2>
          <p className="text-[14px] sm:text-[15px] md:text-base text-clinic-textSecondary font-light leading-[1.8] max-w-2xl px-4">
            Uma equipe qualificada, em constante aperfeiçoamento e comprometida com um atendimento seguro, personalizado e de excelência.
          </p>
        </motion.div>

      </div>
    </section>
  );
};
