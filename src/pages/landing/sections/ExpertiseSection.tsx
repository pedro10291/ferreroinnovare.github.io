import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../services/supabase';

export const ExpertiseSection = () => {
  const [procedures, setProcedures] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const { data, error } = await supabase
          .from('procedures')
          .select('*')
          .order('order_index', { ascending: true })
          .limit(10);

        if (data && data.length > 0) {
          setProcedures(data);
        }
      } catch (error) {
        console.error('Error fetching procedures:', error);
      }
    };

    fetchProcedures();
  }, []);

  const activeProcedure = procedures.length > 0 ? procedures[activeIndex] : null;

  return (
    <section className="py-24 md:py-32 lg:py-40 bg-clinic-bg">
      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 lg:px-12">
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Sidebar List (Left Side) */}
          <div className="w-full lg:w-4/12 flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-12"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[1px] bg-clinic-gold"></div>
                <span className="uppercase tracking-widest text-xs font-semibold text-clinic-goldDark">Expertise</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-clinic-textPrimary leading-tight">
                Portfólio de <span className="italic font-light text-clinic-goldDark">Tratamentos</span>
              </h2>
            </motion.div>

            <div className="flex flex-col gap-2">
              {procedures.length === 0 ? (
                <div className="py-4 text-clinic-textSecondary italic font-light">
                  Os tratamentos serão listados aqui.
                </div>
              ) : (
                procedures.map((proc, index) => (
                  <button
                    key={proc.id}
                    onClick={() => setActiveIndex(index)}
                    className={`text-left py-4 px-6 transition-all duration-500 border-l-2 ${
                      activeIndex === index 
                        ? 'border-clinic-gold bg-clinic-surfaceHover text-clinic-textPrimary' 
                        : 'border-transparent text-clinic-textSecondary hover:bg-clinic-surface/50 hover:text-clinic-textPrimary'
                    }`}
                  >
                    <span className="font-serif text-xl tracking-wide">{proc.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Dynamic Content (Right Side) */}
          <div className="w-full lg:w-8/12 min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeProcedure ? (
                <motion.div
                  key={activeProcedure.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="flex flex-col md:flex-row gap-8 md:gap-12 h-full items-center"
                >
                  <div className="w-full md:w-1/2 aspect-[4/5] relative border border-clinic-border p-1 bg-clinic-surface">
                    {activeProcedure.image_url ? (
                      <img 
                        src={activeProcedure.image_url} 
                        alt={activeProcedure.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#EFE8E2] flex flex-col items-center justify-center text-center p-6">
                        <div className="w-8 h-[1px] bg-clinic-border mb-4"></div>
                        <p className="text-xs uppercase tracking-widest text-clinic-textSecondary/60">Sem Fotografia</p>
                        <div className="w-8 h-[1px] bg-clinic-border mt-4"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <h3 className="text-3xl font-serif text-clinic-textPrimary mb-6">{activeProcedure.title}</h3>
                    <p className="text-base lg:text-lg text-clinic-textSecondary font-light leading-relaxed mb-10">
                      {activeProcedure.description}
                    </p>
                    <div>
                      <a
                        href="#contato"
                        className="inline-flex items-center gap-4 text-xs font-semibold tracking-widest uppercase text-clinic-textPrimary hover:text-clinic-gold transition-colors duration-500 group"
                      >
                        Agendar este tratamento
                        <span className="w-8 h-[1px] bg-clinic-textPrimary group-hover:bg-clinic-gold transition-colors duration-500 group-hover:w-12"></span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full border border-clinic-border flex flex-col items-center justify-center text-center p-12 bg-clinic-surfaceHover/30">
                  <div className="w-12 h-[1px] bg-clinic-border mb-6"></div>
                  <p className="font-serif text-xl text-clinic-textSecondary italic">Selecione um tratamento ao lado.</p>
                  <div className="w-12 h-[1px] bg-clinic-border mt-6"></div>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};
