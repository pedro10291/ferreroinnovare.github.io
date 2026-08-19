import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const DraPatricia = () => {
  const specialties = [
    'Rejuvenescimento Facial',
    'Toxina Botulínica (Botox)',
    'Preenchimentos Faciais (Ácido Hialurônico)',
    'Bioestimuladores de Colágeno',
    'Fios de PDO',
    'Harmonização Facial',
    'Tratamento de Olheiras',
    'Lifting Facial Não Cirúrgico'
  ];

  const credentials = [
    'Bacharel em Biomedicina',
    'Graduada em Estética e Cosmética',
    'Residência em Harmonização Facial',
    'Especialista em Cosmetologia Clínica Aplicada às Disfunções Dermatológicas Estéticas',
    'Pós-graduada em Análises Clínicas',
    'Pós-graduada em Perícia Judicial',
    'Mentora em Procedimentos Estéticos',
    'CEO Ferrer Innovare Clinic'
  ];

  return (
    <div className="min-h-screen bg-clinic-bg text-clinic-textPrimary pt-6 md:pt-36 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-8 md:mb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-clinic-textSecondary hover:text-[#77655D] transition-colors duration-300 group"
          >
            <span className="w-6 h-[1px] bg-clinic-textSecondary group-hover:bg-clinic-goldDark transition-all duration-300 group-hover:w-10"></span>
            Voltar para o início
          </Link>
        </div>

        {/* EDITORIAL HEADER */}
        <div className="max-w-4xl mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#9A8175] font-bold block mb-4">Sobre mim</span>
            <h1 className="text-4xl md:text-6xl font-serif text-clinic-textPrimary leading-tight mb-4">
              Dra. Patrícia Santana
            </h1>
            <h2 className="text-sm md:text-base text-[#77655D] font-semibold tracking-[0.2em] uppercase">
              Ciência, experiência e resultados naturais
            </h2>
          </motion.div>
        </div>

        {/* SECTION 1: BIOGRAFIA */}
        <div className="mb-24 md:mb-32">
          
          <div className="w-full max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-6 text-[15px] md:text-lg text-clinic-textSecondary font-light leading-relaxed">
                <p>
                  Bacharel em Biomedicina e Graduada em Estética e Cosmética, atuando na área da estética desde 2014, unindo ciência, saúde e beleza em uma abordagem individualizada e baseada em evidências científicas.
                </p>
                <p>
                  Ao longo da minha trajetória profissional, desenvolvi protocolos exclusivos e construí uma experiência clínica voltada ao rejuvenescimento facial, harmonização facial e promoção do envelhecimento saudável.
                </p>
              </div>

              {/* Posicionamento Quote Section */}
              <div className="pt-8 border-t border-clinic-border/60">
                <p className="font-serif text-lg md:text-2xl text-clinic-textPrimary/80 italic leading-relaxed">
                  "Mais de uma década dedicada à estética, unindo conhecimento científico, experiência clínica e <span className="text-[#77655D] font-semibold not-italic">resultados naturais</span> para valorizar a beleza individual de cada paciente."
                </p>
              </div>
            </motion.div>
          </div>

        </div>

        {/* SECTION 2: ESPECIALIDADES & DIFERENCIAIS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-24 md:mb-32 pt-16 border-t border-clinic-border/40">
          
          {/* ESPECIALIDADES */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#9A8175] font-bold block">Portfolio Clínico</span>
              <h2 className="text-3xl font-serif text-clinic-textPrimary">Especialidades</h2>
            </div>
            
            {/* 2 columns on desktop, list on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 border-l border-clinic-gold/20 pl-6">
              {specialties.map((item, index) => (
                <div key={index} className="flex items-center gap-3 py-1">
                  <span className="w-1.5 h-1.5 bg-clinic-goldDark shrink-0"></span>
                  <span className="text-sm text-clinic-textSecondary font-light">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* DIFERENCIAIS */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#9A8175] font-bold block">Meus Pilares</span>
              <h2 className="text-3xl font-serif text-clinic-textPrimary">Meus Diferenciais</h2>
            </div>

            <div className="space-y-6">
              {/* Destaque Visual para Acne Control */}
              <div className="p-6 bg-clinic-surface/40 border border-clinic-border rounded-none space-y-2 shadow-[0_4px_20px_rgba(201,139,132,0.02)]">
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#77655D] font-bold">Protocolo Exclusivo</span>
                <h3 className="text-base font-serif text-clinic-textPrimary font-semibold leading-tight">
                  Criadora do Método Acne Control – Pele de Porcelana
                </h3>
                <p className="text-xs text-clinic-textSecondary font-light leading-relaxed">
                  Meu protocolo exclusivo para tratamento da acne e recuperação da qualidade, uniformidade e saúde da pele.
                </p>
              </div>

              <div className="space-y-4 pl-6 border-l border-clinic-gold/20">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-clinic-textPrimary uppercase tracking-wider">Atendimento individualizado e personalizado</h4>
                  <p className="text-xs text-clinic-textSecondary font-light">Realizo uma análise facial rigorosa para desenhar o tratamento ideal a cada paciente.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-clinic-textPrimary uppercase tracking-wider">Protocolos baseados em evidências científicas</h4>
                  <p className="text-xs text-clinic-textSecondary font-light">Coloco sua segurança em primeiro lugar, utilizando ativos e técnicas comprovadas.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-clinic-textPrimary uppercase tracking-wider">Mais de uma década de experiência clínica</h4>
                  <p className="text-xs text-clinic-textSecondary font-light">Dedicação exclusiva ao aprimoramento profissional e bem-estar das pacientes.</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* SECTION 3: FORMAÇÃO E ESPECIALIZAÇÕES */}
        <div className="pt-16 border-t border-clinic-border/40">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-8 max-w-4xl"
          >
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#9A8175] font-bold block">Currículo Clínico</span>
              <h2 className="text-3xl font-serif text-clinic-textPrimary">Formação e Especializações</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 border-l border-clinic-gold/20 pl-6">
              {credentials.map((item, index) => (
                <div key={index} className="flex items-start gap-4 py-1.5">
                  <span className="text-[#9A8175]/60 font-serif text-sm font-medium shrink-0 pt-0.5">
                    {(index + 1).toString().padStart(2, '0')}.
                  </span>
                  <span className="text-sm text-clinic-textSecondary font-light leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default DraPatricia;
