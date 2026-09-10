import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError('Credenciais inválidas');
      setIsLoading(false);
    } else {
      navigate('/painel');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-clinic-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-clinic-gold"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/painel" replace />;
  }

  return (
    <div className="min-h-screen bg-clinic-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-16 w-auto"
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Ferrer Innovare Clinic"
        />
        <h2 className="mt-6 text-center text-3xl font-serif text-clinic-textPrimary">
          Acesso Restrito
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-4 py-8 sm:px-10">
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-clinic-danger/10 text-clinic-danger p-3 rounded-md text-sm text-center">
                  {error}
                </div>
              )}
              
              <Input
                label="E-mail"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
              
              <Input
                label="Senha"
                type="password"
                {...register('password')}
                error={errors.password?.message}
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
