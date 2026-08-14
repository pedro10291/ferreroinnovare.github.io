import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../services/supabase';
import { Link } from 'react-router-dom';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
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

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ['desired_procedures', 'main_concerns', 'main_concerns_other'];
    if (currentStep === 2) fieldsToValidate = ['previous_procedures', 'previous_procedures_details', 'existing_fillers'];
    if (currentStep === 3) fieldsToValidate = ['health_conditions', 'health_condition_other', 'continuous_medication', 'continuous_medication_details', 'pregnancy_breastfeeding', 'allergies', 'allergies_details'];
    if (currentStep === 4) fieldsToValidate = ['desired_result', 'consultation_expectation', 'name', 'phone', 'birthDate'];
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data: RequestFormData) => {
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

      const formatNotes = () => {
        return `Interesse original: ${data.desired_procedures.join(', ')}\nIncômodos principais: ${data.main_concerns.join(', ')}`;
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
        procedure_interest: data.desired_procedures[0] || 'Avaliação Geral',
        message: null,
        clinical_data: clinicalData
      };

      const { error } = await supabase
        .from('contact_requests')
        .insert([payload]);

      if (error) throw error;

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      alert('Não foi possível enviar sua solicitação. Tente novamente mais tarde.');
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
          <div className="pt-8">
            <Link to="/">
              <Button className="px-8 h-12 bg-clinic-textPrimary hover:bg-clinic-goldDark text-white rounded-none uppercase tracking-widest text-xs">
                Voltar para o site
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 md:pt-36 pb-36 md:pb-40 px-6 bg-[#FCFBF9]">
      <div className="max-w-[620px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-clinic-gold font-bold mb-4 block">Pré-Consulta</span>
          <h2 className="text-3xl md:text-4xl font-serif text-clinic-dark mb-4">Ferrer Innovare Clinic</h2>
          <p className="text-clinic-textSecondary font-light text-sm max-w-sm mx-auto leading-relaxed">
            Leva menos de 2 minutos. Suas respostas nos ajudam a entender suas necessidades e preparar sua avaliação.
          </p>
        </div>

        {/* Editorial Progress Bar */}
        <div className="mb-16 border-b border-clinic-border/60 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl text-clinic-gold">{currentStep.toString().padStart(2, '0')}</span>
            <span className="text-[10px] tracking-[0.2em] text-clinic-textSecondary uppercase font-semibold">
              {steps[currentStep-1].title}
            </span>
          </div>
          <div className="w-full sm:w-32 h-[1px] bg-clinic-border/40 relative overflow-hidden mt-2 sm:mt-0">
            <div 
              className="absolute left-0 top-0 h-full bg-clinic-gold transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            
            {/* ETAPA 1 */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <h3 className="text-lg md:text-xl font-serif text-clinic-textPrimary leading-tight">Qual procedimento ou resultado você está buscando?</h3>
                  <Controller
                    control={control}
                    name="desired_procedures"
                    render={({ field }) => (
                      <CheckboxGroup 
                        options={[
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
                        value={field.value}
                        onChange={(val) => {
                          if (val.includes('Ainda não sei, quero orientação')) {
                            field.onChange(['Ainda não sei, quero orientação']);
                          } else {
                            field.onChange(val.filter(v => v !== 'Ainda não sei, quero orientação'));
                          }
                        }}
                      />
                    )}
                  />
                  {errors.desired_procedures && <p className="text-red-500 text-xs mt-1">{errors.desired_procedures.message}</p>}
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg md:text-xl font-serif text-clinic-textPrimary leading-tight">O que mais incomoda você atualmente?</h3>
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
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val);
                        }}
                      />
                    )}
                  />
                  {errors.main_concerns && <p className="text-red-500 text-xs mt-1">{errors.main_concerns.message}</p>}
                  
                  {watchAll.main_concerns.includes('Outro') && (
                    <div className="mt-4">
                      <Input 
                        placeholder="Conte um pouco mais..."
                        {...register('main_concerns_other')}
                        className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors placeholder:text-clinic-textSecondary/40 font-light text-sm"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ETAPA 2 */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <h3 className="text-lg md:text-xl font-serif text-clinic-textPrimary leading-tight">Você já realizou algum procedimento estético?</h3>
                  <Controller
                    control={control}
                    name="previous_procedures"
                    render={({ field }) => (
                      <CheckboxGroup 
                        type="radio"
                        options={[
                          'Nunca',
                          'Sim, recentemente',
                          'Sim, há algum tempo'
                        ]}
                        value={field.value ? [field.value] : []}
                        onChange={(val) => field.onChange(val[val.length - 1] || '')}
                      />
                    )}
                  />
                  {errors.previous_procedures && <p className="text-red-500 text-xs mt-1">{errors.previous_procedures.message}</p>}
                  
                  {(watchAll.previous_procedures === 'Sim, recentemente' || watchAll.previous_procedures === 'Sim, há algum tempo') && (
                    <div className="mt-4">
                      <Input 
                        placeholder="Qual procedimento?"
                        {...register('previous_procedures_details')}
                        className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors placeholder:text-clinic-textSecondary/40 font-light text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg md:text-xl font-serif text-clinic-textPrimary leading-tight">Você possui algum preenchimento ou outro produto aplicado na região que deseja tratar?</h3>
                  <Controller
                    control={control}
                    name="existing_fillers"
                    render={({ field }) => (
                      <CheckboxGroup 
                        type="radio"
                        options={[
                          'Não',
                          'Sim',
                          'Não sei informar'
                        ]}
                        value={field.value ? [field.value] : []}
                        onChange={(val) => field.onChange(val[val.length - 1] || '')}
                      />
                    )}
                  />
                  {errors.existing_fillers && <p className="text-red-500 text-xs mt-1">{errors.existing_fillers.message}</p>}
                </div>
              </motion.div>
            )}

            {/* ETAPA 3 */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-lg md:text-xl font-serif text-clinic-textPrimary leading-tight">Você possui alguma destas condições?</h3>
                    <Controller
                      control={control}
                      name="health_conditions"
                      render={({ field }) => (
                        <CheckboxGroup 
                          options={[
                            'Diabetes',
                            'Pressão alta/hipertensão',
                            'Doença autoimune',
                            'Problema de coagulação',
                            'Alergia importante',
                            'Nenhuma das anteriores',
                            'Outra'
                          ]}
                          value={field.value}
                          onChange={(val) => {
                            if (val.includes('Nenhuma das anteriores')) {
                              field.onChange(['Nenhuma das anteriores']);
                            } else {
                              field.onChange(val.filter(v => v !== 'Nenhuma das anteriores'));
                            }
                          }}
                        />
                      )}
                    />
                    {errors.health_conditions && <p className="text-red-500 text-xs mt-1">{errors.health_conditions.message}</p>}
                    
                    {watchAll.health_conditions.includes('Outra') && (
                      <div className="mt-4">
                        <Input 
                          placeholder="Qual condição?"
                          {...register('health_condition_other')}
                          className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors placeholder:text-clinic-textSecondary/40 font-light text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <p className="text-sm font-semibold text-clinic-textPrimary uppercase tracking-wider">Faz uso de medicamentos de uso contínuo?</p>
                    <Controller
                      control={control}
                      name="continuous_medication"
                      render={({ field }) => (
                        <CheckboxGroup 
                          type="radio"
                          options={['Não', 'Sim']}
                          value={field.value ? [field.value] : []}
                          onChange={(val) => field.onChange(val[val.length - 1] || '')}
                        />
                      )}
                    />
                    {errors.continuous_medication && <p className="text-red-500 text-xs mt-1">{errors.continuous_medication.message}</p>}
                    {watchAll.continuous_medication === 'Sim' && (
                      <div className="mt-4">
                        <Input 
                          placeholder="Quais medicamentos?"
                          {...register('continuous_medication_details')}
                          className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors placeholder:text-clinic-textSecondary/40 font-light text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <p className="text-sm font-semibold text-clinic-textPrimary uppercase tracking-wider">Está grávida ou amamentando?</p>
                    <Controller
                      control={control}
                      name="pregnancy_breastfeeding"
                      render={({ field }) => (
                        <CheckboxGroup 
                          type="radio"
                          options={['Não', 'Sim']}
                          value={field.value ? [field.value] : []}
                          onChange={(val) => field.onChange(val[val.length - 1] || '')}
                        />
                      )}
                    />
                    {errors.pregnancy_breastfeeding && <p className="text-red-500 text-xs mt-1">{errors.pregnancy_breastfeeding.message}</p>}
                  </div>

                  <div className="space-y-6">
                    <p className="text-sm font-semibold text-clinic-textPrimary uppercase tracking-wider">Possui alguma alergia conhecida?</p>
                    <Controller
                      control={control}
                      name="allergies"
                      render={({ field }) => (
                        <CheckboxGroup 
                          type="radio"
                          options={['Não', 'Sim']}
                          value={field.value ? [field.value] : []}
                          onChange={(val) => field.onChange(val[val.length - 1] || '')}
                        />
                      )}
                    />
                    {errors.allergies && <p className="text-red-500 text-xs mt-1">{errors.allergies.message}</p>}
                    {watchAll.allergies === 'Sim' && (
                      <div className="mt-4">
                        <Input 
                          placeholder="Qual?"
                          {...register('allergies_details')}
                          className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-2.5 focus:ring-0 focus:border-clinic-gold transition-colors placeholder:text-clinic-textSecondary/40 font-light text-sm"
                        />
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* ETAPA 4 */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                <div className="space-y-6">
                  <h3 className="text-lg md:text-xl font-serif text-clinic-textPrimary leading-tight">Como você gostaria que fosse o resultado?</h3>
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
                        onChange={(val) => field.onChange(val[val.length - 1] || '')}
                      />
                    )}
                  />
                  {errors.desired_result && <p className="text-red-500 text-xs mt-1">{errors.desired_result.message}</p>}
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg md:text-xl font-serif text-clinic-textPrimary leading-tight">O que você espera da sua avaliação?</h3>
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
                        onChange={(val) => field.onChange(val[val.length - 1] || '')}
                      />
                    )}
                  />
                  {errors.consultation_expectation && <p className="text-red-500 text-xs mt-1">{errors.consultation_expectation.message}</p>}
                </div>

                <div className="pt-12 border-t border-clinic-border/60 space-y-6">
                  <div>
                    <h3 className="text-xl font-serif text-clinic-textPrimary mb-1">Só falta uma coisa</h3>
                    <p className="text-clinic-textSecondary text-xs tracking-wider uppercase font-light">Seus dados para contato</p>
                  </div>
                  
                  <div className="space-y-5">
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
                </div>

                <div className="bg-clinic-surface/30 p-6 border-l border-clinic-gold text-xs text-clinic-textSecondary leading-relaxed italic font-light mb-6">
                  <strong>IMPORTANTE:</strong> Esta pré-consulta tem como objetivo conhecer melhor suas necessidades e realizar uma triagem inicial. As respostas não substituem a avaliação presencial. A indicação e realização de qualquer procedimento dependerão de avaliação individual, histórico clínico e critérios de segurança.
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <div className="mt-16 flex items-center justify-between pt-6 border-t border-clinic-border/60">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="text-[10px] uppercase tracking-[0.2em] text-clinic-textSecondary hover:text-clinic-textPrimary transition-colors duration-300 font-semibold"
              >
                ← Voltar
              </button>
            ) : (
              <div />
            )}
            
            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="px-10 h-12 bg-clinic-textPrimary hover:bg-clinic-goldDark text-white rounded-none uppercase tracking-widest text-[11px] transition-all duration-300"
              >
                Continuar
              </Button>
            ) : (
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="px-10 h-12 bg-clinic-gold hover:bg-clinic-goldDark text-white rounded-none uppercase tracking-widest text-[11px] transition-all duration-300"
              >
                Enviar pré-consulta
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
