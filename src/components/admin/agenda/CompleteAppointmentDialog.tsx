import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react';
import { appointmentsService } from '../../../services/appointmentsService';

interface CompleteAppointmentDialogProps {
  appointmentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const CompleteAppointmentDialog: React.FC<CompleteAppointmentDialogProps> = ({
  appointmentId,
  isOpen,
  onClose,
  onSuccess,
  showToast
}) => {
  const [evolutionNotes, setEvolutionNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!evolutionNotes.trim()) {
      showToast('A evolução do atendimento é obrigatória.', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      await appointmentsService.completeAppointment(appointmentId, evolutionNotes, internalNotes);
      showToast('Atendimento concluído com sucesso.', 'success');
      onSuccess();
    } catch (error: any) {
      console.error(error);
      showToast('Não foi possível concluir o atendimento. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-serif text-clinic-dark mb-4">Concluir Atendimento</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Evolução do atendimento *
            </label>
            <textarea
              value={evolutionNotes}
              onChange={(e) => setEvolutionNotes(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-clinic-gold focus:border-transparent transition-shadow min-h-[120px]"
              placeholder="Descreva como foi o atendimento, procedimentos realizados..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas internas (opcional)
            </label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-clinic-gold focus:border-transparent transition-shadow min-h-[80px]"
              placeholder="Observações administrativas ou confidenciais da equipe..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} isLoading={isLoading} className="flex-1 bg-green-600 hover:bg-green-700">
              Concluir atendimento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
