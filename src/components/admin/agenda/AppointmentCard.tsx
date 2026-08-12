import React from 'react';
import { AppointmentWithRelations } from '../../../types/appointment';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { Clock, User } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  onClick: (appointment: AppointmentWithRelations) => void;
  spanBlocks?: number;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onClick, spanBlocks = 1 }) => {
  const scheduledAt = new Date(appointment.scheduled_at);
  const timeString = scheduledAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  // Calculate end time
  const endAt = new Date(scheduledAt.getTime() + appointment.duration_minutes * 60000);
  const endTimeString = endAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const isPast = endAt < new Date() && appointment.status === 'SCHEDULED';
  const isInactive = ['CANCELLED', 'NO_SHOW', 'RESCHEDULED'].includes(appointment.status);

  // Each block is roughly 96px (6rem) + 12px gap (0.75rem)
  const minHeightCSS = spanBlocks > 1 ? `calc(${spanBlocks * 96}px + ${(spanBlocks - 1) * 12}px)` : '96px';

  return (
    <div 
      onClick={() => onClick(appointment)}
      style={{ minHeight: minHeightCSS }}
      className={cn(
        "flex flex-col sm:flex-row gap-4 p-4 rounded-xl border bg-white cursor-pointer transition-all hover:shadow-md hover:border-clinic-gold/50 shadow-sm relative z-10",
        isInactive ? "opacity-60 bg-gray-50 border-gray-100" : "border-gray-200",
        isPast ? "border-red-100 bg-red-50/30" : ""
      )}
    >
      <div className="flex flex-col sm:w-32 shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 pb-3 sm:pb-0 sm:pr-4">
        <div className="flex items-center gap-2 text-clinic-dark font-medium text-lg">
          <Clock className="w-4 h-4 text-clinic-gold" />
          {timeString}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          até {endTimeString} ({appointment.duration_minutes} min)
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            {appointment.patient.full_name}
            {isPast && <span className="text-[10px] uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Atrasado</span>}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {appointment.procedure?.title || 'Avaliação Geral'}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <User className="w-3.5 h-3.5" />
            {appointment.professional.full_name}
          </div>
          
          <AppointmentStatusBadge status={appointment.status} />
        </div>
      </div>
    </div>
  );
};
