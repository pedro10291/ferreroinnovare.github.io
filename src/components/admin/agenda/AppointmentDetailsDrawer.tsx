import React, { useState } from 'react';
import { X, Clock, User, Calendar, FileText, Phone, Mail, FileEdit } from 'lucide-react';
import { AppointmentWithRelations } from '../../../types/appointment';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { Button } from '../../ui/Button';

interface AppointmentDetailsDrawerProps {
  appointment: AppointmentWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onNoShow: () => void;
  onReschedule: () => void;
}

export const AppointmentDetailsDrawer: React.FC<AppointmentDetailsDrawerProps> = ({
  appointment,
  isOpen,
  onClose,
  onComplete,
  onCancel,
  onNoShow,
  onReschedule
}) => {
  if (!isOpen || !appointment) return null;

  const scheduledAt = new Date(appointment.scheduled_at);
  const dateStr = scheduledAt.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = scheduledAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[500px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-serif text-clinic-dark font-medium">Detalhes do Agendamento</h2>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Paciente */}
          <section className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-clinic-gold" />
              Paciente
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-lg font-medium text-gray-900">{appointment.patient.full_name}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {appointment.patient.phone}
                </span>
                {appointment.patient.email && (
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {appointment.patient.email}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Agendamento */}
          <section className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-clinic-gold" />
              Dados do Agendamento
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Data</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{dateStr}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Horário</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {timeStr} ({appointment.duration_minutes} min)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Procedimento</p>
                  <p className="text-sm font-medium text-gray-900">{appointment.procedure?.title || 'Avaliação'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Profissional</p>
                  <p className="text-sm font-medium text-gray-900">{appointment.professional.full_name}</p>
                </div>
              </div>

              {appointment.notes && (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Observações
                  </p>
                  <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 italic">
                    "{appointment.notes}"
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Informações de Conclusão / Cancelamento */}
          {appointment.status === 'COMPLETED' && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <h4 className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-2">
                ✓ Atendimento realizado
              </h4>
              <p className="text-sm text-green-700">
                Concluído em: {new Date(appointment.completed_at!).toLocaleString('pt-BR')}
              </p>
            </div>
          )}

          {appointment.status === 'CANCELLED' && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-2">
                ✕ Agendamento cancelado
              </h4>
              {appointment.cancel_reason && (
                <p className="text-sm text-red-700 mb-2 font-medium">Motivo: {appointment.cancel_reason}</p>
              )}
              <p className="text-xs text-red-600/80">
                Data do cancelamento: {new Date(appointment.cancelled_at!).toLocaleString('pt-BR')}
              </p>
            </div>
          )}

          {appointment.status === 'NO_SHOW' && (
            <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-gray-700 font-medium">Paciente não compareceu</p>
            </div>
          )}

          {appointment.status === 'RESCHEDULED' && (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-center">
              <p className="text-yellow-800 font-medium">Este agendamento foi reagendado.</p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        {appointment.status === 'SCHEDULED' && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={onReschedule} className="w-full">
                Reagendar
              </Button>
              <Button onClick={onComplete} className="w-full bg-green-600 hover:bg-green-700 text-white">
                Concluir Atendimento
              </Button>
              <Button variant="secondary" onClick={onNoShow} className="w-full text-gray-700">
                Não Compareceu
              </Button>
              <Button variant="danger" onClick={onCancel} className="w-full">
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
