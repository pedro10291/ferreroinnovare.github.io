import React, { useState, useEffect } from 'react';
import { Shield, User, Users } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface Profile {
  id: string;
  full_name: string | null;
  role: string;
  active: boolean;
  created_at: string;
}

export const Team = () => {
  const [team, setTeam] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTeam(data || []);
      } catch (err) {
        console.error('Erro ao buscar equipe:', err);
        setError('Não foi possível carregar a equipe.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-clinic-dark">Equipe Clínica</h1>
          <p className="text-gray-500 mt-1">Gerencie os profissionais e acessos do sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center flex-col gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-clinic-gold border-t-transparent"></div>
            <p className="text-sm text-gray-500">Carregando equipe...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : team.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum profissional encontrado.</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">Acesso</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {team.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-clinic-surface flex items-center justify-center text-clinic-gold border border-clinic-border shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="font-medium text-gray-900">{member.full_name || 'Usuário Sem Nome'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {member.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-purple-200">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-200">
                            Staff
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {member.active ? (
                        <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-medium border border-green-200">
                          Ativo
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md text-xs font-medium border border-red-200">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(member.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
