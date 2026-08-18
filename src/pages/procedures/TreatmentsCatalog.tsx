import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabase';
import { Procedure } from '../../types/procedure';
import { AlertCircle, ArrowRight, ChevronDown, ChevronUp, Clock, HelpCircle } from 'lucide-react';

export const TreatmentsCatalog = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Categories Computation
  const categories = useMemo(() => {
    const rawCategories = Array.from(new Set(procedures.map(p => (p.category || 'Outros').toUpperCase())));
    return rawCategories
      .sort((a, b) => {
        const order = ['PELE', 'CORPORAL', 'CAPILAR'];
        const aIdx = order.indexOf(a);
        const bIdx = order.indexOf(b);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return a.localeCompare(b);
      })
      .map((name, index) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        key: String(index + 1).padStart(2, '0')
      }));
  }, [procedures]);

  // Desktop States
  const [activeCategory, setActiveCategory] = useState<string>('pele');
  const [activeProcedureId, setActiveProcedureId] = useState<string | null>(null);
  
  // Mobile States
  const [expandedCategoryMobile, setExpandedCategoryMobile] = useState<string | null>(null);
  const [expandedProcedureMobileId, setExpandedProcedureMobileId] = useState<string | null>(null);

  // Bioestimulador Modality Tab State
  const [activeModalityIndex, setActiveModalityIndex] = useState(0);

  // Accordion care state
  const [preCareOpen, setPreCareOpen] = useState(false);
  const [postCareOpen, setPostCareOpen] = useState(false);

  // Filter procedures by category helper
  const getProceduresByCategory = (catId: string) => {
    const catName = categories.find(c => c.id === catId)?.name || '';
    return procedures.filter(p => (p.category || 'Outros').toUpperCase() === catName);
  };

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: dbError } = await supabase
          .from('procedures')
          .select('*')
          .eq('active', true)
          .order('display_order', { ascending: true });

        if (dbError) {
          console.error('Error fetching procedures:', dbError);
          setError('Não foi possível carregar os tratamentos.');
          return;
        }

        const procs = data as Procedure[] || [];
        setProcedures(procs);
        
        // Initialize default active procedure for desktop
        if (procs.length > 0) {
          // Dynamic category initialization
          const rawCats = Array.from(new Set(procs.map(p => (p.category || 'Outros').toUpperCase())));
          const sortedCats = rawCats.sort((a, b) => {
            const order = ['PELE', 'CORPORAL', 'CAPILAR'];
            const aIdx = order.indexOf(a);
            const bIdx = order.indexOf(b);
            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;
            return a.localeCompare(b);
          });
          const firstCatName = sortedCats.length > 0 ? sortedCats[0] : 'PELE';
          const firstCatId = firstCatName.toLowerCase().replace(/\s+/g, '-');
          
          setActiveCategory(firstCatId);
          
          const firstCatProcs = procs.filter(p => (p.category || 'Outros').toUpperCase() === firstCatName);
          if (firstCatProcs.length > 0) {
            setActiveProcedureId(firstCatProcs[0].id);
          } else {
            setActiveProcedureId(procs[0].id);
          }
        }
      } catch (err: any) {
        console.error('Unexpected error:', err);
        setError('Erro de comunicação.');
      } finally {
        setLoading(false);
      }
    };

    fetchProcedures();
  }, []);

  const handleCategorySelectDesktop = (catId: string) => {
    setActiveCategory(catId);
    const catProcs = getProceduresByCategory(catId);
    if (catProcs.length > 0) {
      setActiveProcedureId(catProcs[0].id);
      setActiveModalityIndex(0);
      setPreCareOpen(false);
      setPostCareOpen(false);
    }
  };

  const handleProcedureSelectDesktop = (procId: string) => {
    setActiveProcedureId(procId);
    setActiveModalityIndex(0);
    setPreCareOpen(false);
    setPostCareOpen(false);
  };

  const handleCategoryToggleMobile = (catId: string) => {
    if (expandedCategoryMobile === catId) {
      setExpandedCategoryMobile(null);
    } else {
      setExpandedCategoryMobile(catId);
    }
    setExpandedProcedureMobileId(null);
  };

  const handleProcedureToggleMobile = (procId: string) => {
    if (expandedProcedureMobileId === procId) {
      setExpandedProcedureMobileId(null);
    } else {
      const currentOpenId = expandedProcedureMobileId;
      setExpandedProcedureMobileId(procId);
      setActiveModalityIndex(0);
      setPreCareOpen(false);
      setPostCareOpen(false);

      // Perform smooth, natural, and continuous scroll transition
      const newElement = document.getElementById(`proc-mobile-${procId}`);
      if (newElement) {
        const navbar = document.querySelector('nav');
        const navbarHeight = navbar?.getBoundingClientRect().height ?? 70;
        const padding = 16;

        const newRect = newElement.getBoundingClientRect();
        const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        let targetY = newRect.top + scrollTop - navbarHeight - padding;

        if (currentOpenId) {
          const oldElement = document.getElementById(`proc-mobile-${currentOpenId}`);
          if (oldElement) {
            const oldRect = oldElement.getBoundingClientRect();
            // If the clicked element is below the currently open one, subtract the height that will collapse
            if (newRect.top > oldRect.top) {
              const oldExpandedDiv = oldElement.querySelector('.overflow-hidden');
              const oldHeight = oldExpandedDiv?.getBoundingClientRect().height ?? 0;
              targetY -= oldHeight;
            }
          }
        }

        // Delay the smooth scroll by 150ms so that the collapse/expand animations
        // and the scroll transition merge into a single continuous, natural movement
        // without browser layout conflicts or jumping.
        setTimeout(() => {
          window.scrollTo({
            top: targetY,
            behavior: 'smooth'
          });
        }, 150);
      }
    }
  };



  // Find active procedure object
  const activeProcedure = procedures.find(p => p.id === activeProcedureId) || null;

  // Bioestimulador specific variables
  let parsedDescription = activeProcedure?.description || '';
  let modalities: any[] | null = null;
  if (activeProcedure?.description && activeProcedure.description.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(activeProcedure.description);
      if (parsed.is_modalities) {
        parsedDescription = parsed.intro;
        modalities = parsed.modalities;
      }
    } catch (e) {
      console.error('Failed to parse description JSON:', e);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-clinic-bg flex flex-col items-center justify-center pt-24 md:pt-36 pb-24">
        <div className="flex items-center gap-3 text-clinic-textSecondary font-light text-sm">
          <div className="w-5 h-5 border border-clinic-gold border-t-transparent rounded-full animate-spin" />
          Carregando tratamentos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-clinic-bg flex flex-col items-center justify-center pt-24 md:pt-36 pb-24 px-6 text-center">
        <div className="max-w-md">
          <div className="w-10 h-10 flex items-center justify-center rounded-full border border-red-200 text-red-500 bg-red-50/50 flex-shrink-0 mx-auto mb-6">
            <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <p className="font-serif italic text-red-500 text-xl mb-3">{error}</p>
          <p className="text-xs text-clinic-textSecondary font-light mb-8">
            Verifique sua conexão ou tente novamente mais tarde.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center h-12 px-8 bg-clinic-textPrimary text-white text-[11px] font-semibold tracking-widest uppercase transition-colors duration-500 hover:bg-clinic-goldDark rounded-none"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (procedures.length === 0) {
    return (
      <div className="min-h-screen bg-clinic-bg flex flex-col items-center justify-center pt-24 md:pt-36 pb-24 px-6 text-center">
        <div className="max-w-md">
          <span className="font-serif italic text-clinic-gold text-2xl mb-4 block">Portfólio Clínico</span>
          <p className="font-serif text-lg text-clinic-textSecondary mb-6">
            Nenhum tratamento disponível no momento.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center h-12 px-8 border border-clinic-border text-clinic-textSecondary text-[11px] font-semibold tracking-widest uppercase transition-colors duration-500 hover:text-clinic-textPrimary hover:bg-clinic-surface rounded-none"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clinic-bg pt-8 md:pt-36 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Breadcrumb */}
        <div className="mb-10 md:mb-14">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-clinic-textSecondary hover:text-clinic-goldDark transition-colors duration-300 group"
          >
            <span className="w-6 h-[1px] bg-clinic-textSecondary group-hover:bg-clinic-goldDark transition-all duration-300 group-hover:w-10"></span>
            Voltar para o início
          </Link>
        </div>

        {/* HERO SECTION */}
        <div className="mb-16 md:mb-24 text-left max-w-3xl">
          <span className="text-[9px] uppercase tracking-[0.3em] text-clinic-goldDark font-semibold mb-3 block">
            PORTFÓLIO CLÍNICO
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif text-clinic-textPrimary mb-6 font-normal tracking-wide">
            Tratamentos
          </h1>
          <p className="text-clinic-textSecondary font-serif italic font-light text-lg md:text-2xl tracking-wide max-w-xl">
            "Precisão, naturalidade e cuidado em cada escolha."
          </p>
          <p className="text-xs md:text-sm text-clinic-textSecondary/60 font-light tracking-wide uppercase mt-4 block">
            Explore as áreas de atuação da Ferrer Innovare Clinic
          </p>
        </div>

        {/* DESKTOP LAYOUT (lg Breakpoint and Up) */}
        <div className="hidden lg:flex gap-20 items-start w-full">
          
          {/* LEFT SIDEBAR: Categories & Procedures Acordion */}
          <div className="w-5/12 shrink-0 flex flex-col space-y-6 pr-6 border-r border-clinic-border/30">
            {categories.map((cat) => {
              const catProcs = getProceduresByCategory(cat.id);
              const isOpen = activeCategory === cat.id;

              return (
                <div key={cat.id} className="border-b border-clinic-border/20 pb-4">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`desktop-cat-${cat.id}`}
                    onClick={() => handleCategorySelectDesktop(cat.id)}
                    className="w-full flex items-center justify-between text-left py-2 focus:outline-none focus:ring-0 group cursor-pointer active:opacity-70 transition-opacity"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="text-[10px] font-light text-clinic-goldDark/50 tracking-wider">
                        {cat.key}
                      </span>
                      <h2 className={`font-serif text-lg tracking-widest transition-all duration-300 group-hover:translate-x-[2px] ${
                        isOpen ? 'text-clinic-gold font-normal' : 'text-clinic-textPrimary/80 group-hover:text-clinic-gold font-light'
                      }`}>
                        {cat.name}
                      </h2>
                    </div>
                    <span className="text-xl font-light text-clinic-textSecondary/40 transition-all duration-300 group-hover:text-clinic-gold group-hover:translate-x-[2px]">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`desktop-cat-${cat.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden mt-3 pl-8 flex flex-col space-y-2.5"
                      >
                        {catProcs.map((proc, index) => {
                          const isActive = activeProcedureId === proc.id;
                          return (
                            <button
                              key={proc.id}
                              onClick={() => handleProcedureSelectDesktop(proc.id)}
                              className="w-full text-left py-1 text-xs focus:outline-none focus:ring-0 transition-all duration-300 flex items-center group"
                            >
                              <span className={`text-[8px] font-mono tracking-widest mr-3 w-5 shrink-0 ${
                                isActive ? 'text-clinic-gold font-medium' : 'text-clinic-textSecondary/40'
                              }`}>
                                {(index + 1).toString().padStart(2, '0')}
                              </span>
                              <span className={`font-sans tracking-wide transition-colors ${
                                isActive 
                                  ? 'text-clinic-textPrimary font-semibold' 
                                  : 'text-clinic-textSecondary/70 font-light hover:text-clinic-textPrimary'
                              }`}>
                                {proc.title}
                              </span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* RIGHT SIDEBAR: Procedure Rich Details View */}
          <div className="w-7/12 min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeProcedure ? (
                <motion.div
                  key={activeProcedure.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="space-y-8"
                >
                  {/* Photo Section */}
                  {activeProcedure.image ? (
                    <div className="w-full bg-[#EFE8E2] border border-clinic-border/30 overflow-hidden">
                      <img
                        src={activeProcedure.image}
                        alt={activeProcedure.title}
                        className="w-full h-auto max-h-[40vh] object-contain object-center mx-auto"
                      />
                    </div>
                  ) : (
                    /* Fallback visual sofisticado da Ferrer Innovare */
                    <div className="relative p-12 bg-clinic-surface/40 flex flex-col justify-between aspect-[21/9] w-full select-none border border-clinic-border/30">
                      <div className="flex justify-between items-start">
                        <span className="font-serif text-clinic-gold text-2xl leading-none">F</span>
                        <div className="w-12 h-[1px] bg-clinic-gold/20 mt-3"></div>
                      </div>
                      <div className="text-center py-4">
                        <span className="font-serif text-clinic-textSecondary/40 tracking-[0.2em] text-[10px] uppercase block mb-2">Procedimento</span>
                        <p className="font-serif text-2xl text-clinic-textPrimary/50 tracking-wider">
                          {activeProcedure.title}
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-12 h-[1px] bg-clinic-gold/20 mb-3"></div>
                        <span className="font-serif text-clinic-gold text-2xl leading-none">I</span>
                      </div>
                    </div>
                  )}

                  {/* Title & Descr */}
                  <div className="space-y-4">
                    <h2 className="text-3xl font-serif text-clinic-textPrimary font-normal tracking-wide">
                      {activeProcedure.title}
                    </h2>
                    {activeProcedure.short_description && (
                      <p className="text-sm text-clinic-goldDark font-medium uppercase tracking-wider">
                        {activeProcedure.short_description}
                      </p>
                    )}
                    <p className="text-sm md:text-base text-clinic-textSecondary font-light leading-relaxed whitespace-pre-line">
                      {parsedDescription}
                    </p>
                  </div>

                  {/* Modalities (Bioestimulador specific tabs) */}
                  {modalities && (
                    <div className="border border-clinic-border/40 p-6 space-y-5 bg-clinic-surface/10 mt-6">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] text-clinic-textPrimary font-semibold border-b border-clinic-border pb-2">
                        Substâncias & Protocolos Disponíveis
                      </h4>
                      <div className="flex flex-wrap gap-4 border-b border-clinic-border/20 pb-2">
                        {modalities.map((mod: any, idx: number) => {
                          const displayName = mod.name.split(' — ')[0].split(' (')[0];
                          return (
                            <button
                              key={idx}
                              onClick={() => setActiveModalityIndex(idx)}
                              className={`text-xs font-serif pb-2 -mb-[9px] border-b-2 transition-all ${
                                activeModalityIndex === idx
                                  ? 'border-clinic-gold text-clinic-textPrimary font-medium'
                                  : 'border-transparent text-clinic-textSecondary/50 hover:text-clinic-textPrimary'
                              }`}
                            >
                              {displayName}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-4 pt-2">
                        <h5 className="font-serif text-sm font-semibold text-clinic-textPrimary">
                          {modalities[activeModalityIndex].name}
                        </h5>
                        {modalities[activeModalityIndex].indications && (
                          <div>
                            <span className="text-[9px] uppercase tracking-[0.15em] text-clinic-goldDark font-semibold block mb-1">Indicações</span>
                            <ul className="text-xs text-clinic-textSecondary font-light space-y-1 pl-0 list-none">
                              {modalities[activeModalityIndex].indications.map((ind: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="w-1.5 h-[1px] bg-clinic-gold/50 mt-2 shrink-0"></span>
                                  <span>{ind}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {modalities[activeModalityIndex].differential && (
                          <div>
                            <span className="text-[9px] uppercase tracking-[0.15em] text-clinic-goldDark font-semibold block mb-1">Diferencial</span>
                            <p className="text-xs text-clinic-textSecondary font-light leading-relaxed">
                              {modalities[activeModalityIndex].differential}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-clinic-border/10">
                          {modalities[activeModalityIndex].timeline && (
                            <div>
                              <span className="text-[9px] uppercase tracking-[0.15em] text-clinic-goldDark font-semibold block mb-1">Tempo de Ação</span>
                              <p className="text-xs text-clinic-textSecondary/80 font-light">
                                {modalities[activeModalityIndex].timeline}
                              </p>
                            </div>
                          )}
                          {modalities[activeModalityIndex].maintenance && (
                            <div>
                              <span className="text-[9px] uppercase tracking-[0.15em] text-clinic-goldDark font-semibold block mb-1">Manutenção</span>
                              <p className="text-xs text-clinic-textSecondary/80 font-light">
                                {modalities[activeModalityIndex].maintenance}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Indication */}
                  {activeProcedure.indication && (
                    <div className="pt-4">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-clinic-goldDark font-bold block mb-2">Indicação</span>
                      <p className="text-xs md:text-sm text-clinic-textSecondary font-light leading-relaxed whitespace-pre-line">
                        {activeProcedure.indication}
                      </p>
                    </div>
                  )}

                  {/* How it works */}
                  {activeProcedure.how_it_works && activeProcedure.how_it_works.length > 0 && (
                    <div className="pt-4">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-clinic-goldDark font-bold block mb-3">Como Funciona / Aplicação</span>
                      <ul className="space-y-2.5">
                        {activeProcedure.how_it_works.map((item, i) => (
                          <li key={i} className="flex items-start group text-xs md:text-sm text-clinic-textSecondary font-light leading-relaxed">
                            <span className="text-clinic-border group-hover:text-clinic-gold transition-colors duration-300 mr-3 mt-0.5 text-base leading-none">○</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Benefits */}
                  {activeProcedure.benefits && activeProcedure.benefits.length > 0 && (
                    <div className="pt-4">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-clinic-goldDark font-bold block mb-3">Benefícios Principais</span>
                      <ul className="space-y-2.5">
                        {activeProcedure.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start group text-xs md:text-sm text-clinic-textSecondary font-light leading-relaxed">
                            <span className="text-clinic-border group-hover:text-clinic-gold transition-colors duration-300 mr-3 mt-0.5 text-base leading-none">○</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Duration and Maintenance */}
                  {(activeProcedure.duration || activeProcedure.maintenance) && (
                    <div className="grid grid-cols-2 gap-6 py-5 border-t border-b border-clinic-border/30">
                      {activeProcedure.duration && (
                        <div>
                          <span className="text-[9px] uppercase tracking-[0.2em] text-clinic-goldDark font-bold block mb-1">Duração Média</span>
                          <p className="text-xs md:text-sm text-clinic-textSecondary font-light leading-relaxed">
                            {activeProcedure.duration}
                          </p>
                        </div>
                      )}
                      {activeProcedure.maintenance && (
                        <div>
                          <span className="text-[9px] uppercase tracking-[0.2em] text-clinic-goldDark font-bold block mb-1">Manutenção</span>
                          <p className="text-xs md:text-sm text-clinic-textSecondary font-light leading-relaxed">
                            {activeProcedure.maintenance}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Care Accordions */}
                  {((activeProcedure.pre_care && activeProcedure.pre_care.length > 0) || (activeProcedure.post_care && activeProcedure.post_care.length > 0)) && (
                    <div className="pt-4 space-y-2">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-clinic-goldDark font-bold block mb-2">Cuidados</span>
                      
                      {activeProcedure.pre_care && activeProcedure.pre_care.length > 0 && (
                        <div className="border border-clinic-border/40">
                          <button
                            onClick={() => setPreCareOpen(!preCareOpen)}
                            className="w-full flex items-center justify-between p-3.5 bg-clinic-surface/5 hover:bg-clinic-surface/10 text-left text-xs font-semibold uppercase tracking-wider text-clinic-textPrimary"
                          >
                            <span>Antes do Procedimento</span>
                            {preCareOpen ? <ChevronUp className="w-4 h-4 text-clinic-gold" /> : <ChevronDown className="w-4 h-4 text-clinic-gold" />}
                          </button>
                          <AnimatePresence>
                            {preCareOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-white/40 border-t border-clinic-border/40"
                              >
                                <ul className="p-4 space-y-2">
                                  {activeProcedure.pre_care.map((item, i) => (
                                    <li key={i} className="text-xs text-clinic-textSecondary font-light leading-relaxed flex items-start">
                                      <span className="text-clinic-gold mr-2">•</span> {item}
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {activeProcedure.post_care && activeProcedure.post_care.length > 0 && (
                        <div className="border border-clinic-border/40">
                          <button
                            onClick={() => setPostCareOpen(!postCareOpen)}
                            className="w-full flex items-center justify-between p-3.5 bg-clinic-surface/5 hover:bg-clinic-surface/10 text-left text-xs font-semibold uppercase tracking-wider text-clinic-textPrimary"
                          >
                            <span>Após o Procedimento</span>
                            {postCareOpen ? <ChevronUp className="w-4 h-4 text-clinic-gold" /> : <ChevronDown className="w-4 h-4 text-clinic-gold" />}
                          </button>
                          <AnimatePresence>
                            {postCareOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-white/40 border-t border-clinic-border/40"
                              >
                                <ul className="p-4 space-y-2">
                                  {activeProcedure.post_care.map((item, i) => (
                                    <li key={i} className="text-xs text-clinic-textSecondary font-light leading-relaxed flex items-start">
                                      <span className="text-clinic-gold mr-2">•</span> {item}
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Important information / Differential / Contraindications */}
                  {((activeProcedure.important_information && activeProcedure.important_information.length > 0) || (activeProcedure.contraindications && activeProcedure.contraindications.length > 0)) && (
                    <div className="p-6 bg-clinic-surface/30 border border-clinic-border/50 text-left space-y-5">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-4.5 h-4.5 text-clinic-goldDark" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-clinic-textPrimary">Informações Adicionais</span>
                      </div>
                      {activeProcedure.contraindications && activeProcedure.contraindications.length > 0 && (
                        <div>
                          <span className="text-[9px] uppercase tracking-[0.15em] text-clinic-goldDark font-semibold block mb-2">Contraindicações</span>
                          <ul className="space-y-1.5">
                            {activeProcedure.contraindications.map((item, i) => (
                              <li key={i} className="text-xs text-clinic-textSecondary font-light flex items-start leading-relaxed">
                                <span className="text-clinic-goldDark mr-2">•</span> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {activeProcedure.important_information && activeProcedure.important_information.length > 0 && (
                        <div className="pt-3 border-t border-clinic-border/20">
                          {activeProcedure.important_information.map((item, i) => (
                            <p key={i} className="text-xs md:text-sm text-clinic-textSecondary font-light leading-relaxed italic mb-2">
                              "{item}"
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="pt-6 border-t border-clinic-border/30">
                    <Link
                      to={`/agendar?procedimento=${encodeURIComponent(activeProcedure.slug)}`}
                      className="inline-flex items-center justify-center h-12 px-8 bg-clinic-textPrimary text-white text-[11px] font-semibold tracking-widest uppercase transition-colors duration-500 hover:bg-clinic-goldDark rounded-none w-full sm:w-auto"
                    >
                      AGENDAR ESTE TRATAMENTO
                      <ArrowRight className="w-4 h-4 ml-3" strokeWidth={1.5} />
                    </Link>
                  </div>

                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

        </div>

        {/* MOBILE LAYOUT (Hides on Desktop) */}
        <div className="block lg:hidden w-full flex flex-col space-y-6">
          {categories.map((cat) => {
            const catProcs = getProceduresByCategory(cat.id);
            const isCatOpen = expandedCategoryMobile === cat.id;

            return (
              <div key={cat.id} className="border-b border-clinic-border/30 pb-4">
                {/* Category Heading Toggle */}
                <button
                  type="button"
                  aria-expanded={isCatOpen}
                  aria-controls={`mobile-cat-${cat.id}`}
                  onClick={() => handleCategoryToggleMobile(cat.id)}
                  className="w-full flex items-center justify-between text-left py-3 focus:outline-none focus:ring-0 group cursor-pointer active:opacity-70 transition-opacity"
                >
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono tracking-widest text-clinic-goldDark/50 mb-1">
                      {cat.key}
                    </span>
                    <h2 className="font-serif text-lg md:text-xl tracking-widest text-clinic-textPrimary transition-transform duration-300 group-hover:translate-x-[2px]">
                      {cat.name}
                    </h2>
                  </div>
                  <span className="text-xl font-light text-clinic-textSecondary/40 transition-all duration-300 group-hover:text-clinic-gold group-hover:translate-x-[2px]">
                    {isCatOpen ? '−' : '+'}
                  </span>
                </button>

                {/* Sub-list of procedures within category */}
                <AnimatePresence initial={false}>
                  {isCatOpen && (
                    <motion.div
                      id={`mobile-cat-${cat.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden mt-4 pl-4 flex flex-col space-y-3"
                    >
                      {catProcs.map((proc, index) => {
                        const isProcOpen = expandedProcedureMobileId === proc.id;
                        
                        // Local parsing inside map for each procedure
                        let localParsedDescription = proc.description || '';
                        let localModalities: any[] | null = null;
                        if (proc.description && proc.description.trim().startsWith('{')) {
                          try {
                            const parsed = JSON.parse(proc.description);
                            if (parsed.is_modalities) {
                              localParsedDescription = parsed.intro;
                              localModalities = parsed.modalities;
                            }
                          } catch (e) {
                            console.error('Failed to parse desc:', e);
                          }
                        }

                        return (
                          <div id={`proc-mobile-${proc.id}`} key={proc.id} className="border-t border-clinic-border/10 pt-3">
                            <button
                              onClick={() => handleProcedureToggleMobile(proc.id)}
                              className="w-full flex items-baseline justify-between text-left py-2 focus:outline-none focus:ring-0"
                            >
                              <div className="flex items-baseline pr-4">
                                <span className="text-[9px] font-light text-clinic-gold/70 mr-3">
                                  {(index + 1).toString().padStart(2, '0')}
                                </span>
                                <h3 className={`font-serif text-sm tracking-wide transition-colors ${
                                  isProcOpen ? 'text-clinic-gold font-normal' : 'text-clinic-textPrimary font-light'
                                }`}>
                                  {proc.title}
                                </h3>
                              </div>
                              <span className="text-[10px] text-clinic-textSecondary/40">
                                {isProcOpen ? '−' : '+'}
                              </span>
                            </button>

                            {/* Inline Expansion of details */}
                            <AnimatePresence initial={false}>
                              {isProcOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.35, ease: 'easeOut' }}
                                  className="overflow-hidden mt-3 pl-5 space-y-6 pb-4"
                                >
                                  {/* Procedure Image */}
                                  {proc.image ? (
                                    <div className="w-full bg-[#EFE8E2] border border-clinic-border/30 overflow-hidden">
                                      <img
                                        src={proc.image}
                                        alt={proc.title}
                                        className="w-full h-auto max-h-[30vh] object-contain mx-auto"
                                      />
                                    </div>
                                  ) : (
                                    <div className="relative p-8 bg-clinic-surface/40 flex flex-col justify-between aspect-[16/9] w-full select-none border border-clinic-border/30">
                                      <div className="flex justify-between items-start">
                                        <span className="font-serif text-clinic-gold text-lg">F</span>
                                      </div>
                                      <div className="text-center py-2">
                                        <p className="font-serif text-lg text-clinic-textPrimary/50">
                                          {proc.title}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Description */}
                                  <p className="text-xs md:text-sm text-clinic-textSecondary font-light leading-relaxed whitespace-pre-line">
                                    {localParsedDescription}
                                  </p>

                                  {/* Modalities (Bioestimulador specific mobile tabs) */}
                                  {localModalities && (
                                    <div className="border border-clinic-border/40 p-4 space-y-4 bg-clinic-surface/10">
                                      <div className="flex flex-wrap gap-2 border-b border-clinic-border/20 pb-2">
                                        {localModalities.map((mod: any, idx: number) => {
                                          const displayName = mod.name.split(' — ')[0].split(' (')[0];
                                          return (
                                            <button
                                              key={idx}
                                              onClick={() => setActiveModalityIndex(idx)}
                                              className={`text-[10px] font-serif pb-1 -mb-[9px] border-b-2 transition-all ${
                                                activeModalityIndex === idx
                                                  ? 'border-clinic-gold text-clinic-textPrimary font-medium'
                                                  : 'border-transparent text-clinic-textSecondary/50'
                                              }`}
                                            >
                                              {displayName}
                                            </button>
                                          );
                                        })}
                                      </div>
                                      <div className="space-y-3 pt-1">
                                        <h5 className="font-serif text-xs font-semibold text-clinic-textPrimary">
                                          {localModalities[activeModalityIndex].name}
                                        </h5>
                                        {localModalities[activeModalityIndex].indications && (
                                          <div>
                                            <span className="text-[8px] uppercase tracking-wider text-clinic-goldDark font-semibold block mb-1">Indicações</span>
                                            <ul className="text-xs text-clinic-textSecondary font-light space-y-1 list-none pl-0">
                                              {localModalities[activeModalityIndex].indications.map((ind: string, i: number) => (
                                                <li key={i} className="flex items-start gap-1">
                                                  <span className="text-clinic-gold mr-1">•</span>
                                                  <span>{ind}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {localModalities[activeModalityIndex].differential && (
                                          <div>
                                            <span className="text-[8px] uppercase tracking-wider text-clinic-goldDark font-semibold block mb-0.5">Diferencial</span>
                                            <p className="text-xs text-clinic-textSecondary font-light">
                                              {localModalities[activeModalityIndex].differential}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Indication */}
                                  {proc.indication && (
                                    <div>
                                      <span className="text-[8px] uppercase tracking-wider text-clinic-goldDark font-semibold block mb-1">Indicação</span>
                                      <p className="text-xs text-clinic-textSecondary font-light leading-relaxed whitespace-pre-line">
                                        {proc.indication}
                                      </p>
                                    </div>
                                  )}

                                  {/* How it works */}
                                  {proc.how_it_works && proc.how_it_works.length > 0 && (
                                    <div>
                                      <span className="text-[8px] uppercase tracking-wider text-clinic-goldDark font-semibold block mb-2">Como Funciona / Aplicação</span>
                                      <ul className="space-y-2">
                                        {proc.how_it_works.map((item, i) => (
                                          <li key={i} className="flex items-start text-xs text-clinic-textSecondary font-light leading-relaxed">
                                            <span className="text-clinic-gold mr-2">•</span>
                                            <span>{item}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Benefits */}
                                  {proc.benefits && proc.benefits.length > 0 && (
                                    <div>
                                      <span className="text-[8px] uppercase tracking-wider text-clinic-goldDark font-semibold block mb-2">Benefícios</span>
                                      <ul className="space-y-2">
                                        {proc.benefits.map((benefit, i) => (
                                          <li key={i} className="flex items-start text-xs text-clinic-textSecondary font-light leading-relaxed">
                                            <span className="text-clinic-gold mr-2">•</span>
                                            <span>{benefit}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Duration and Maintenance */}
                                  {(proc.duration || proc.maintenance) && (
                                    <div className="grid grid-cols-1 gap-3 py-3 border-t border-b border-clinic-border/20">
                                      {proc.duration && (
                                        <div>
                                          <span className="text-[8px] uppercase tracking-wider text-clinic-goldDark font-semibold block mb-0.5">Duração Média</span>
                                          <p className="text-xs text-clinic-textSecondary font-light">
                                            {proc.duration}
                                          </p>
                                        </div>
                                      )}
                                      {proc.maintenance && (
                                        <div>
                                          <span className="text-[8px] uppercase tracking-wider text-clinic-goldDark font-semibold block mb-0.5">Manutenção</span>
                                          <p className="text-xs text-clinic-textSecondary font-light">
                                            {proc.maintenance}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Care Accordions */}
                                  {((proc.pre_care && proc.pre_care.length > 0) || (proc.post_care && proc.post_care.length > 0)) && (
                                    <div className="space-y-2">
                                      {proc.pre_care && proc.pre_care.length > 0 && (
                                        <div className="border border-clinic-border/40">
                                          <button
                                            onClick={() => setPreCareOpen(!preCareOpen)}
                                            className="w-full flex items-center justify-between p-2.5 bg-clinic-surface/5 text-left text-[10px] font-semibold uppercase tracking-wider text-clinic-textPrimary"
                                          >
                                            <span>Antes do Procedimento</span>
                                            {preCareOpen ? <ChevronUp className="w-3.5 h-3.5 text-clinic-gold" /> : <ChevronDown className="w-3.5 h-3.5 text-clinic-gold" />}
                                          </button>
                                          <AnimatePresence>
                                            {preCareOpen && (
                                              <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-white/40 border-t border-clinic-border/40"
                                              >
                                                <ul className="p-3 space-y-1.5">
                                                  {proc.pre_care.map((item, i) => (
                                                    <li key={i} className="text-xs text-clinic-textSecondary font-light leading-relaxed flex items-start">
                                                      <span className="text-clinic-gold mr-2">•</span> {item}
                                                    </li>
                                                  ))}
                                                </ul>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      )}

                                      {proc.post_care && proc.post_care.length > 0 && (
                                        <div className="border border-clinic-border/40">
                                          <button
                                            onClick={() => setPostCareOpen(!postCareOpen)}
                                            className="w-full flex items-center justify-between p-2.5 bg-clinic-surface/5 text-left text-[10px] font-semibold uppercase tracking-wider text-clinic-textPrimary"
                                          >
                                            <span>Após o Procedimento</span>
                                            {postCareOpen ? <ChevronUp className="w-3.5 h-3.5 text-clinic-gold" /> : <ChevronDown className="w-3.5 h-3.5 text-clinic-gold" />}
                                          </button>
                                          <AnimatePresence>
                                            {postCareOpen && (
                                              <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-white/40 border-t border-clinic-border/40"
                                              >
                                                <ul className="p-3 space-y-1.5">
                                                  {proc.post_care.map((item, i) => (
                                                    <li key={i} className="text-xs text-clinic-textSecondary font-light leading-relaxed flex items-start">
                                                      <span className="text-clinic-gold mr-2">•</span> {item}
                                                    </li>
                                                  ))}
                                                </ul>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Important info / Differential / Contraindications */}
                                  {((proc.important_information && proc.important_information.length > 0) || (proc.contraindications && proc.contraindications.length > 0)) && (
                                    <div className="p-4 bg-clinic-surface/30 border border-clinic-border/50 text-left space-y-4">
                                      {proc.contraindications && proc.contraindications.length > 0 && (
                                        <div>
                                          <span className="text-[8px] uppercase tracking-wider text-clinic-goldDark font-semibold block mb-1">Contraindicações</span>
                                          <ul className="space-y-1">
                                            {proc.contraindications.map((item, i) => (
                                              <li key={i} className="text-[11px] text-clinic-textSecondary font-light flex items-start leading-relaxed">
                                                <span className="text-clinic-goldDark mr-1.5">•</span> {item}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {proc.important_information && proc.important_information.length > 0 && (
                                        <div className="pt-2 border-t border-clinic-border/20">
                                          {proc.important_information.map((item, i) => (
                                            <p key={i} className="text-[11px] text-clinic-textSecondary font-light leading-relaxed italic mb-1.5">
                                              "{item}"
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* CTAs */}
                                  <div className="pt-4 border-t border-clinic-border/30">
                                    <Link
                                      to={`/agendar?procedimento=${encodeURIComponent(proc.slug)}`}
                                      className="inline-flex items-center justify-center h-11 bg-clinic-textPrimary text-white text-[10px] font-semibold tracking-widest uppercase transition-colors duration-500 hover:bg-clinic-goldDark rounded-none w-full"
                                    >
                                      AGENDAR ESTE TRATAMENTO
                                      <ArrowRight className="w-3.5 h-3.5 ml-2.5" strokeWidth={1.5} />
                                    </Link>
                                  </div>

                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
export default TreatmentsCatalog;
