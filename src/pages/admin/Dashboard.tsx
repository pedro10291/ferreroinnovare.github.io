import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Card, CardContent } from '../../components/ui/Card';
import { Users, FileText, Activity } from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    patients: 0,
    anamnesis: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: patientsCount } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });
          
        const { count: anamnesisCount } = await supabase
          .from('anamnesis')
          .select('*', { count: 'exact', head: true });

        setStats({
          patients: patientsCount || 0,
          anamnesis: anamnesisCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif text-clinic-textPrimary">Visão Geral</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glass={false}>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-full bg-clinic-gold/10 text-clinic-gold mr-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-clinic-textSecondary font-medium">Total de Pacientes</p>
              <p className="text-2xl font-semibold text-clinic-textPrimary">
                {isLoading ? '...' : stats.patients}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card glass={false}>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-full bg-clinic-gold/10 text-clinic-gold mr-4">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-clinic-textSecondary font-medium">Anamneses</p>
              <p className="text-2xl font-semibold text-clinic-textPrimary">
                {isLoading ? '...' : stats.anamnesis}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card glass={false}>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-full bg-clinic-gold/10 text-clinic-gold mr-4">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-clinic-textSecondary font-medium">Leads (Contatos)</p>
              <p className="text-2xl font-semibold text-clinic-textPrimary">
                {/* Future implementation */}
                0
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-serif text-clinic-textPrimary mt-8 mb-4">Atividade Recente</h2>
      <Card glass={false}>
        <CardContent>
          <p className="text-clinic-textSecondary py-8 text-center">
            Nenhuma atividade recente para exibir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
