import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps = {}) => {
  const { user, profile, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-clinic-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-clinic-gold"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Se tem usuário mas não tem profile, ou o profile está inativo, ou a role não é admin/staff
  if (!profile || !profile.active || profile.role === 'user' || (allowedRoles && !allowedRoles.includes(profile.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-clinic-bg px-4">
        <div className="max-w-md w-full bg-clinic-surface p-8 rounded-xl shadow-lg border border-clinic-border text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-clinic-textPrimary mb-2">Acesso Negado</h2>
          <p className="text-clinic-textSecondary mb-6">
            {!profile ? 'Não foi possível carregar seu perfil.' :
             !profile.active ? 'Sua conta está desativada.' :
             'Você não tem permissão para acessar o painel administrativo.'}
          </p>
          <button
            onClick={signOut}
            className="flex w-full justify-center items-center px-4 py-2 bg-clinic-gold text-white rounded-md hover:bg-clinic-goldDark transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair e Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
