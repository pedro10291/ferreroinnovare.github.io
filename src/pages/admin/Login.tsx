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

const forgotSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

const resetSchema = z.object({
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'A confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotFormData = z.infer<typeof forgotSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');
  const [isRecovery, setIsRecovery] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      return hash.includes('type=recovery') || search.includes('type=recovery');
    }
    return false;
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const forgotForm = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onLoginSubmit = async (data: LoginFormData) => {
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

  const onForgotSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    setError('');
    
    const baseUrl = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    const redirectTo = `${window.location.origin}${baseUrl}painel/login`;

    try {
      await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo,
      });
    } catch (err) {
      console.error('Erro na redefinição de senha:', err);
    } finally {
      setIsLoading(false);
      setForgotSuccess(true);
    }
  };

  const onResetSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setError('Não foi possível atualizar a senha. O link pode ter expirado.');
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setResetSuccess(true);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-clinic-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-clinic-gold"></div>
      </div>
    );
  }

  if (user && !isRecovery) {
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
          {isRecovery
            ? 'Redefinir Senha'
            : viewMode === 'forgot'
            ? 'Recuperar Senha'
            : 'Acesso Restrito'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-4 py-8 sm:px-10">
          <CardContent>
            {/* MODO REDEFINIR SENHA (Link recebido por e-mail) */}
            {isRecovery ? (
              resetSuccess ? (
                <div className="space-y-6 text-center">
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-md text-sm border border-emerald-200">
                    Sua senha foi atualizada com sucesso!
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => {
                      setIsRecovery(false);
                      navigate('/painel');
                    }}
                  >
                    Acessar o Painel
                  </Button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={resetForm.handleSubmit(onResetSubmit)}>
                  <p className="text-xs text-clinic-textSecondary text-center leading-relaxed">
                    Digite sua nova senha de acesso abaixo.
                  </p>

                  {error && (
                    <div className="bg-clinic-danger/10 text-clinic-danger p-3 rounded-md text-sm text-center">
                      {error}
                    </div>
                  )}

                  <Input
                    label="Nova Senha"
                    type="password"
                    {...resetForm.register('password')}
                    error={resetForm.formState.errors.password?.message}
                  />

                  <Input
                    label="Confirmar Nova Senha"
                    type="password"
                    {...resetForm.register('confirmPassword')}
                    error={resetForm.formState.errors.confirmPassword?.message}
                  />

                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    Salvar Nova Senha
                  </Button>
                </form>
              )
            ) : viewMode === 'forgot' ? (
              /* MODO ESQUECI MINHA SENHA (Solicitar e-mail) */
              forgotSuccess ? (
                <div className="space-y-6 text-center">
                  <div className="bg-clinic-bg text-clinic-textPrimary p-4 rounded-md text-sm border border-clinic-border leading-relaxed">
                    Se o e-mail estiver cadastrado em nosso sistema, você receberá uma mensagem com as instruções para redefinição de senha.
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setViewMode('login');
                      setForgotSuccess(false);
                    }}
                  >
                    Voltar ao Login
                  </Button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={forgotForm.handleSubmit(onForgotSubmit)}>
                  <p className="text-xs text-clinic-textSecondary text-center leading-relaxed">
                    Informe seu e-mail cadastrado para receber o link de recuperação.
                  </p>

                  {error && (
                    <div className="bg-clinic-danger/10 text-clinic-danger p-3 rounded-md text-sm text-center">
                      {error}
                    </div>
                  )}

                  <Input
                    label="E-mail"
                    type="email"
                    {...forgotForm.register('email')}
                    error={forgotForm.formState.errors.email?.message}
                  />

                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    Enviar Instruções
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('login');
                        setError('');
                      }}
                      className="text-xs text-clinic-textSecondary hover:text-clinic-gold transition-colors font-medium underline underline-offset-4"
                    >
                      Voltar ao Login
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* MODO LOGIN NORMAL */
              <form className="space-y-6" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                {error && (
                  <div className="bg-clinic-danger/10 text-clinic-danger p-3 rounded-md text-sm text-center">
                    {error}
                  </div>
                )}
                
                <Input
                  label="E-mail"
                  type="email"
                  {...loginForm.register('email')}
                  error={loginForm.formState.errors.email?.message}
                />
                
                <Input
                  label="Senha"
                  type="password"
                  {...loginForm.register('password')}
                  error={loginForm.formState.errors.password?.message}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot');
                      setError('');
                    }}
                    className="text-xs text-clinic-textSecondary hover:text-clinic-gold transition-colors font-medium underline underline-offset-4"
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Entrar
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;

