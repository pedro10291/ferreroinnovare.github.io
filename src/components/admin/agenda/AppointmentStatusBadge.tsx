import React from 'react';
import { AppointmentStatus } from '../../../types/appointment';
import { cn } from '../../../utils/cn';
import { CheckCircle2, Clock, XCircle, UserX, CalendarClock } from 'lucide-react';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export const AppointmentStatusBadge: React.FC<AppointmentStatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'SCHEDULED':
        return {
          label: 'Agendado',
          className: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Clock,
        };
      case 'COMPLETED':
        return {
          label: 'Realizado',
          className: 'bg-green-50 text-green-700 border-green-200',
          icon: CheckCircle2,
        };
      case 'CANCELLED':
        return {
          label: 'Cancelado',
          className: 'bg-red-50 text-red-700 border-red-200',
          icon: XCircle,
        };
      case 'NO_SHOW':
        return {
          label: 'Não compareceu',
          className: 'bg-gray-100 text-gray-700 border-gray-300',
          icon: UserX,
        };
      case 'RESCHEDULED':
        return {
          label: 'Reagendado',
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          icon: CalendarClock,
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
      config.className,
      className
    )}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {config.label}
    </span>
  );
};
