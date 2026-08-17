import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabase';
import { Procedure } from '../../types/procedure';
import { CareAccordion } from '../../components/procedures/CareAccordion';
import { ReviewsCarousel } from '../../components/ui/ReviewsCarousel';
import { Skeleton } from '../../components/ui/Skeleton';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const ProcedurePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeModalityIndex, setActiveModalityIndex] = useState(0);

  useEffect(() => {
    const fetchProcedure = async () => {
      if (!slug) return;
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const { data, error: dbError } = await supabase
          .from('procedures')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (dbError) {
          console.error('Error fetching procedure:', dbError);
          setError(dbError.message);
          return;
        }

        if (!data) {
          setNotFound(true);
          return;
        }

        if (!data.active) {
          setNotFound(true);
          return;
        }

        setProcedure(data as Procedure);
      } catch (err: any) {
        console.error('Unexpected error fetching procedure:', err);
        setError(err.message || 'Erro de comunicação');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcedure();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-clinic-bg pt-32 pb-20 px-6">
        <div className="max-w-[1000px] mx-auto">
          <Skeleton className="w-48 h-4 mb-10" />
          <Skeleton className="w-full h-[400px] mb-12 rounded-none" />
          <Skeleton className="w-3/4 h-12 mb-6" />
          <Skeleton className="w-full h-24 mb-16" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-clinic-bg pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-md mx-auto">
          <div className="w-10 h-10 flex items-center justify-center rounded-full border border-red-200 text-red-500 bg-red-50/50 flex-shrink-0 mx-auto mb-6">
            <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <span className="font-serif italic text-red-500 text-2xl mb-4 block">Erro de Carregamento</span>
          <h1 className="text-3xl font-serif font-normal text-clinic-textPrimary tracking-wide mb-6">
            Não foi possível carregar as informações do procedimento.
          </h1>
          <div className="w-12 h-[1px] bg-red-200 mx-auto mb-8"></div>
          <p className="text-sm text-clinic-textSecondary font-light leading-relaxed mb-10">
            Por favor, verifique sua conexão com a internet ou tente novamente mais tarde.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center h-12 px-8 bg-clinic-textPrimary text-white text-[11px] font-semibold tracking-widest uppercase transition-colors duration-500 hover:bg-clinic-goldDark rounded-none"
            >
              Tentar Novamente
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center h-12 px-8 border border-clinic-border text-clinic-textSecondary text-[11px] font-semibold tracking-widest uppercase transition-colors duration-500 hover:text-clinic-textPrimary hover:bg-clinic-surface rounded-none"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-clinic-bg pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-md mx-auto">
          <span className="font-serif italic text-clinic-gold text-2xl mb-4 block">Procedimento Indisponível</span>
          <h1 className="text-3xl font-serif font-normal text-clinic-textPrimary tracking-wide mb-6">
            O tratamento solicitado não foi encontrado ou está temporariamente inativo.
          </h1>
          <div className="w-12 h-[1px] bg-clinic-gold/30 mx-auto mb-8"></div>
          <p className="text-sm text-clinic-textSecondary font-light leading-relaxed mb-10">
            Convidamos você a conhecer a nossa seleção completa de procedimentos estéticos projetados para destacar a sua beleza natural.
          </p>
          <Link
            to="/#tratamentos"
            className="inline-flex items-center justify-center h-12 px-8 bg-clinic-textPrimary text-white text-[11px] font-semibold tracking-widest uppercase transition-colors duration-500 hover:bg-clinic-goldDark rounded-none"
          >
            Conhecer Tratamentos
          </Link>
        </div>
      </div>
    );
  }

  if (!procedure) return null;

  // Tenta realizar o parsing da descrição para Bioestimulador de Colágeno (3 substâncias)
  let parsedDescription = procedure.description || '';
  let modalities: any[] | null = null;

  if (procedure.description && procedure.description.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(procedure.description);
      if (parsed.is_modalities) {
        parsedDescription = parsed.intro;
        modalities = parsed.modalities;
      }
    } catch (e) {
      console.error('Failed to parse description as JSON:', e);
    }
  }

  return (
    <div className="min-h-screen bg-clinic-bg pt-24 md:pt-28 pb-10 md:pb-16">
      
      {/* Breadcrumbs */}
      <div className="max-w-[1000px] mx-auto px-6 sm:px-8 lg:px-12 mb-4 md:mb-6">
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] md:text-xs font-medium tracking-wider md:tracking-widest uppercase text-clinic-textSecondary">
          <Link to="/" className="hover:text-clinic-goldDark transition-colors">Início</Link>
          <span>/</span>
          <Link to="/#tratamentos" className="hover:text-clinic-goldDark transition-colors">Tratamentos</Link>
          <span>/</span>
          <span className="text-clinic-textPrimary">{procedure.title}</span>
        </nav>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Hero Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10 md:mb-16"
        >
          {procedure.image ? (
            <div className="w-full mb-5 md:mb-8 bg-[#EFE8E2]">
              <img 
                src={procedure.image} 
                alt={`Resultado do procedimento de ${procedure.title}`} 
                className="w-full h-auto max-h-[55vh] md:max-h-[70vh] object-contain object-center"
              />
            </div>
          ) : (
            <div className="w-full aspect-video md:aspect-[21/9] mb-8 bg-clinic-surface border border-clinic-border flex flex-col items-center justify-center text-center p-8">
               <div className="w-12 h-[1px] bg-clinic-border mb-6"></div>
               <p className="font-serif text-2xl text-clinic-textSecondary mb-2">{procedure.title}</p>
               <p className="text-xs uppercase tracking-widest text-clinic-textSecondary/60">Procedimento Estético</p>
               <div className="w-12 h-[1px] bg-clinic-border mt-6"></div>
            </div>
          )}

          <div className="max-w-3xl">
            <h1 className="text-[28px] sm:text-3xl md:text-5xl lg:text-6xl font-serif text-clinic-textPrimary leading-[1.1] mb-3 md:mb-4">
              {procedure.title}
            </h1>
            {procedure.short_description && (
              <p className="text-[15px] sm:text-base md:text-xl text-clinic-textSecondary font-light leading-relaxed mb-5 md:mb-8 max-w-2xl">
                {procedure.short_description}
              </p>
            )}
            <Link
              to="/agendar"
              className="inline-flex items-center justify-center h-12 md:h-14 px-8 md:px-10 bg-clinic-textPrimary text-white text-[11px] md:text-xs font-semibold tracking-widest uppercase transition-colors duration-500 hover:bg-clinic-goldDark rounded-none"
            >
              Agendar Avaliação
              <ArrowRight className="w-4 h-4 ml-3" strokeWidth={1.5} />
            </Link>
          </div>
        </motion.div>

        <div className="max-w-3xl">
          
          {parsedDescription && (
            <motion.section 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-10 md:mb-14"
            >
              <h2 className="text-xs font-semibold tracking-widest uppercase text-clinic-textPrimary mb-3 md:mb-4">O Que É</h2>
              <p className="text-base md:text-lg text-clinic-textSecondary font-light leading-relaxed whitespace-pre-line">
                {parsedDescription}
              </p>
            </motion.section>
          )}

          {/* Substâncias & Protocolos (Tabs) para Bioestimulador de Colágeno */}
          {modalities && (
            <motion.section 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-10 md:mb-14"
            >
              <h2 className="text-xs font-semibold tracking-widest uppercase text-clinic-textPrimary mb-6">Nossas Substâncias & Protocolos</h2>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-clinic-border/30 pb-3 mb-8">
                {modalities.map((mod: any, idx: number) => {
                  const displayName = mod.name.split(' — ')[0].split(' (')[0];
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveModalityIndex(idx)}
                      className={`text-xs md:text-sm font-serif tracking-wider transition-all duration-300 pb-3 -mb-[14px] border-b-2 ${
                        activeModalityIndex === idx
                          ? 'border-clinic-gold text-clinic-textPrimary font-normal'
                          : 'border-transparent text-clinic-textSecondary/50 hover:text-clinic-textPrimary'
                      }`}
                    >
                      {displayName}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModalityIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-clinic-surface/20 border border-clinic-border/40 p-6 md:p-8 space-y-6"
                >
                  <div>
                    <h3 className="font-serif text-lg md:text-xl text-clinic-textPrimary font-normal mb-3">
                      {modalities[activeModalityIndex].name}
                    </h3>
                  </div>

                  {modalities[activeModalityIndex].indications && modalities[activeModalityIndex].indications.length > 0 && (
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.2em] text-clinic-goldDark font-semibold block mb-2">Indicações</span>
                      <ul className="text-xs md:text-sm text-clinic-textSecondary/90 font-light space-y-1.5 list-none pl-0">
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
                      <span className="text-[9px] uppercase tracking-[0.2em] text-clinic-goldDark font-semibold block mb-1">Diferencial</span>
                      <p className="text-xs md:text-sm text-clinic-textSecondary/90 font-light leading-relaxed">
                        {modalities[activeModalityIndex].differential}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-clinic-border/20">
                    {modalities[activeModalityIndex].timeline && (
                      <div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-clinic-goldDark font-semibold block mb-1">Tempo de Ação</span>
                        <p className="text-xs text-clinic-textSecondary/80 font-light leading-relaxed">
                          {modalities[activeModalityIndex].timeline}
                        </p>
                      </div>
                    )}
                    {modalities[activeModalityIndex].maintenance && (
                      <div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-clinic-goldDark font-semibold block mb-1">Manutenção</span>
                        <p className="text-xs text-clinic-textSecondary/80 font-light leading-relaxed">
                          {modalities[activeModalityIndex].maintenance}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.section>
          )}

          {procedure.indication && (
            <motion.section 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-10 md:mb-14"
            >
              <h2 className="text-xs font-semibold tracking-widest uppercase text-clinic-textPrimary mb-3 md:mb-4">Indicações</h2>
              <p className="text-base md:text-lg text-clinic-textSecondary font-light leading-relaxed whitespace-pre-line">
                {procedure.indication}
              </p>
            </motion.section>
          )}

          {procedure.how_it_works && procedure.how_it_works.length > 0 && (
            <motion.section 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-10 md:mb-14"
            >
              <h2 className="text-xs font-semibold tracking-widest uppercase text-clinic-textPrimary mb-4">Como Funciona / Aplicação</h2>
              <ul className="space-y-2 md:space-y-3">
                {procedure.how_it_works.map((item, i) => (
                  <li key={i} className="flex items-start group">
                    <span className="text-clinic-border group-hover:text-clinic-gold transition-colors duration-300 mr-4 mt-1 font-serif text-lg leading-none">○</span>
                    <span className="text-base md:text-lg text-clinic-textSecondary font-light leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {procedure.benefits && procedure.benefits.length > 0 && (
            <motion.section 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-10 md:mb-14"
            >
              <h2 className="text-xs font-semibold tracking-widest uppercase text-clinic-textPrimary mb-4">Benefícios Principais</h2>
              <ul className="space-y-2 md:space-y-3">
                {procedure.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start group">
                    <span className="text-clinic-border group-hover:text-clinic-gold transition-colors duration-300 mr-4 mt-1 font-serif text-lg leading-none">○</span>
                    <span className="text-base md:text-lg text-clinic-textSecondary font-light leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {/* Duração & Manutenção Grid */}
          {(procedure.duration || procedure.maintenance) && (
            <motion.section 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-10 md:mb-14 grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-t border-b border-clinic-border/30"
            >
              {procedure.duration && (
                <div>
                  <h3 className="text-xs font-semibold tracking-widest uppercase text-clinic-textPrimary mb-2">Duração Média</h3>
                  <p className="text-sm md:text-base text-clinic-textSecondary font-light leading-relaxed">{procedure.duration}</p>
                </div>
              )}
              {procedure.maintenance && (
                <div>
                  <h3 className="text-xs font-semibold tracking-widest uppercase text-clinic-textPrimary mb-2">Manutenção</h3>
                  <p className="text-sm md:text-base text-clinic-textSecondary font-light leading-relaxed">{procedure.maintenance}</p>
                </div>
              )}
            </motion.section>
          )}

          {/* Accordions */}
          {(procedure.pre_care || procedure.post_care) && (
            <motion.section 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-10 md:mb-14"
            >
              <h2 className="text-xs font-semibold tracking-widest uppercase text-clinic-textPrimary mb-4">Cuidados</h2>
              <div className="border-t border-clinic-border">
                {procedure.pre_care && procedure.pre_care.length > 0 && (
                  <CareAccordion title="Antes do procedimento" items={procedure.pre_care} />
                )}
                {procedure.post_care && procedure.post_care.length > 0 && (
                  <CareAccordion title="Após o procedimento" items={procedure.post_care} />
                )}
              </div>
            </motion.section>
          )}

          {/* Importante / Contraindicações */}
          {(procedure.important_information || procedure.contraindications) && (
            <motion.section 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-10 md:mb-14 p-6 md:p-8 bg-clinic-surface border border-clinic-border"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-full border border-clinic-goldDark text-clinic-goldDark bg-clinic-goldDark/5 flex-shrink-0">
                  <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h2 className="text-xs font-bold tracking-widest uppercase text-clinic-textPrimary">Aviso Importante</h2>
              </div>
              
              {procedure.contraindications && procedure.contraindications.length > 0 && (
                <div className="mb-8">
                  <ul className="space-y-3">
                    {procedure.contraindications.map((item, i) => (
                      <li key={i} className="text-sm md:text-base text-clinic-textSecondary font-light flex items-start">
                        <span className="mr-3 text-clinic-goldDark">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {procedure.important_information && procedure.important_information.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-clinic-border/50">
                  {procedure.important_information.map((item, i) => (
                    <p key={i} className="text-sm md:text-base text-clinic-textSecondary font-light leading-relaxed italic">
                      "{item}"
                    </p>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mb-12 md:mb-16 text-center flex flex-col items-center md:items-start"
          >
            <p className="font-serif text-2xl md:text-3xl text-clinic-textPrimary mb-5">Cada caso é único.</p>
            <Link
              to="/agendar"
              className="inline-flex items-center justify-center h-12 md:h-14 px-8 md:px-12 bg-clinic-textPrimary text-white text-[11px] md:text-xs font-semibold tracking-widest uppercase transition-colors duration-500 hover:bg-clinic-goldDark rounded-none"
            >
              Agendar Avaliação
              <ArrowRight className="w-4 h-4 ml-3" strokeWidth={1.5} />
            </Link>
          </motion.div>
          
          {/* Avaliações do Google */}
          <motion.section
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="py-10 md:py-16 border-t border-clinic-border text-center flex flex-col items-center"
          >
            <span className="text-[10px] md:text-xs font-semibold tracking-widest uppercase text-clinic-goldDark mb-3 md:mb-4 block">Experiências</span>
            <h2 className="text-2xl md:text-3xl font-serif text-clinic-textPrimary mb-8">O que nossas pacientes dizem</h2>
            
            <ReviewsCarousel />
          </motion.section>

        </div>

      </div>
    </div>
  );
};
