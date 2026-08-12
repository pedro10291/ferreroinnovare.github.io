import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../../services/supabase';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Link } from 'react-router-dom';

const contactSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  phone: z.string().min(10, 'Telefone é obrigatório'),
  interest: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const BookingSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Save to Supabase
      const { error } = await supabase.from('contacts').insert([{
        name: data.name,
        phone: data.phone,
        interest: data.interest,
        message: 'Contato via formulário minimalista',
      }]);
      if (error) throw error;
      
      // 2. Format WhatsApp Message
      const phone = "5511999999999"; // TODO: This should ideally come from CMS
      const text = `Olá! Meu nome é ${data.name}. Gostaria de agendar uma avaliação.${data.interest ? ` Tenho interesse em: ${data.interest}.` : ''}`;
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      
      // 3. Reset and Redirect
      reset();
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Ocorreu um erro. Por favor, tente novamente ou entre em contato diretamente pelo WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contato" className="bg-clinic-surface border-t border-clinic-border flex flex-col justify-between min-h-[90vh]">
      <div className="flex-grow flex items-center py-24 md:py-32">
        <div className="max-w-[800px] mx-auto px-6 sm:px-8 w-full">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-[1px] bg-clinic-gold"></div>
              <span className="uppercase tracking-widest text-xs font-semibold text-clinic-goldDark">Agendamento</span>
              <div className="w-12 h-[1px] bg-clinic-gold"></div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-serif text-clinic-textPrimary mb-6">
              Dê o primeiro <span className="italic text-clinic-goldDark">passo.</span>
            </h2>
            <p className="text-lg text-clinic-textSecondary font-light">
              Preencha seus dados para continuar o agendamento através do nosso atendimento exclusivo no WhatsApp.
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
              <Input 
                placeholder="Seu nome completo"
                {...register('name')}
                error={errors.name?.message}
                className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-3 focus:ring-0 focus:border-clinic-gold transition-colors duration-300 placeholder:text-clinic-textSecondary/50 font-light"
              />
              <Input 
                placeholder="Seu WhatsApp (com DDD)"
                {...register('phone')}
                error={errors.phone?.message}
                className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-3 focus:ring-0 focus:border-clinic-gold transition-colors duration-300 placeholder:text-clinic-textSecondary/50 font-light"
              />
              <Input 
                placeholder="Procedimento de interesse (Opcional)"
                {...register('interest')}
                className="bg-transparent border-t-0 border-l-0 border-r-0 border-b border-clinic-border rounded-none px-0 py-3 focus:ring-0 focus:border-clinic-gold transition-colors duration-300 placeholder:text-clinic-textSecondary/50 font-light"
              />
              
              <div className="pt-10 text-center">
                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  className="w-full h-14 md:h-16 px-10 md:px-12 bg-clinic-textPrimary hover:bg-clinic-goldDark hover:shadow-lg text-white text-[12px] md:text-sm uppercase tracking-[0.2em] font-semibold transition-all duration-300 rounded-none"
                >
                  Continuar pelo WhatsApp
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </section>
  );
};
