import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../services/supabase';
import { Link, useSearchParams } from 'react-router-dom';
import { Procedure } from '../../types/procedure';
import { UNAVAILABLE_PROCEDURE_SLUGS } from '../../config/constants';
import { getTrackingData } from '../../components/Tracking';
import { generateProcedureBookingWhatsAppLink } from '../../utils/whatsapp';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

const requestSchema = z.object({
  // Etapa 1
  desired_procedures: z.array(z.string()).min(1, 'Selecione pelo menos um objetivo.'),
  main_concerns: z.array(z.string()).min(1, 'Selecione pelo menos um incômodo.'),
  main_concerns_other: z.string().optional(),
  
  // Etapa 2
  previous_procedures: z.string().min(1, 'Selecione uma opção.'),
  previous_procedures_details: z.string().optional(),
  existing_fillers: z.string().min(1, 'Selecione uma opção.'),
  
  // Etapa 3
  health_conditions: z.array(z.string()).min(1, 'Selecione pelo menos uma opção.'),
  health_condition_other: z.string().optional(),
  continuous_medication: z.string().min(1, 'Selecione uma opção.'),
  continuous_medication_details: z.string().optional(),
  pregnancy_breastfeeding: z.string().min(1, 'Selecione uma opção.'),
  allergies: z.string().min(1, 'Selecione uma opção.'),
  allergies_details: z.string().optional(),
  
  // Etapa 4
  desired_result: z.string().min(1, 'Selecione uma opção.'),
  consultation_expectation: z.string().min(1, 'Selecione uma opção.'),
  
  // Dados Pessoais
  name: z.string().min(3, 'Nome é obrigatório.'),
  phone: z.string().min(10, 'Telefone inválido.'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória.'),
  discovery_channel: z.string().optional(),
  discovery_channel_other: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

const steps = [
  { id: 1, title: 'O que você busca?' },
  { id: 2, title: 'Histórico' },
  { id: 3, title: 'Informações Importantes' },
  { id: 4, title: 'Expectativa e Dados' },
];

const CheckboxGroup = ({ 
  options, 
  value, 
  onChange, 
  type = "checkbox" 
}: { 
  options: string[], 
  value: string[], 
  onChange: (val: string[]) => void, 
  type?: "checkbox" | "radio" 
}) => {
  
  const handleSelect = (option: string) => {
    if (type === 'checkbox') {
      if (value.includes(option)) {
        onChange(value.filter((item) => item !== option));
      } else {
        onChange([...value, option]);
      }
    } else {
      onChange([option]);
    }
  };

  return (
    <div className="flex flex-col border-t border-clinic-border/60">
      {options.map((option) => {
        const isSelected = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => handleSelect(option)}
            className={`flex items-center justify-between py-4 px-2 border-b border-clinic-border/60 text-left transition-all duration-300 w-full group relative ${
              isSelected 
                ? 'text-clinic-goldDark pl-4' 
                : 'text-clinic-textSecondary hover:text-clinic-textPrimary hover:pl-3'
            }`}
          >
            {/* Linha vertical sutil rosé gold para a opção ativa */}
            {isSelected && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-clinic-gold"></span>
            )}
            
            <span className={`text-sm tracking-wide transition-all duration-300 font-light ${isSelected ? 'font-medium' : ''}`}>
              {option}
            </span>

            {/* Marcador delicado de seleção */}
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 ${
              isSelected ? 'border-clinic-gold bg-clinic-gold/10' : 'border-clinic-border group-hover:border-clinic-gold/40'
            }`}>
              {isSelected && <div className="w-1.5 h-1.5 bg-clinic-gold rounded-full" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export const AnamnesisForm = () => {
  const [searchParams] = useSearchParams();
  const procedureSlug = searchParams.get('procedimento');
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const turnstileRef = React.useRef<TurnstileInstance>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    // Definimos explicitamente strings vazias para TODOS os campos do schema Zod
    // para evitar que o React Hook Form envie 'undefined' gerando erros de validação Zod.
    defaultValues: {
      desired_procedures: [],
      main_concerns: [],
      main_concerns_other: '',
      previous_procedures: '',
      previous_procedures_details: '',
      existing_fillers: '',
      health_conditions: [],
      health_condition_other: '',
      continuous_medication: '',
      continuous_medication_details: '',
      pregnancy_breastfeeding: '',
      allergies: '',
      allergies_details: '',
      desired_result: '',
      consultation_expectation: '',
      name: '',
      phone: '',
      birthDate: '',
    }
  });


  const watchAll = watch();

  const handleNext = (nextId) => {
    setActiveStep(nextId);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const stepElement = document.getElementById(`step-${activeStep}`);
      if (stepElement) {
        // Calculate offset considering fixed header
        const y = stepElement.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 150); // wait slightly for layout animations to start
    return () => clearTimeout(timeoutId);
  }, [activeStep]);

  const renderStep = (
    id,
    question,
    summary,
    isAnswered,
    contentNode
  ) => {
    const isActive = activeStep === id;
    const isPast = activeStep > id || (isAnswered && !isActive);

    if (!isActive && !isPast) return null;

    if (!isActive && isPast) {
      return (
        <div key={id} id={`step-${id}-collapsed`} onClick={() => setActiveStep(id)}
          className="py-5 border-b border-clinic-border/60 flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <span className="font-serif text-lg text-clinic-gold">{id.toString().padStart(2, '0')}</span>
            <span className="text-sm font-light text-clinic-textPrimary group-hover:text-clinic-gold transition-colors line-clamp-1 max-w-[220px] md:max-w-md">
              ✓ {summary}
            </span>
          </div>
        </div>
      );
    }

    return (
      <motion.div key={id} id={`step-${id}`} layout initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, height: 0 }}
        className="py-8 border-b border-clinic-border/60 space-y-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="font-serif text-2xl text-clinic-gold">{id.toString().padStart(2, '0')}</span>
          <span className="text-[10px] tracking-[0.2em] text-clinic-textSecondary uppercase font-semibold">
            Progresso
          </span>
        </div>
        
        <h3 className="text-xl md:text-2xl font-serif text-clinic-textPrimary leading-tight mb-8">
          {question}
        </h3>
        
        {contentNode}
        
      </motion.div>
    );
  };

  useEffect(() => {
    const fetchSelectedProcedure = async () => {
      if (!procedureSlug || UNAVAILABLE_PROCEDURE_SLUGS.includes(procedureSlug as typeof UNAVAILABLE_PROCEDURE_SLUGS[number])) return;

      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .eq('slug', procedureSlug)
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Não foi possível recuperar o procedimento selecionado:', error);
        return;
      }

      if (data) {
        const procedure = data as Procedure;
        setSelectedProcedure(procedure);
        setValue('desired_procedures', [procedure.title], { shouldValidate: true });
      }
    };

    fetchSelectedProcedure();
  }, [procedureSlug, setValue]);


  const onSubmit = async (data: RequestFormData) => {
    if (!turnstileToken) {
      alert('Aguarde a validação de segurança do sistema.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const normalizedPhone = data.phone.replace(/\D/g, '');

      // Formatação humana de texto para popular as colunas da tabela anamnesis via RPC do Supabase
      const formatMedicalHistory = () => {
        if (data.health_conditions.includes('Nenhuma das anteriores')) {
          return 'Nenhuma condição informada';
        }
        let history = data.health_conditions.join(', ');
        if (data.health_conditions.includes('Outra') && data.health_condition_other) {
          history = history.replace('Outra', `Outra (${data.health_condition_other})`);
        }
        return history || 'Nenhuma das anteriores';
      };

      const formatMedications = () => {
        if (data.continuous_medication === 'Sim' && data.continuous_medication_details) {
          return `Uso contínuo de: ${data.continuous_medication_details}`;
        }
        if (data.continuous_medication === 'Não') {
          return 'Não utiliza medicamentos de uso contínuo';
        }
        return 'Não informado';
      };

      const formatSurgeries = () => {
        if (data.previous_procedures !== 'Nunca') {
          const detail = data.previous_procedures_details ? ` (${data.previous_procedures_details})` : '';
          return `${data.previous_procedures}${detail}`;
        }
        if (data.previous_procedures === 'Nunca') {
          return 'Nunca realizou procedimentos anteriores';
        }
        return 'Não informado';
      };

      const formatHabits = () => {
        return `Resultado desejado: ${data.desired_result}\nExpectativa: ${data.consultation_expectation}`;
      };

      const procedureName = selectedProcedure?.title || data.desired_procedures[0] || null;

      const formatNotes = () => {
        return `Interesse original: ${procedureName || 'Avaliação Geral'}\nIncômodos principais: ${data.main_concerns.join(', ')}`;
      };
      
      const clinicalData = {
        // Novo formato estruturado (mantido para compatibilidade e exibição detalhada)
        desired_procedures: data.desired_procedures,
        main_concerns: data.main_concerns,
        main_concerns_other: data.main_concerns_other || null,
        previous_procedures: {
          answer: data.previous_procedures,
          details: data.previous_procedures_details || null
        },
        existing_fillers: data.existing_fillers,
        health_conditions: data.health_conditions,
        health_condition_other: data.health_condition_other || null,
        continuous_medication: {
          answer: data.continuous_medication,
          details: data.continuous_medication_details || null
        },
        pregnancy_breastfeeding: data.pregnancy_breastfeeding,
        allergies: {
          answer: data.allergies,
          details: data.allergies_details || null
        },
        desired_result: data.desired_result,
        consultation_expectation: data.consultation_expectation,
        birthDate: data.birthDate,

        // Rastreamento de Origem
        origin: {
          reported: data.discovery_channel || null,
          reported_custom: data.discovery_channel_other || null,
          ...getTrackingData()
        },

        // Chaves mapeadas explicitamente que a RPC do banco consome
        medicalHistory: formatMedicalHistory(),
        medications: formatMedications(),
        surgeries: formatSurgeries(),
        habits: formatHabits(),
        notes: formatNotes()
      };

      const payload = {
        full_name: data.name,
        email: null,
        phone: normalizedPhone,
        procedure_interest: procedureName || 'Avaliação Geral',
        message: null,
        clinical_data: clinicalData
      };

      // Dispara POST para Edge Function validada por Turnstile
      const functionPayload = {
        turnstile_token: turnstileToken,
        ...payload
      };
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iktdzmigzmtgumqukutd.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/public-submit-contact-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(functionPayload)
      });
      
      if (!response.ok) {
        let errMessage = 'Falha ao processar solicitação';
        try {
          const errData = await response.json();
          if (import.meta.env.DEV) {
            // Em DEV, mostrar erro detalhado para facilitar debug
            alert(`[DEV DEBUG] HTTP ${response.status}\nBody: ${JSON.stringify(errData, null, 2)}`);
          }
          if (errData.error) errMessage = errData.error;
        } catch (e) {
          if (import.meta.env.DEV) {
             alert(`[DEV DEBUG] HTTP ${response.status}\nCould not parse JSON.`);
          }
        }
        throw new Error(errMessage);
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error(error);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      alert(error.message || 'Não foi possível enviar sua solicitação. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (submitted) {
    return (
      <div className="min-h-[80vh] pt-32 pb-16 px-6 bg-[#FCFBF9] flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-clinic-gold/10 text-clinic-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-serif text-clinic-textPrimary leading-snug">Pronto.<br/>Recebemos suas informações.</h2>
          <p className="text-sm text-clinic-textSecondary font-light leading-relaxed max-w-sm mx-auto">
            Agora nossa equipe poderá entender melhor o que você busca e preparar seu atendimento. Entraremos em contato em breve.
          </p>
          <div className="pt-8 flex flex-col items-center gap-4">
            <a
              href={generateProcedureBookingWhatsAppLink(selectedProcedure?.title || watchAll.desired_procedures?.[0])}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 h-12 bg-clinic-textPrimary hover:bg-clinic-goldDark text-white rounded-none uppercase tracking-widest text-xs transition-colors duration-300"
            >
              Continuar para o WhatsApp
            </a>
            <Link to="/" className="text-[10px] uppercase tracking-[0.2em] text-clinic-textSecondary hover:text-clinic-goldDark transition-colors">
              Voltar para o site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 md:pt-36 pb-36 md:pb-40 px-6 bg-[#FCFBF9]">
      <div className="max-w-[620px] mx-auto pb-[60vh]">
        
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-clinic-gold font-bold mb-4 block">Pré-Consulta</span>
          <h2 className="text-3xl md:text-4xl font-serif text-clinic-dark mb-4">Ferrer Innovare Clinic</h2>
          <p className="text-clinic-textSecondary font-light text-sm max-w-sm mx-auto leading-relaxed">
            Responda de forma rápida. Suas escolhas guiarão nosso atendimento.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col border-t border-clinic-border/60">
            
            {renderStep(
              1,
              'Qual procedimento ou resultado você está buscando?',
              watchAll.desired_procedures?.join(', ') || '',
              watchAll.desired_procedures?.length > 0,
              <div className="space-y-6">
                <Controller
                  control={control}
                  name="desired_procedures"
                  render={({ field }) => (
                    <CheckboxGroup 
                      options={[
                        ...(selectedProcedure ? [selectedProcedure.title] : []),
                        'Rejuvenescimento facial',
                        'Botox',
                        'Preenchimento',
                        'Fios de PDO',
                        'Bioestimulador de colágeno',
                        'Tratamento da pele/manchas',
                        'Micropigmentação',
                        'Laser/despigmentação',
                        'Ainda não sei, quero orientação'
                      ]}
                      value={field.value || []}
                      onChange={(val) => {
    if (val.includes('Ainda não sei, quero orientação')) {
      field.onChange(['Ainda não sei, quero orientação']);
    } else {
      field.onChange(val.filter(v => v !== 'Ainda não sei, quero orientação'));
    }
    handleNext(2);
  }}
                    />
                  )}
                />
                {errors.desired_procedures && <p className="text-red-500 text-xs mt-1">{errors.desired_procedures.message}</p>}
                
              </div>
            )}

            {renderStep(
              2,
              'O que mais incomoda você atualmente?',
              watchAll.main_concerns?.join(', ') || '',
              watchAll.main_concerns?.length > 0,
              <div className="space-y-6">
                <Controller
                  control={control}
                  name="main_concerns"
                  render={({ field }) => (
                    <CheckboxGroup 
                      options={[
                        'Rugas ou linhas de expressão',
                        'Flacidez',
                        'Falta de contorno facial',
                        'Falta de volume',
                        'Olheiras',
                        'Manchas/pigmentação',
                        'Assimetria',
                        'Quero melhorar minha aparência de forma geral',
                        'Outro'
                      ]}
                      value={field.value || []}
                      onChange={(val) => {
    field.onChange(val);
    if (!val.includes('Outro')) handleNext(3);
  }}
                    />
                  )}
                />
                {errors.main_concerns && <p className="text-red-500 text-xs mt-1">{errors.main_concerns.message}</p>}
                {watchAll.main_concerns?.includes('Outro') && (
                  <div className="mt-4 flex items-end gap-2">
    <div className="flex-1">
      <Input 
        placeholder="Especifique..."
        {...register('main_concerns_other')}
        className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors placeholder:text-clinic-textSecondary/40 font-light text-sm"
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleNext(3))}
      />
    </div>
    <button type="button" onClick={() => handleNext(3)} className="bg-clinic-gold text-white px-4 py-2.5 text-[10px] tracking-widest uppercase hover:bg-clinic-goldDark transition-colors flex-shrink-0">OK</button>
  </div>
                )}
                
              </div>
            )}

            {renderStep(
              3,
              'Você já realizou algum procedimento estético?',
              watchAll.previous_procedures || '',
              !!watchAll.previous_procedures,
              <div className="space-y-6">
                <Controller
                  control={control}
                  name="previous_procedures"
                  render={({ field }) => (
                    <CheckboxGroup 
                      type="radio"
                      options={[
                        'Nunca',
                        'Botox',
                        'Preenchimento',
                        'Bioestimulador',
                        'Fios',
                        'Outro'
                      ]}
                      value={field.value ? [field.value] : []}
                      onChange={(val) => {
    const selected = val[val.length - 1] || '';
    field.onChange(selected);
    if (!['Botox', 'Preenchimento', 'Bioestimulador', 'Fios', 'Outro'].includes(selected)) handleNext(4);
  }}
                    />
                  )}
                />
                {errors.previous_procedures && <p className="text-red-500 text-xs mt-1">{errors.previous_procedures.message}</p>}
                {['Botox', 'Preenchimento', 'Bioestimulador', 'Fios', 'Outro'].includes(watchAll.previous_procedures || '') && (
                  <div className="mt-4 flex items-end gap-2">
    <div className="flex-1">
      <Input 
        placeholder="Quais procedimentos e quando? (Aproximadamente)"
        {...register('previous_procedures_details')}
        className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors placeholder:text-clinic-textSecondary/40 font-light text-sm"
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleNext(4))}
      />
    </div>
    <button type="button" onClick={() => handleNext(4)} className="bg-clinic-gold text-white px-4 py-2.5 text-[10px] tracking-widest uppercase hover:bg-clinic-goldDark transition-colors flex-shrink-0">OK</button>
  </div>
                )}
                
              </div>
            )}

            {renderStep(
              4,
              'Você possui algum preenchimento ou outro produto aplicado na região que deseja tratar?',
              watchAll.existing_fillers || '',
              !!watchAll.existing_fillers,
              <div className="space-y-6">
                <Controller
                  control={control}
                  name="existing_fillers"
                  render={({ field }) => (
                    <CheckboxGroup 
                      type="radio"
                      options={[
                        'Não possuo preenchimento',
                        'Sim, Ácido Hialurônico',
                        'Sim, PMMA ou silicone',
                        'Não tenho certeza do produto'
                      ]}
                      value={field.value ? [field.value] : []}
                      onChange={(val) => {
                        field.onChange(val[val.length - 1] || '');
                        handleNext(5);
                      }}
                    />
                  )}
                />
                {errors.existing_fillers && <p className="text-red-500 text-xs mt-1">{errors.existing_fillers.message}</p>}
              </div>
            )}

            {renderStep(
              5,
              'Você possui alguma destas condições?',
              watchAll.health_conditions?.join(', ') || '',
              watchAll.health_conditions?.length > 0,
              <div className="space-y-6">
                <Controller
                  control={control}
                  name="health_conditions"
                  render={({ field }) => (
                    <CheckboxGroup 
                      options={[
                        'Nenhuma das anteriores',
                        'Diabetes',
                        'Hipertensão',
                        'Doença Autoimune',
                        'Problemas de coagulação',
                        'Problemas de tireoide',
                        'Outra'
                      ]}
                      value={field.value || []}
                      onChange={(val) => {
    if (val.includes('Nenhuma das anteriores')) {
      field.onChange(['Nenhuma das anteriores']);
      handleNext(6);
    } else {
      field.onChange(val.filter(v => v !== 'Nenhuma das anteriores'));
      if (!val.includes('Outra')) handleNext(6);
    }
  }}
                    />
                  )}
                />
                {errors.health_conditions && <p className="text-red-500 text-xs mt-1">{errors.health_conditions.message}</p>}
                {watchAll.health_conditions?.includes('Outra') && (
                  <div className="mt-4 flex items-end gap-2">
    <div className="flex-1">
      <Input 
        placeholder="Qual condição?"
        {...register('health_condition_other')}
        className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors placeholder:text-clinic-textSecondary/40 font-light text-sm"
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleNext(6))}
      />
    </div>
    <button type="button" onClick={() => handleNext(6)} className="bg-clinic-gold text-white px-4 py-2.5 text-[10px] tracking-widest uppercase hover:bg-clinic-goldDark transition-colors flex-shrink-0">OK</button>
  </div>
                )}
                
              </div>
            )}

            {renderStep(
              6,
              'Faz uso de medicamentos de uso contínuo?',
              watchAll.continuous_medication || '',
              !!watchAll.continuous_medication,
              <div className="space-y-6">
                <Controller
                  control={control}
                  name="continuous_medication"
                  render={({ field }) => (
                    <CheckboxGroup 
                      type="radio"
                      options={['Não', 'Sim']}
                      value={field.value ? [field.value] : []}
                      onChange={(val) => {
    const selected = val[val.length - 1] || '';
    field.onChange(selected);
    if (selected === 'Não') handleNext(7);
  }}
                    />
                  )}
                />
                {errors.continuous_medication && <p className="text-red-500 text-xs mt-1">{errors.continuous_medication.message}</p>}
                {watchAll.continuous_medication === 'Sim' && (
                  <div className="mt-4 flex items-end gap-2">
    <div className="flex-1">
      <Input 
        placeholder="Quais medicamentos?"
        {...register('continuous_medication_details')}
        className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors placeholder:text-clinic-textSecondary/40 font-light text-sm"
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleNext(7))}
      />
    </div>
    <button type="button" onClick={() => handleNext(7)} className="bg-clinic-gold text-white px-4 py-2.5 text-[10px] tracking-widest uppercase hover:bg-clinic-goldDark transition-colors flex-shrink-0">OK</button>
  </div>
                )}
                
              </div>
            )}

            {renderStep(
              7,
              'Está grávida ou amamentando?',
              watchAll.pregnancy_breastfeeding || '',
              !!watchAll.pregnancy_breastfeeding,
              <div className="space-y-6">
                <Controller
                  control={control}
                  name="pregnancy_breastfeeding"
                  render={({ field }) => (
                    <CheckboxGroup 
                      type="radio"
                      options={['Não', 'Sim, gestante', 'Sim, amamentando']}
                      value={field.value ? [field.value] : []}
                      onChange={(val) => {
                        field.onChange(val[val.length - 1] || '');
                        handleNext(8);
                      }}
                    />
                  )}
                />
                {errors.pregnancy_breastfeeding && <p className="text-red-500 text-xs mt-1">{errors.pregnancy_breastfeeding.message}</p>}
              </div>
            )}

            {renderStep(
              8,
              'Possui alguma alergia conhecida?',
              watchAll.allergies || '',
              !!watchAll.allergies,
              <div className="space-y-6">
                <Controller
                  control={control}
                  name="allergies"
                  render={({ field }) => (
                    <CheckboxGroup 
                      type="radio"
                      options={['Não', 'Sim']}
                      value={field.value ? [field.value] : []}
                      onChange={(val) => {
    const selected = val[val.length - 1] || '';
    field.onChange(selected);
    if (selected === 'Não') handleNext(9);
  }}
                    />
                  )}
                />
                {errors.allergies && <p className="text-red-500 text-xs mt-1">{errors.allergies.message}</p>}
                {watchAll.allergies === 'Sim' && (
                  <div className="mt-4 flex items-end gap-2">
    <div className="flex-1">
      <Input 
        placeholder="Alergia a quê?"
        {...register('allergies_details')}
        className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors placeholder:text-clinic-textSecondary/40 font-light text-sm"
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleNext(9))}
      />
    </div>
    <button type="button" onClick={() => handleNext(9)} className="bg-clinic-gold text-white px-4 py-2.5 text-[10px] tracking-widest uppercase hover:bg-clinic-goldDark transition-colors flex-shrink-0">OK</button>
  </div>
                )}
                
              </div>
            )}

            {renderStep(
              9,
              'Como você gostaria que fosse o resultado?',
              watchAll.desired_result || '',
              !!watchAll.desired_result,
              <div className="space-y-6">
                <Controller
                  control={control}
                  name="desired_result"
                  render={({ field }) => (
                    <CheckboxGroup 
                      type="radio"
                      options={[
                        'Natural e discreto',
                        'Quero perceber bastante a mudança',
                        'Ainda não sei, quero orientação profissional'
                      ]}
                      value={field.value ? [field.value] : []}
                      onChange={(val) => {
                        field.onChange(val[val.length - 1] || '');
                        handleNext(10);
                      }}
                    />
                  )}
                />
                {errors.desired_result && <p className="text-red-500 text-xs mt-1">{errors.desired_result.message}</p>}
              </div>
            )}

            {renderStep(
              10,
              'O que você espera da sua avaliação?',
              watchAll.consultation_expectation || '',
              !!watchAll.consultation_expectation,
              <div className="space-y-6">
                <Controller
                  control={control}
                  name="consultation_expectation"
                  render={({ field }) => (
                    <CheckboxGroup 
                      type="radio"
                      options={[
                        'Já sei o que quero fazer',
                        'Quero saber qual procedimento é mais indicado',
                        'Quero montar um plano de tratamento'
                      ]}
                      value={field.value ? [field.value] : []}
                      onChange={(val) => {
                        field.onChange(val[val.length - 1] || '');
                        handleNext(11);
                      }}
                    />
                  )}
                />
                {errors.consultation_expectation && <p className="text-red-500 text-xs mt-1">{errors.consultation_expectation.message}</p>}
              </div>
            )}

            {renderStep(
              11,
              'Seus dados para contato',
              watchAll.name ? watchAll.name : 'Dados Pessoais',
              false,
              <div className="space-y-8 mt-4">
                
                <div className="space-y-6">
                  <Input 
                    placeholder="Nome completo"
                    {...register('name')}
                    error={errors.name?.message}
                    className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors placeholder:text-clinic-textSecondary/40 font-light text-sm"
                  />
                  <Input 
                    placeholder="WhatsApp (com DDD)"
                    {...register('phone')}
                    error={errors.phone?.message}
                    className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors placeholder:text-clinic-textSecondary/40 font-light text-sm"
                  />
                  <div className="space-y-1">
                    <Input 
                      type="date"
                      {...register('birthDate')}
                      error={errors.birthDate?.message}
                      className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors text-clinic-textSecondary font-light text-sm"
                    />
                    <p className="text-[10px] text-clinic-textSecondary/60 mt-1.5 uppercase tracking-wider font-light">Data de nascimento</p>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <label className="block text-clinic-textPrimary font-medium text-sm">Como você conheceu a Ferrer Innovare? (Opcional)</label>
                  <Controller
  control={control}
  name="discovery_channel"
  render={({ field }) => (
    <div className="relative">
      <button 
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border/60 rounded-none px-0 py-3 text-clinic-textPrimary text-sm font-light focus:outline-none focus:border-clinic-gold transition-colors flex justify-between items-center"
      >
        <span>{field.value || 'Selecione uma opção'}</span>
        <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      
      <AnimatePresence>
        {isDropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
            
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 w-full mt-1 bg-[#FCFBF9] border border-clinic-border/40 z-50 shadow-sm max-h-60 overflow-y-auto"
            >
              {[
                { label: 'Selecione uma opção', value: '' },
                { label: 'Instagram', value: 'Instagram' },
                { label: 'Facebook', value: 'Facebook' },
                { label: 'Google', value: 'Google' },
                { label: 'TikTok', value: 'TikTok' },
                { label: 'WhatsApp', value: 'WhatsApp' },
                { label: 'Indicação', value: 'Indicação' },
                { label: 'Já sou cliente', value: 'Já sou cliente' },
                { label: 'Outro', value: 'Outro' },
              ].map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    field.onChange(opt.value);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-light border-b border-clinic-border/20 last:border-b-0 hover:text-clinic-gold transition-colors ${field.value === opt.value ? 'text-clinic-gold font-medium' : 'text-clinic-textPrimary'}`}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )}
/>
                  {watchAll.discovery_channel === 'Outro' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                      <label className="block text-clinic-textPrimary font-medium mb-2 text-sm">Qual?</label>
                      <Input
                        {...register('discovery_channel_other')}
                        placeholder="Ex: Vi na rua, Evento, etc..."
                        className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors placeholder:text-clinic-textSecondary/40 font-light text-sm"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="bg-clinic-surface/30 p-6 border-l border-clinic-gold text-xs text-clinic-textSecondary leading-relaxed italic font-light my-8">
                  <strong>IMPORTANTE:</strong> Esta pré-consulta tem como objetivo conhecer melhor suas necessidades e realizar uma triagem inicial. As respostas não substituem a avaliação presencial. A indicação e realização de qualquer procedimento dependerão de avaliação individual, histórico clínico e critérios de segurança.
                </div>

                  <div className="pt-6 border-t border-clinic-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-shrink-0">
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={import.meta.env.DEV ? "1x00000000000000000000AA" : (import.meta.env.VITE_TURNSTILE_SITE_KEY || "")}
                        onSuccess={(token) => setTurnstileToken(token)}
                        onError={() => setTurnstileToken(null)}
                        onExpire={() => setTurnstileToken(null)}
                        options={{ theme: "light" }}
                      />
                    </div>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="w-full sm:w-auto px-10 h-12 bg-clinic-gold hover:bg-clinic-goldDark text-white rounded-none uppercase tracking-widest text-[11px] transition-all duration-300"
                  >
                    Enviar pré-consulta
                  </Button>
                </div>
              </div>
            )}

          </div>
        </form>
      </div>
    </div>
  );
};
