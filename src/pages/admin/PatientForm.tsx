import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { patientsService } from '../../services/patientsService';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

const patientSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().min(10, 'Telefone inválido').optional().or(z.literal('')),
  cpf: z.string().optional().or(z.literal('')),
  birth_date: z.string().optional().or(z.literal('')),
});

type PatientFormData = z.infer<typeof patientSchema>;

export const PatientForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      cpf: '',
      birth_date: '',
    }
  });

  const onSubmit = async (data: PatientFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Clean empty strings to null for better DB compatibility
      const payload = {
        full_name: data.full_name,
        email: data.email || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        birth_date: data.birth_date || null,
        active: true
      };

      const newPatient = await patientsService.createPatient(payload);
      
      // Redirect to the new patient's details page
      navigate(`/admin/pacientes/${newPatient.id}`);
    } catch (err: any) {
      console.error('Erro ao criar paciente:', err);
      setError('Ocorreu um erro ao criar o paciente. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Nav */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/pacientes')}
          className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-serif text-clinic-dark">Novo Paciente</h1>
      </div>

      <Card glass={false} className="border-t-4 border-t-clinic-gold overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Nome Completo *"
                  placeholder="Ex: Maria Silva"
                  {...register('full_name')}
                  error={errors.full_name?.message}
                />
              </div>

              <div>
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="exemplo@email.com"
                  {...register('email')}
                  error={errors.email?.message}
                />
              </div>

              <div>
                <Input
                  label="Telefone / WhatsApp"
                  placeholder="(11) 99999-9999"
                  {...register('phone')}
                  error={errors.phone?.message}
                />
              </div>

              <div>
                <Input
                  label="CPF"
                  placeholder="000.000.000-00"
                  {...register('cpf')}
                  error={errors.cpf?.message}
                />
              </div>

              <div>
                <Input
                  label="Data de Nascimento"
                  type="date"
                  {...register('birth_date')}
                  error={errors.birth_date?.message}
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-clinic-gold text-white font-medium rounded-lg hover:bg-clinic-goldDark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {isSubmitting ? 'Salvando...' : 'Salvar Paciente'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
