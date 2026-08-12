import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import { Users, FileText, Calendar, Inbox } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    anamnesis: 0,
    pendingRequests: 0,
    appointmentsToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const [patientsRes, anamnesisRes, requestsRes, appointmentsRes] = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase.from('anamnesis').select('*', { count: 'exact', head: true }),
          supabase.from('contact_requests').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
          supabase.from('appointments').select('*', { count: 'exact', head: true })
            .gte('scheduled_at', todayStart.toISOString())
            .lte('scheduled_at', todayEnd.toISOString())
            .eq('status', 'SCHEDULED')
        ]);

        setStats({
          patients: patientsRes.count || 0,
          anamnesis: anamnesisRes.count || 0,
          pendingRequests: requestsRes.count || 0,
          appointmentsToday: appointmentsRes.count || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, loading = false, highlight = false }: any) => (
    <Card glass={false} className={`h-full transition-all duration-300 hover:shadow-md ${highlight ? 'border-clinic-gold bg-clinic-gold/5' : ''}`}>
      <CardContent className="flex items-center p-5 h-full">
        <div className={`shrink-0 p-3.5 rounded-full mr-4 transition-colors ${highlight ? 'bg-clinic-gold text-white shadow-sm' : 'bg-gray-50 text-gray-400'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 leading-tight line-clamp-2 min-h-[2.5rem] flex items-center" title={title}>{title}</p>
          <p className="text-3xl font-serif text-clinic-dark mt-1 leading-none">
            {loading ? '...' : value}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-clinic-dark">Visão Geral</h1>
          <p className="text-gray-500 mt-1">Bem-vindo(a) de volta, {profile?.full_name?.split(' ')[0] || 'Equipe'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Solicitações Pendentes" 
          value={stats.pendingRequests} 
          icon={Inbox} 
          loading={isLoading}
          highlight={stats.pendingRequests > 0}
        />
        <StatCard 
          title="Agendamentos Hoje" 
          value={stats.appointmentsToday} 
          icon={Calendar} 
          loading={isLoading}
          highlight={stats.appointmentsToday > 0}
        />
        <StatCard 
          title="Total de Pacientes" 
          value={stats.patients} 
          icon={Users} 
          loading={isLoading} 
        />
        <StatCard 
          title="Anamneses Preenchidas" 
          value={stats.anamnesis} 
          icon={FileText} 
          loading={isLoading} 
        />
      </div>

      {!isLoading && stats.pendingRequests === 0 && stats.appointmentsToday === 0 && (
        <div className="mt-8 bg-gray-50 border border-gray-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="text-xl font-serif text-clinic-dark mb-2">Tudo em dia!</h3>
          <p className="text-gray-500">Não há solicitações pendentes nem agendamentos para o dia de hoje.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
