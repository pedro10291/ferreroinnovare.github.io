import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { supabase } from '../../services/supabase';
import { Link } from 'react-router-dom';

const requestSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().min(10, 'Telefone inválido'),
  procedure_interest: z.string().min(1, 'Selecione um procedimento'),
  birthDate: z.string().optional(),
  medicalHistory: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  surgeries: z.string().optional(),
  habits: z.string().optional(),
  notes: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

const steps = [
  { id: 1, title: 'Contato e Interesse' },
  { id: 2, title: 'Histórico Médico' },
  { id: 3, title: 'Hábitos e Alergias' },
  { id: 4, title: 'Finalização' },
];

export const AnamnesisForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [procedures, setProcedures] = useState<{id: string, title: string}[]>([]);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      procedure_interest: ''
    }
  });

  useEffect(() => {
    const fetchProcedures = async () => {
      const { data, error } = await supabase
        .from('procedures')
        .select('id, title')
        .eq('active', true)
        .order('display_order');
        
      if (!error && data) {
        setProcedures(data);
      }
    };
    
    fetchProcedures();
  }, []);

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ['name', 'email', 'phone', 'procedure_interest', 'birthDate'];
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    try {
      const normalizedPhone = data.phone.replace(/\D/g, '');
      
      const clinicalData = {
        birthDate: data.birthDate || null,
        medicalHistory: data.medicalHistory ? [data.medicalHistory] : null,
        surgeries: data.surgeries || null,
        medications: data.medications || null,
        allergies: data.allergies || null,
        habits: data.habits ? [data.habits] : null,
      };

      const payload = {
        full_name: data.name,
        email: data.email || null,
        phone: normalizedPhone,
        procedure_interest: data.procedure_interest,
        message: data.notes || null,
        clinical_data: clinicalData
      };

      const { error } = await supabase
        .from('contact_requests')
        .insert([payload]);

      if (error) {
        throw error;
      }

      setCurrentStep(5); // Success step
    } catch (error) {
      console.error(error);
      alert('Não foi possível enviar sua solicitação. Verifique os dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStep === 5) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4 bg-clinic-bg flex flex-col items-center">
        <Card className="max-w-xl w-full text-center">
          <CardContent className="pt-10 pb-10 space-y-6">
            <div className="w-20 h-20 bg-clinic-goldLight/20 text-clinic-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-serif text-clinic-textPrimary">Solicitação enviada</h2>
            <p className="text-clinic-textSecondary">
              Recebemos seus dados e nossa equipe entrará em contato em breve para confirmar os próximos passos.
            </p>
            <div className="pt-6">
              <Link to="/">
                <Button variant="secondary">Voltar ao Início</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 bg-clinic-bg">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif text-clinic-textPrimary">Solicitação de Atendimento</h2>
          <p className="text-clinic-textSecondary mt-2">Preencha seus dados para recebermos seu contato.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-clinic-border -z-10 -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-clinic-gold -z-10 -translate-y-1/2 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step.id <= currentStep 
                    ? 'bg-clinic-gold text-white shadow-[0_0_10px_rgba(201,139,132,0.4)]' 
                    : 'bg-clinic-surface text-clinic-textSecondary border border-clinic-border'
                }`}
              >
                {step.id}
              </div>
            ))}
          </div>
          <div className="text-center mt-4 font-medium text-clinic-gold">
            {steps[currentStep - 1]?.title}
          </div>
        </div>

        <Card>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <Input 
                      label="Nome Completo *" 
                      placeholder="Seu nome"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        label="Telefone / WhatsApp *" 
                        placeholder="(00) 00000-0000"
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                      <Input 
                        label="E-mail (opcional)" 
                        type="email"
                        placeholder="seu@email.com"
                        error={errors.email?.message}
                        {...register('email')}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-clinic-textPrimary">
                        Procedimento de Interesse *
                      </label>
                      <select
                        className={`w-full px-4 py-2 bg-clinic-surface border rounded-md focus:outline-none focus:ring-2 focus:ring-clinic-gold/50 focus:border-clinic-gold transition-colors ${errors.procedure_interest ? 'border-red-500' : 'border-clinic-border'}`}
                        {...register('procedure_interest')}
                      >
                        <option value="" disabled>Selecione um procedimento</option>
                        {procedures.map(p => (
                          <option key={p.id} value={p.title}>{p.title}</option>
                        ))}
                      </select>
                      {errors.procedure_interest && (
                        <p className="text-sm text-red-500">{errors.procedure_interest.message}</p>
                      )}
                    </div>
                    <Input 
                      label="Data de Nascimento (opcional)" 
                      type="date"
                      error={errors.birthDate?.message}
                      {...register('birthDate')}
                    />
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <Textarea 
                      label="Histórico Médico" 
                      placeholder="Possui alguma doença crônica? Descreva aqui."
                      {...register('medicalHistory')}
                    />
                    <Textarea 
                      label="Cirurgias Anteriores" 
                      placeholder="Já realizou alguma cirurgia? Qual e quando?"
                      {...register('surgeries')}
                    />
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <Textarea 
                      label="Uso de Medicamentos" 
                      placeholder="Faz uso contínuo de algum medicamento? Quais?"
                      {...register('medications')}
                    />
                    <Textarea 
                      label="Alergias" 
                      placeholder="Possui alergia a algum medicamento, cosmético ou alimento?"
                      {...register('allergies')}
                    />
                    <Textarea 
                      label="Hábitos (Fumo, Bebida, etc)" 
                      placeholder="Fumante? Consome bebidas alcoólicas?"
                      {...register('habits')}
                    />
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <Textarea 
                      label="Mensagem / Observações Adicionais" 
                      placeholder="Algo mais que gostaria de nos informar?"
                      {...register('notes')}
                    />
                    
                    <div className="p-4 bg-clinic-surfaceHover rounded-lg border border-clinic-border text-sm text-clinic-textSecondary mt-6">
                      Declaro que as informações prestadas são verdadeiras e estou ciente que serão tratadas sob sigilo profissional, conforme LGPD.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-6 border-t border-clinic-border">
                {currentStep > 1 ? (
                  <Button type="button" variant="ghost" onClick={prevStep}>
                    Voltar
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {currentStep < steps.length ? (
                  <Button type="button" onClick={nextStep}>
                    Próximo Passo
                  </Button>
                ) : (
                  <Button type="submit" isLoading={isSubmitting}>
                    Finalizar e Enviar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnamnesisForm;
