import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type RequestStatus = 'PENDING' | 'IN_CONTACT' | 'SCHEDULED' | 'CONVERTED' | 'CANCELLED';

interface RequestStatusBadgeProps {
  status: RequestStatus | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  PENDING: {
    label: 'Pendente',
    classes: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  },
  IN_CONTACT: {
    label: 'Em contato',
    classes: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  SCHEDULED: {
    label: 'Agendado',
    classes: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  CONVERTED: {
    label: 'Convertida',
    classes: 'bg-green-50 text-green-700 border-green-200'
  },
  CANCELLED: {
    label: 'Cancelada',
    classes: 'bg-red-50 text-red-700 border-red-200'
  }
};

export const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || {
    label: status,
    classes: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
          config.classes
        ),
        className
      )}
    >
      {config.label}
    </span>
  );
};
