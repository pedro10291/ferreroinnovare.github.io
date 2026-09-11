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
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  // State for forgot password and new password reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Check if arriving via a password recovery link
    const hash = window.location.hash;
    const search = window.location.search;
    if (hash.includes('type=recovery') || search.includes('type=recovery')) {
      setIsRecoveryMode(true);
      setView('reset');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setView('reset');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const onSubmitLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToReset = forgotEmail.trim();
    if (!emailToReset || !emailToReset.includes('@')) {
      setError('Informe um e-mail válido');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await supabase.auth.resetPasswordForEmail(emailToReset, {
        redirectTo: `${window.location.origin}/painel/login`,
      });
      setSuccessMessage(
        'Se o e-mail estiver cadastrado no sistema, você receberá as instruções para redefinição de senha.'
      );
    } catch {
      setSuccessMessage(
        'Se o e-mail estiver cadastrado no sistema, você receberá as instruções para redefinição de senha.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message || 'Não foi possível redefinir a senha. Tente novamente.');
      setIsLoading(false);
    } else {
      setSuccessMessage('Senha alterada com sucesso! Redirecionando para o painel...');
      setIsLoading(false);
      setTimeout(() => {
        setIsRecoveryMode(false);
        if (window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        navigate('/painel');
      }, 1500);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-clinic-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-clinic-gold"></div>
      </div>
    );
  }

  if (user && !isRecoveryMode) {
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
          {view === 'reset' ? 'Nova Senha' : 'Acesso Restrito'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-4 py-8 sm:px-10">
          <CardContent>
            {error && (
              <div className="bg-clinic-danger/10 text-clinic-danger p-3 rounded-md text-sm text-center mb-6">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-sm text-center mb-6">
                {successMessage}
              </div>
            )}

            {view === 'login' && (
              <form className="space-y-6" onSubmit={handleSubmit(onSubmitLogin)}>
                <Input
                  label="E-mail"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                />
                
                <div>
                  <Input
                    label="Senha"
                    type="password"
                    {...register('password')}
                    error={errors.password?.message}
                  />
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setSuccessMessage('');
                        setForgotEmail(getValues('email') || '');
                        setView('forgot');
                      }}
                      className="text-xs text-clinic-textSecondary hover:text-clinic-gold transition-colors focus:outline-none"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Entrar
                </Button>
              </form>
            )}

            {view === 'forgot' && (
              <form className="space-y-6" onSubmit={handleForgotSubmit}>
                <p className="text-sm text-clinic-textSecondary text-center mb-2">
                  Digite seu e-mail para receber o link de redefinição de senha.
                </p>

                <Input
                  label="E-mail registrado"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                  required
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Enviar e-mail de recuperação
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccessMessage('');
                      setView('login');
                    }}
                    className="text-xs text-clinic-textSecondary hover:text-clinic-gold transition-colors focus:outline-none"
                  >
                    Voltar ao login
                  </button>
                </div>
              </form>
            )}

            {view === 'reset' && (
              <form className="space-y-6" onSubmit={handleResetPasswordSubmit}>
                <p className="text-sm text-clinic-textSecondary text-center mb-2">
                  Digite a sua nova senha de acesso.
                </p>

                <Input
                  label="Nova Senha"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <Input
                  label="Confirmar Nova Senha"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Salvar nova senha
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
