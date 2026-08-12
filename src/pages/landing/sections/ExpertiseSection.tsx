import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../services/supabase';
import { Link } from 'react-router-dom';
import { Procedure } from '../../../types/procedure';

export const ExpertiseSection = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobileSelectorOpen, setIsMobileSelectorOpen] = useState(false);

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const { data, error } = await supabase
          .from('procedures')
          .select('*')
          .eq('active', true)
          .order('display_order', { ascending: true })
          .limit(10);

        if (error) {
          console.error('Supabase error fetching procedures:', error);
          return;
        }

        if (data) {
          setProcedures(data);
        }
      } catch (error) {
        console.error('Unexpected error fetching procedures:', error);
      }
    };

    fetchProcedures();
  }, []);

  const activeProcedure = procedures.length > 0 ? procedures[activeIndex] : null;

  return (
    <section id="tratamentos" className="pt-10 pb-20 md:pt-16 md:pb-32 bg-clinic-bg scroll-mt-20 md:scroll-mt-28">
      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Header */}
        <div className="mb-12 md:mb-20 text-center lg:text-left">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-clinic-textPrimary mb-4">
            Tratamentos
          </h2>
          <p className="text-clinic-textSecondary font-light text-sm md:text-base tracking-wide max-w-lg mx-auto lg:mx-0">
            Procedimentos selecionados para cuidado, estética e bem-estar.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          
          {/* ÁREA 1: PROCEDIMENTOS (Sidebar List) */}
          <div className="w-full lg:w-3/12 flex flex-col shrink-0">
            {/* Mobile Selector (< lg) */}
            <div className="block lg:hidden relative z-20 mb-6">
              <button 
                onClick={() => setIsMobileSelectorOpen(!isMobileSelectorOpen)}
                aria-expanded={isMobileSelectorOpen}
                className="w-full flex items-center justify-between py-4 px-0 border-b border-clinic-textPrimary/10 bg-transparent transition-colors"
              >
                <span className="font-serif text-[22px] text-clinic-textPrimary">
                  {activeProcedure ? activeProcedure.title : 'Selecione...'}
                </span>
                <span className="text-3xl text-clinic-textSecondary font-light leading-none mb-1">
                  {isMobileSelectorOpen ? '×' : '+'}
                </span>
              </button>
              
              <AnimatePresence>
                {isMobileSelectorOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-clinic-surface border border-clinic-border shadow-lg max-h-[60vh] overflow-y-auto"
                  >
                    {procedures.map((proc, index) => (
                      <button
                        key={proc.id}
                        onClick={() => {
                          setActiveIndex(index);
                          setIsMobileSelectorOpen(false);
                        }}
                        className={`w-full text-left py-4 px-6 transition-colors border-b border-clinic-border last:border-b-0 ${
                          activeIndex === index ? 'bg-clinic-surface text-clinic-textPrimary' : 'bg-white hover:bg-gray-50/50 text-clinic-textSecondary'
                        }`}
                      >
                         <span className="font-serif text-lg tracking-wide">
                           {proc.title}
                         </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop List (>= lg) */}
            <div className="hidden lg:flex flex-col gap-1">
              {procedures.length === 0 ? (
                <div className="py-4 text-clinic-textSecondary italic font-light">
                  Os tratamentos serão listados aqui.
                </div>
              ) : (
                procedures.map((proc, index) => (
                  <button
                    key={proc.id}
                    onClick={() => setActiveIndex(index)}
                    className="w-full text-left py-3 px-0 flex items-center group relative overflow-hidden"
                  >
                    <span className={`text-xs tracking-widest transition-colors w-10 ${
                      activeIndex === index ? 'text-clinic-goldDark font-semibold' : 'text-clinic-textSecondary/40 group-hover:text-clinic-goldDark'
                    }`}>
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className={`font-serif text-lg tracking-wide transition-all duration-300 ${
                      activeIndex === index ? 'text-clinic-textPrimary pl-2' : 'text-clinic-textSecondary group-hover:text-clinic-textPrimary group-hover:pl-1'
                    }`}>
                      {proc.title}
                    </span>
                    {/* Indicador Minimalista */}
                    {activeIndex === index && (
                      <div className="absolute left-10 bottom-2 h-[1px] bg-clinic-goldDark/40 w-[140px]" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Dynamic Content (ÁREA 2 e 3) */}
          <div className="w-full lg:w-9/12">
            <AnimatePresence mode="wait">
              {activeProcedure ? (
                <motion.div
                  key={activeProcedure.id}
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center lg:items-start"
                >
                  {/* ÁREA 2: IMAGEM */}
                  <div className="w-full lg:w-5/12 flex justify-center lg:justify-start">
                    {activeProcedure.image && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-clinic-gold/5 blur-2xl rounded-full"></div>
                        <img 
                          src={activeProcedure.image} 
                          alt={activeProcedure.title} 
                          className="relative w-full max-w-[340px] h-auto object-contain drop-shadow-xl transition-transform duration-700 hover:scale-[1.02]"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* ÁREA 3: INFORMAÇÕES */}
                  <div className="w-full lg:w-7/12 flex flex-col justify-center pt-0 lg:pt-6">
                    <h3 className="text-3xl lg:text-4xl lg:leading-tight font-serif text-clinic-textPrimary mb-5">{activeProcedure.title}</h3>
                    <p className="text-[15px] lg:text-lg text-clinic-textSecondary font-light leading-relaxed mb-10 max-w-lg">
                      {activeProcedure.short_description || activeProcedure.description}
                    </p>
                    
                    <div className="w-full max-w-[60px] h-[1px] bg-clinic-gold mb-10"></div>
                    
                    <div className="flex flex-col gap-6 items-start mt-2">
                      <Link
                        to="/agendar"
                        className="inline-flex items-center gap-4 text-xs font-semibold tracking-[0.2em] uppercase text-clinic-textPrimary hover:text-clinic-goldDark transition-colors duration-300 group"
                      >
                        Agendar avaliação
                        <span className="w-8 h-[1px] bg-clinic-textPrimary group-hover:bg-clinic-goldDark transition-all duration-300 group-hover:w-16"></span>
                      </Link>
                      
                      <Link
                        to={`/procedimentos/${activeProcedure.slug}`}
                        className="inline-flex items-center gap-4 text-xs font-semibold tracking-[0.2em] uppercase text-clinic-textSecondary hover:text-clinic-goldDark transition-colors duration-300 group"
                      >
                        Ver detalhes
                        <span className="w-8 h-[1px] bg-clinic-border group-hover:bg-clinic-goldDark transition-all duration-300 group-hover:w-12"></span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};
