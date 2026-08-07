import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const AuthoritySection = () => {
  return (
    <section className="py-24 md:py-32 bg-clinic-surface border-t border-clinic-border">
      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          {/* Portrait (Left Side) */}
          <div className="w-full lg:w-5/12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <div className="relative aspect-[4/5] w-full max-w-[500px] mx-auto border border-clinic-border bg-clinic-bg p-2">
                <div className="w-full h-full bg-[#e8e2dd] flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-[1px] bg-clinic-border mb-6"></div>
                  <p className="font-serif text-2xl text-clinic-textSecondary mb-2">Autoridade</p>
                  <p className="text-xs uppercase tracking-widest text-clinic-textSecondary/60">Fotografia Profissional (4:5)</p>
                  <div className="w-8 h-[1px] bg-clinic-border mt-6"></div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Credentials / Statements (Right Side) */}
          <div className="w-full lg:w-7/12 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-[1px] bg-clinic-gold"></div>
                <span className="uppercase tracking-widest text-xs font-semibold text-clinic-goldDark">Dra. Patrícia Ferrer</span>
              </div>

              <div className="space-y-6 mb-16">
                <p className="text-3xl md:text-4xl lg:text-5xl font-serif text-clinic-textPrimary leading-tight">
                  <span className="block mb-2">Biomedicina.</span>
                  <span className="block mb-2">Ciência.</span>
                  <span className="block mb-2 italic text-clinic-goldDark">Naturalidade.</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 mb-16 border-l border-clinic-border pl-6 md:pl-10">
                <div>
                  <h3 className="text-sm uppercase tracking-widest font-semibold text-clinic-textPrimary mb-2">Experiência</h3>
                  <p className="text-sm text-clinic-textSecondary font-light">Mais de uma década dedicada à estética avançada.</p>
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-widest font-semibold text-clinic-textPrimary mb-2">Formação</h3>
                  <p className="text-sm text-clinic-textSecondary font-light">Graduada em Biomedicina. Especialista em Estética.</p>
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-widest font-semibold text-clinic-textPrimary mb-2">Filosofia</h3>
                  <p className="text-sm text-clinic-textSecondary font-light">Protocolos individualizados baseados em evidências.</p>
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-widest font-semibold text-clinic-textPrimary mb-2">Cuidado</h3>
                  <p className="text-sm text-clinic-textSecondary font-light">Atendimento humanizado e focado em excelência.</p>
                </div>
              </div>

              <div>
                <Link
                  to="/dra-patricia"
                  className="inline-flex items-center gap-4 text-sm font-semibold tracking-widest uppercase text-clinic-textPrimary hover:text-clinic-gold transition-colors duration-500 group"
                >
                  Conheça minha trajetória
                  <span className="w-8 h-[1px] bg-clinic-textPrimary group-hover:bg-clinic-gold transition-colors duration-500 group-hover:w-12"></span>
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
