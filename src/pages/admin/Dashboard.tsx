import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import { Users, FileText, Calendar, Inbox, Activity, PieChart } from 'lucide-react';
import { contactRequestsService } from '../../services/contactRequestsService';
import { getOriginText } from './ContactRequests';
import { useAuth } from '../../contexts/AuthContext';

export const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    anamnesis: 0,
    pendingRequests: 0,
    appointmentsToday: 0
  });

  const [metrics, setMetrics] = useState({
    origins: [] as { name: string, total: number, converted: number }[],
    procedures: [] as { name: string, total: number }[],
    totalRequests: 0,
    totalConverted: 0
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

        const [patientsRes, anamnesisRes, requestsRes, appointmentsRes, allRequestsRes] = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase.from('anamnesis').select('*', { count: 'exact', head: true }),
          supabase.from('contact_requests').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
          supabase.from('appointments').select('*', { count: 'exact', head: true })
            .gte('scheduled_at', todayStart.toISOString())
            .lte('scheduled_at', todayEnd.toISOString())
            .eq('status', 'SCHEDULED'),
          contactRequestsService.fetchAllMetrics()
        ]);

        const allReqs = allRequestsRes || [];
        
        // Calculate Metrics
        let totalRequests = allReqs.length;
        let totalConverted = 0;
        
        const originMap: Record<string, { total: number, converted: number }> = {};
        const procMap: Record<string, number> = {};

        allReqs.forEach(req => {
          if (req.status === 'CONVERTED') totalConverted++;
          
          // Procedure
          const proc = req.procedure_interest && req.procedure_interest.trim() !== '' ? req.procedure_interest : 'Avaliação Geral';
          procMap[proc] = (procMap[proc] || 0) + 1;
          
          // Origin
          const origin = getOriginText(req);
          if (!originMap[origin]) originMap[origin] = { total: 0, converted: 0 };
          originMap[origin].total++;
          if (req.status === 'CONVERTED') originMap[origin].converted++;
        });

        const sortedOrigins = Object.entries(originMap)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.total - a.total);
          
        const sortedProcedures = Object.entries(procMap)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5); // top 5

        setMetrics({
          origins: sortedOrigins,
          procedures: sortedProcedures,
          totalRequests,
          totalConverted
        });

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card glass={false} className="border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-serif text-clinic-dark mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-clinic-gold" />
              Origem dos Leads
            </h3>
            
            <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total de Solicitações</p>
                <p className="text-2xl font-serif text-clinic-dark mt-1">{metrics.totalRequests}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Convertidas</p>
                <p className="text-2xl font-serif text-green-600 mt-1">{metrics.totalConverted}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Taxa de Conversão</p>
                <p className="text-2xl font-serif text-clinic-dark mt-1">
                  {metrics.totalRequests > 0 ? Math.round((metrics.totalConverted / metrics.totalRequests) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {metrics.origins.map(origin => (
                <div key={origin.name} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">{origin.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{origin.total}</span>
                      <span className="text-xs text-gray-500 ml-1">leads</span>
                    </div>
                    {origin.converted > 0 && (
                      <div className="text-right w-16">
                        <span className="font-semibold text-green-600">{origin.converted}</span>
                        <span className="text-xs text-green-600/70 ml-1">conv.</span>
                      </div>
                    )}
                    {origin.converted === 0 && (
                      <div className="text-right w-16 text-gray-400 text-xs">
                        -
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {metrics.origins.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum lead recebido ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card glass={false} className="border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-serif text-clinic-dark mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-clinic-gold" />
              Top Procedimentos
            </h3>
            <div className="space-y-3">
              {metrics.procedures.map((proc, idx) => (
                <div key={proc.name} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-clinic-gold/10 text-clinic-gold flex items-center justify-center text-xs font-bold mr-3">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900 flex-1 truncate pr-4">{proc.name}</span>
                  <span className="text-sm font-semibold text-gray-900">{proc.total} <span className="text-xs text-gray-500 font-normal">solicitações</span></span>
                </div>
              ))}
              {metrics.procedures.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Nenhuma solicitação ainda.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {!isLoading && stats.pendingRequests === 0 && stats.appointmentsToday === 0 && metrics.totalRequests === 0 && (

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
