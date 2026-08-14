import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../services/supabase';
import { Link } from 'react-router-dom';
import { Procedure } from '../../../types/procedure';

export const ExpertiseSection = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobileSelectorOpen, setIsMobileSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const listContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listContainerRef.current) return;
    const activeElement = listContainerRef.current.querySelector('[data-active="true"]');
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
          console.error('[ExpertiseSection] VITE_SUPABASE_URL não configurada. Verifique as variáveis de ambiente na Vercel.');
          setLoadError('Variáveis de ambiente do Supabase não configuradas.');
          setIsLoading(false);
          return;
        }

        // Modificado limit de 10 para 35 para carregar todos os 20 procedimentos ativos no Supabase
        const { data, error } = await supabase
          .from('procedures')
          .select('*')
          .eq('active', true)
          .order('display_order', { ascending: true })
          .limit(35);

        if (error) {
          console.error('[ExpertiseSection] Erro ao buscar procedures:', {
            code: error.code,
            message: error.message,
            hint: error.hint,
          });
          setLoadError('Não foi possível carregar os tratamentos no momento.');
          return;
        }

        if (data) {
          setProcedures(data);
        }
      } catch (error) {
        console.error('[ExpertiseSection] Erro inesperado:', error);
        setLoadError('Não foi possível carregar os tratamentos no momento.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcedures();
  }, []);

  const activeProcedure = procedures.length > 0 ? procedures[activeIndex] : null;

  return (
    <section id="tratamentos" className="py-28 md:py-40 bg-clinic-bg border-t border-clinic-border/50 scroll-mt-20 md:scroll-mt-28">
      {/* Estilo local para scrollbar discreta de luxo */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-sidebar-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(182, 154, 84, 0.15);
          border-radius: 1.5px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(182, 154, 84, 0.35);
        }
        .custom-sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(182, 154, 84, 0.15) transparent;
        }
      `}} />

      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Header */}
        <div className="mb-20 md:mb-28 text-center lg:text-left">
          <span className="text-[10px] uppercase tracking-[0.25em] text-clinic-gold font-bold mb-4 block">Especialidades</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-clinic-textPrimary mb-4">
            Tratamentos
          </h2>
          <p className="text-clinic-textSecondary font-light text-sm md:text-base tracking-wide max-w-lg mx-auto lg:mx-0">
            Procedimentos selecionados para cuidado, estética e bem-estar.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center gap-3 text-clinic-textSecondary font-light text-sm py-16 justify-center lg:justify-start">
            <div className="w-4 h-4 border border-clinic-gold border-t-transparent rounded-full animate-spin" />
            Carregando tratamentos...
          </div>
        )}

        {/* Error state */}
        {!isLoading && loadError && (
          <div className="py-16 text-clinic-textSecondary font-light text-sm italic text-center lg:text-left">
            {loadError}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !loadError && procedures.length === 0 && (
          <div className="py-16 text-clinic-textSecondary font-light text-sm italic text-center lg:text-left">
            Em breve, novos tratamentos disponíveis.
          </div>
        )}

        {/* Procedures list */}
        {!isLoading && !loadError && procedures.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-28 items-start">
            
            {/* ÁREA 1: PROCEDIMENTOS (Sidebar List) */}
            <div className="w-full lg:w-3/12 flex flex-col shrink-0">
              
              {/* Mobile Selector (< lg) */}
              <div className="block lg:hidden relative z-20 mb-8">
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
                      // Limitado a max-height 40vh com rolagem interna elegante
                      className="absolute top-full left-0 right-0 mt-2 bg-clinic-surface border border-clinic-border shadow-lg max-h-[40vh] overflow-y-auto custom-sidebar-scroll z-30"
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
                           <span className="font-serif text-lg tracking-wide block leading-snug">
                             {proc.title}
                           </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop List (>= lg) */}
              <div className="hidden lg:block relative w-full pr-2">
                {/* Container de Rolagem Controlada (max-h 500px) */}
                <div 
                  ref={listContainerRef}
                  className="custom-sidebar-scroll max-h-[500px] overflow-y-auto pr-6 flex flex-col gap-2 relative scroll-smooth"
                >
                  {procedures.map((proc, index) => (
                    <button
                      key={proc.id}
                      data-active={activeIndex === index}
                      onClick={() => setActiveIndex(index)}
                      className="w-full text-left py-3 px-0 flex items-center group relative overflow-hidden transition-all duration-300"
                    >
                      <span className={`text-[10px] tracking-[0.25em] transition-colors w-10 shrink-0 ${
                        activeIndex === index ? 'text-clinic-goldDark font-bold' : 'text-clinic-textSecondary/40 group-hover:text-clinic-goldDark'
                      }`}>
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <span className={`font-serif text-lg tracking-wide transition-all duration-500 block leading-snug ${
                        activeIndex === index ? 'text-clinic-textPrimary pl-4 font-medium' : 'text-clinic-textSecondary group-hover:text-clinic-textPrimary group-hover:pl-2'
                      }`}>
                        {proc.title}
                      </span>
                      {/* Indicador Minimalista */}
                      {activeIndex === index && (
                        <div className="absolute left-10 bottom-1 h-[1px] bg-clinic-goldDark/30 w-[140px]" />
                      )}
                    </button>
                  ))}
                </div>
                {/* Desvanecimento sutil para rolagem editorial */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-clinic-bg to-transparent pointer-events-none z-10" />
              </div>
            </div>

            {/* Dynamic Content (ÁREA 2 e 3) */}
            <div className="w-full lg:w-9/12">
              <AnimatePresence mode="wait">
                {activeProcedure ? (
                  <motion.div
                    key={activeProcedure.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center lg:items-start"
                  >
                    {/* ÁREA 2: IMAGEM / FALLBACK */}
                    <div className="w-full lg:w-5/12 flex justify-center lg:justify-start">
                      {activeProcedure.image ? (
                        <div className="relative p-2.5 border border-clinic-border/40 bg-white/40 shadow-sm max-w-[340px] w-full">
                          <div className="absolute inset-0 bg-clinic-gold/5 blur-2xl rounded-full -z-10"></div>
                          <img 
                            src={activeProcedure.image} 
                            alt={activeProcedure.title} 
                            className="relative w-full h-auto object-contain transition-transform duration-700 hover:scale-[1.02]"
                          />
                        </div>
                      ) : (
                        /* Fallback visual sofisticado da Ferrer Innovare */
                        <div className="relative p-8 border border-clinic-border/40 bg-clinic-surface flex flex-col justify-between aspect-[3/4] max-w-[340px] w-full select-none shadow-sm">
                          <div className="flex justify-between items-start">
                            <span className="font-serif text-clinic-gold text-2xl leading-none">F</span>
                            <div className="w-12 h-[1px] bg-clinic-gold/30 mt-3"></div>
                          </div>
                          <div className="text-center py-6">
                            <span className="font-serif text-clinic-textSecondary/30 tracking-[0.2em] text-[10px] uppercase block mb-2">Procedimento Especializado</span>
                            <p className="font-serif text-2xl text-clinic-goldDark/40 tracking-wider">
                              {activeProcedure.title}
                            </p>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="w-12 h-[1px] bg-clinic-gold/30 mb-3"></div>
                            <span className="font-serif text-clinic-gold text-2xl leading-none">I</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* ÁREA 3: INFORMAÇÕES */}
                    <div className="w-full lg:w-7/12 flex flex-col justify-center pt-0 lg:pt-4">
                      <h3 className="text-3xl lg:text-5xl lg:leading-tight font-serif text-clinic-textPrimary mb-6 leading-tight">{activeProcedure.title}</h3>
                      <p className="text-sm lg:text-base text-clinic-textSecondary font-light leading-relaxed mb-10 max-w-lg">
                        {activeProcedure.short_description || activeProcedure.description}
                      </p>
                      
                      <div className="w-16 h-[1px] bg-clinic-gold/60 mb-10"></div>
                      
                      <div className="flex flex-col gap-5 items-start">
                        <Link
                          to="/agendar"
                          className="inline-flex items-center gap-4 text-[10px] md:text-xs font-semibold tracking-[0.25em] uppercase text-clinic-textPrimary hover:text-clinic-goldDark transition-colors duration-300 group"
                        >
                          Agendar avaliação
                          <span className="w-8 h-[1px] bg-clinic-textPrimary group-hover:bg-clinic-goldDark transition-all duration-300 group-hover:w-16"></span>
                        </Link>
                        
                        <Link
                          to={`/procedimentos/${activeProcedure.slug}`}
                          className="inline-flex items-center gap-4 text-[10px] md:text-xs font-semibold tracking-[0.25em] uppercase text-clinic-textSecondary hover:text-clinic-goldDark transition-colors duration-300 group"
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
        )}

      </div>
    </section>
  );
};
