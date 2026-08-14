import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const AuthoritySection = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="py-24 md:py-32 bg-clinic-surface border-t border-clinic-border">
      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          {/* Portrait / Editorial placeholder (Left Side) */}
          <div className="w-full lg:w-5/12 flex justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-full max-w-[450px]"
            >
              {imageError ? (
                <div className="relative w-full aspect-[3/4] border border-clinic-border bg-clinic-bg/20 flex flex-col justify-between p-8 md:p-12 select-none shadow-[0_4px_20px_rgba(201,139,132,0.05)]">
                  <div className="flex justify-between items-start">
                    <span className="font-serif text-clinic-gold/70 text-4xl leading-none">P</span>
                    <div className="w-16 h-[1px] bg-clinic-gold/20 mt-4"></div>
                  </div>
                  <div className="my-auto py-8">
                    <p className="font-serif text-3xl md:text-4xl text-clinic-textPrimary/30 tracking-widest leading-relaxed text-center">
                      CIÊNCIA &<br />
                      <span className="italic text-clinic-goldDark/30">ESTÉTICA</span>
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-16 h-[1px] bg-clinic-gold/20 mb-4"></div>
                    <span className="font-serif text-clinic-gold/70 text-4xl leading-none">F</span>
                  </div>
                </div>
              ) : (
                <div className="relative w-full">
                  <div className="absolute inset-0 border border-clinic-gold/20 translate-x-3 translate-y-3 -z-10"></div>
                  <img 
                    src="/foto1.jpg" 
                    alt="Dra. Patrícia Ferrer" 
                    className="w-full h-auto object-cover border border-clinic-border bg-white p-2"
                    onError={() => {
                      setImageError(true);
                    }}
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* Credentials / Statements (Right Side) */}
          <div className="w-full lg:w-7/12 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-[1px] bg-clinic-gold"></div>
                <span className="uppercase tracking-widest text-[10px] md:text-xs font-semibold text-clinic-goldDark">Dra. Patrícia Ferrer</span>
              </div>

              <div className="space-y-6 mb-16">
                <p className="text-3xl md:text-5xl font-serif text-clinic-textPrimary leading-tight">
                  <span className="block mb-2">Biomedicina.</span>
                  <span className="block mb-2">Ciência.</span>
                  <span className="block mb-2 italic text-clinic-goldDark">Naturalidade.</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 mb-16 border-l border-clinic-gold/30 pl-6 md:pl-10">
                <div className="space-y-1">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-clinic-textPrimary">Experiência</h3>
                  <p className="text-sm text-clinic-textSecondary font-light leading-relaxed">Mais de uma década dedicada à estética avançada.</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-clinic-textPrimary">Formação</h3>
                  <p className="text-sm text-clinic-textSecondary font-light leading-relaxed">Graduada em Biomedicina. Especialista em Estética.</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-clinic-textPrimary">Filosofia</h3>
                  <p className="text-sm text-clinic-textSecondary font-light leading-relaxed">Protocolos individualizados baseados em evidências.</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-clinic-textPrimary">Cuidado</h3>
                  <p className="text-sm text-clinic-textSecondary font-light leading-relaxed">Atendimento humanizado e focado em excelência.</p>
                </div>
              </div>

              <div>
                <Link
                  to="/dra-patricia"
                  className="inline-flex items-center gap-4 text-xs font-semibold tracking-[0.2em] uppercase text-clinic-textPrimary hover:text-clinic-goldDark transition-colors duration-300 group"
                >
                  Conheça minha trajetória
                  <span className="w-8 h-[1px] bg-clinic-textPrimary group-hover:bg-clinic-goldDark transition-all duration-300 group-hover:w-16"></span>
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
