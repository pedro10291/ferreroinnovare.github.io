import React from 'react';
import { motion } from 'framer-motion';

export const ClinicSection = () => {
  return (
    <section className="bg-clinic-surface pt-24 pb-24 md:pt-32 md:pb-32 border-t border-clinic-border/40">
      <div className="max-w-[1200px] w-full mx-auto px-5 sm:px-8 lg:px-12">
        
        {/* Header: Institucional & Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-center text-center mb-16 md:mb-24"
        >
          <span className="w-px h-12 bg-clinic-goldDark/30 block mb-6"></span>
          <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-clinic-goldDark font-semibold block mb-4">
            Institucional
          </span>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif text-clinic-textPrimary leading-tight">
            Nossa Equipe
          </h3>
        </motion.div>

        {/* Team List - Editorial Blocks */}
        <div className="flex flex-col gap-16 md:gap-24 border-t border-b border-clinic-border/30 py-16 md:py-24">
          
          {/* Profissional 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex flex-col md:flex-row gap-3 md:gap-12 lg:gap-20"
          >
            <div className="w-full md:w-1/3">
              <h4 className="text-2xl md:text-3xl lg:text-4xl font-serif text-clinic-textPrimary mb-1 md:mb-0">Dra. Patricia Santana</h4>
            </div>
            <div className="w-full md:w-2/3 max-w-2xl">
              <p className="text-[10px] md:text-[11px] font-sans text-clinic-goldDark/80 uppercase tracking-[0.2em] mb-4 leading-relaxed">
                Biomédica | Estética Avançada | Patologia Clínica e Análises Clínicas | Perita Judicial
              </p>
              <p className="text-[15px] md:text-base lg:text-[17px] text-clinic-textSecondary font-light leading-[1.85]">
                Bacharel em Biomedicina, graduada em Estética e Cosmetologia, com pós-graduação e residência em Estética Avançada, além de formação em Patologia Clínica e Análises Clínicas e Perícia Judicial.
              </p>
            </div>
          </motion.div>

          {/* Profissional 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1 }}
            className="flex flex-col md:flex-row gap-3 md:gap-12 lg:gap-20"
          >
            <div className="w-full md:w-1/3">
              <h4 className="text-2xl md:text-3xl lg:text-4xl font-serif text-clinic-textPrimary mb-1 md:mb-0">Shaiane Santos</h4>
            </div>
            <div className="w-full md:w-2/3 max-w-2xl">
              <p className="text-[10px] md:text-[11px] font-sans text-clinic-goldDark/80 uppercase tracking-[0.2em] mb-4 leading-relaxed">
                Esteticista | Graduanda em Fisioterapia
              </p>
              <p className="text-[15px] md:text-base lg:text-[17px] text-clinic-textSecondary font-light leading-[1.85]">
                Especialista em Limpeza de Pele e Estética Tradicional, com diversos cursos de aperfeiçoamento na área da estética.
              </p>
            </div>
          </motion.div>

          {/* Profissional 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-3 md:gap-12 lg:gap-20"
          >
            <div className="w-full md:w-1/3">
              <h4 className="text-2xl md:text-3xl lg:text-4xl font-serif text-clinic-textPrimary mb-1 md:mb-0">Luana Paula</h4>
            </div>
            <div className="w-full md:w-2/3 max-w-2xl">
              <p className="text-[10px] md:text-[11px] font-sans text-clinic-goldDark/80 uppercase tracking-[0.2em] mb-4 leading-relaxed">
                Especialista em Dermomicropigmentação | Graduanda em Nutrição
              </p>
              <p className="text-[15px] md:text-base lg:text-[17px] text-clinic-textSecondary font-light leading-[1.85]">
                Mais de 10 anos de experiência e dedicação à beleza e à estética, com especialização em Dermomicropigmentação.
              </p>
            </div>
          </motion.div>

        </div>

        {/* Closing Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className="w-full flex justify-center mt-16 md:mt-24 px-2 md:px-0"
        >
          <div className="w-full max-w-5xl relative">
            {/* Subtle editorial frame for the image */}
            <div className="absolute -inset-2 md:-inset-3 border border-clinic-border/40 pointer-events-none"></div>
            <img 
              src={`${import.meta.env.BASE_URL}fotoequipe.jpg`} 
              alt="Equipe Ferrer Innovare Clinic" 
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>

        {/* Bottom Content: Signature */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="mt-20 md:mt-28 text-center max-w-3xl mx-auto flex flex-col items-center"
        >
          <span className="w-8 h-px bg-clinic-goldDark/30 block mb-8"></span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-clinic-textPrimary italic mb-5 md:mb-6">
            Ferrer Innovare Clinic
          </h2>
          <p className="text-[14px] sm:text-[15px] md:text-base lg:text-[17px] text-clinic-textSecondary font-light leading-[1.85] px-4">
            Uma equipe qualificada, em constante aperfeiçoamento e comprometida com um atendimento seguro, personalizado e de excelência.
          </p>
        </motion.div>

      </div>
    </section>
  );
};
