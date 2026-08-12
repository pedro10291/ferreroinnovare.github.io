import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react';
import { appointmentsService } from '../../../services/appointmentsService';

interface CancelAppointmentDialogProps {
  appointmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const CancelAppointmentDialog: React.FC<CancelAppointmentDialogProps> = ({
  appointmentId,
  isOpen,
  onClose,
  onSuccess,
  showToast
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) {
      showToast('Por favor, informe o motivo do cancelamento.', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      await appointmentsService.cancelAppointment(appointmentId, reason);
      showToast('Atendimento cancelado com sucesso.', 'success');
      onSuccess();
    } catch (error: any) {
      console.error(error);
      showToast('Não foi possível cancelar o atendimento. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-serif text-clinic-dark mb-4">Cancelar Agendamento</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Por que este atendimento foi cancelado? *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-clinic-gold focus:border-transparent transition-shadow resize-none h-32"
              placeholder="Ex: Paciente desmarcou por motivo de viagem..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Voltar
            </Button>
            <Button variant="danger" onClick={handleConfirm} isLoading={isLoading} className="flex-1">
              Confirmar cancelamento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
