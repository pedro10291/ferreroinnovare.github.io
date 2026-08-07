import React, { useState } from 'react';
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

const anamnesisSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  medicalHistory: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  surgeries: z.string().optional(),
  habits: z.string().optional(),
  notes: z.string().optional(),
});

type AnamnesisFormData = z.infer<typeof anamnesisSchema>;

const steps = [
  { id: 1, title: 'Dados Pessoais' },
  { id: 2, title: 'Histórico Médico' },
  { id: 3, title: 'Hábitos e Alergias' },
  { id: 4, title: 'Finalização' },
];

export const AnamnesisForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<AnamnesisFormData>({
    resolver: zodResolver(anamnesisSchema),
  });

  const generateProtocol = () => {
    return 'FI' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 5).toUpperCase();
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ['name', 'email', 'phone', 'birthDate'];
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: AnamnesisFormData) => {
    setIsSubmitting(true);
    try {
      const generatedProtocol = generateProtocol();
      
      // Save patient data
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert([{
          name: data.name,
          email: data.email,
          phone: data.phone,
        }])
        .select()
        .single();

      if (patientError) throw patientError;

      // Save anamnesis
      const { error: anamnesisError } = await supabase
        .from('anamnesis')
        .insert([{
          patient_id: patient.id,
          personal_data: { birthDate: data.birthDate },
          medical_history: { details: data.medicalHistory },
          medications: data.medications,
          allergies: data.allergies,
          surgeries: data.surgeries,
          habits: { details: data.habits },
          notes: data.notes,
          protocol_number: generatedProtocol,
        }]);

      if (anamnesisError) throw anamnesisError;

      setProtocol(generatedProtocol);
      setCurrentStep(5); // Success step
    } catch (error) {
      console.error('Error saving anamnesis:', error);
      alert('Ocorreu um erro ao salvar o formulário. Tente novamente.');
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
            <h2 className="text-3xl font-serif text-clinic-textPrimary">Anamnese Concluída</h2>
            <p className="text-clinic-textSecondary">
              Seu formulário foi enviado com sucesso. Guarde o número do seu protocolo para o dia da sua avaliação.
            </p>
            <div className="bg-clinic-surface p-4 rounded-lg border border-clinic-border inline-block">
              <span className="text-sm text-clinic-textSecondary block mb-1">Número do Protocolo</span>
              <span className="text-2xl font-mono text-clinic-gold font-bold">{protocol}</span>
            </div>
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
          <h2 className="text-3xl md:text-4xl font-serif text-clinic-textPrimary">Ficha de Anamnese</h2>
          <p className="text-clinic-textSecondary mt-2">Preencha seus dados para um atendimento personalizado.</p>
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
                      label="Nome Completo" 
                      placeholder="Seu nome"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        label="E-mail" 
                        type="email"
                        placeholder="seu@email.com"
                        error={errors.email?.message}
                        {...register('email')}
                      />
                      <Input 
                        label="Telefone / WhatsApp" 
                        placeholder="(00) 00000-0000"
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                    </div>
                    <Input 
                      label="Data de Nascimento" 
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
                      label="Observações Adicionais" 
                      placeholder="Algo mais que gostaria de nos informar antes da avaliação?"
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
