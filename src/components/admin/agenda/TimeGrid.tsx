import React, { useMemo } from 'react';
import { AppointmentWithRelations } from '../../../types/appointment';
import { AppointmentCard } from './AppointmentCard';
import { Plus } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface TimeGridProps {
  date: Date;
  appointments: AppointmentWithRelations[];
  onSlotClick: (time: string) => void;
  onAppointmentClick: (appointment: AppointmentWithRelations) => void;
}

const START_HOUR = 8; // 08:00
const END_HOUR = 18;  // 18:00
const SLOT_MINUTES = 30;

export const TimeGrid: React.FC<TimeGridProps> = ({ date, appointments, onSlotClick, onAppointmentClick }) => {
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += SLOT_MINUTES) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
      }
    }
    return slots;
  }, []);

  // Map to hold which appointment covers which slot
  const slotMap = useMemo(() => {
    const map = new Map<string, AppointmentWithRelations | 'SKIP'>();
    
    // Sort appointments chronologically to be safe
    const sortedApps = [...appointments].sort((a, b) => 
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );

    sortedApps.forEach(app => {
      // Ignorar agendamentos cancelados ou no_show na grade principal se eles
      // devem liberar espaço? A regra diz que agendamentos inativos podem ficar opacos,
      // mas e se houver reagendamento ou cancelamento, a constraint no banco já permite sobreposição.
      // Vamos renderizar normalmente. O usuário diz: "A prioridade é a disponibilidade".
      // Se está CANCELADO, o banco liberou o horário. Para não confundir, vamos exibir, mas
      // o layout pode bugar se sobrepor com um SCHEDULED.
      // O Supabase tem EXCLUDE constraint onde (status = 'SCHEDULED').
      // Então CANCELLED pode se sobrepor a SCHEDULED. 
      // Para o TimeGrid simples, vamos mostrar apenas os ativos (SCHEDULED, COMPLETED)
      // para determinar a ocupação de blocos. Os CANCELLED poderíamos não mostrar na grade de disponibilidade.
      if (['CANCELLED', 'NO_SHOW', 'RESCHEDULED'].includes(app.status)) {
        return; 
      }

      const scheduledAt = new Date(app.scheduled_at);
      const startH = scheduledAt.getHours().toString().padStart(2, '0');
      const startM = scheduledAt.getMinutes().toString().padStart(2, '0');
      const startTimeStr = `${startH}:${startM}`;

      const duration = app.duration_minutes;
      const slotsCount = Math.ceil(duration / SLOT_MINUTES);

      // Encontra o index do slot inicial
      const startIndex = timeSlots.indexOf(startTimeStr);
      if (startIndex !== -1) {
        map.set(startTimeStr, app);
        // Marca os próximos slots cobertos por este atendimento como SKIP
        for (let i = 1; i < slotsCount; i++) {
          if (startIndex + i < timeSlots.length) {
            map.set(timeSlots[startIndex + i], 'SKIP');
          }
        }
      }
    });

    return map;
  }, [appointments, timeSlots]);

  return (
    <div className="flex flex-col gap-3 relative">
      {/* Visual Timeline line indicator (optional, elegant touch) */}
      <div className="absolute left-[39px] top-0 bottom-0 w-px bg-gray-100 hidden sm:block z-0" />

      {timeSlots.map((timeStr) => {
        const slotData = slotMap.get(timeStr);

        // Se esse bloco está sendo coberto por um Appointment anterior, não renderiza nada (pula)
        if (slotData === 'SKIP') return null;

        // Bloco OCUPADO (início de um agendamento)
        if (slotData && typeof slotData === 'object') {
          const app = slotData as AppointmentWithRelations;
          const slotsCount = Math.ceil(app.duration_minutes / SLOT_MINUTES);
          
          return (
            <div key={timeStr} className="flex flex-col sm:flex-row gap-4 relative z-10 group">
              <div className="sm:w-20 shrink-0 py-2 hidden sm:block">
                <span className="text-sm font-medium text-gray-500">{timeStr}</span>
              </div>
              <div className="flex-1">
                <AppointmentCard 
                  appointment={app} 
                  onClick={onAppointmentClick} 
                  spanBlocks={slotsCount} 
                />
              </div>
            </div>
          );
        }

        // Bloco LIVRE (DISPONÍVEL)
        return (
          <div key={timeStr} className="flex flex-col sm:flex-row gap-4 relative z-10 group">
            <div className="sm:w-20 shrink-0 py-3 hidden sm:block">
              <span className="text-sm font-medium text-gray-400">{timeStr}</span>
            </div>
            
            {/* Bloco de Ação - Disponível */}
            <div 
              onClick={() => onSlotClick(timeStr)}
              className="flex-1 min-h-[80px] sm:min-h-[96px] border-2 border-dashed border-gray-200 bg-white/50 rounded-xl flex items-center px-4 cursor-pointer transition-all duration-200 hover:border-clinic-gold hover:bg-clinic-gold/5 group-hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="text-sm sm:hidden font-medium text-gray-500 mb-1">{timeStr}</span>
                  <span className="text-sm font-semibold tracking-wide text-gray-400 group-hover:text-clinic-gold transition-colors">
                    DISPONÍVEL
                  </span>
                </div>
                
                <div className="mt-2 sm:mt-0 flex items-center text-sm font-medium text-clinic-gold opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity translate-x-0 sm:-translate-x-4 sm:group-hover:translate-x-0 transform duration-300">
                  <Plus className="w-4 h-4 mr-1" />
                  Encaixar paciente
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
