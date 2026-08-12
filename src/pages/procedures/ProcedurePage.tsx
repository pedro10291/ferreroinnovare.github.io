import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    const fetchProcedure = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('procedures')
          .select('*')
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (error || !data) {
          navigate('/'); // Redirect to home if not found
          return;
        }

        setProcedure(data as Procedure);
      } catch (error) {
        console.error('Error fetching procedure:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcedure();
  }, [slug, navigate]);

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

  if (!procedure) return null;

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
          
          {procedure.description && (
            <motion.section 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-10 md:mb-14"
            >
              <h2 className="text-xs font-semibold tracking-widest uppercase text-clinic-textPrimary mb-3 md:mb-4">O Que É</h2>
              <p className="text-base md:text-lg text-clinic-textSecondary font-light leading-relaxed whitespace-pre-line">
                {procedure.description}
              </p>
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
