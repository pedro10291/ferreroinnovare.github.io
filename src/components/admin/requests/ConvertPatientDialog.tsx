import React, { useEffect, useState } from 'react';
import { X, UserPlus, UserCheck, AlertTriangle } from 'lucide-react';
import { contactRequestsService, ContactRequest } from '../../../services/contactRequestsService';
import { formatPhoneNumber } from '../../../utils/whatsapp';

interface ConvertPatientDialogProps {
  request: ContactRequest;
  onClose: () => void;
  onSuccess: (updatedRequest: ContactRequest) => void;
}

export const ConvertPatientDialog: React.FC<ConvertPatientDialogProps> = ({ request, onClose, onSuccess }) => {
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoadingMatches(true);
        const results = await contactRequestsService.findMatchingPatients(request.email, request.phone);
        setMatches(results || []);
        // Por padrão, se não houver matches, selectedPatientId fica null (criar novo)
      } catch (err) {
        console.error('Erro ao buscar pacientes:', err);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [request]);

  const handleConvert = async () => {
    try {
      setConverting(true);
      setError(null);
      await contactRequestsService.convertRequest(request.id, selectedPatientId);
      
      // Simular a atualização do request para notificar o pai
      const updatedRequest = { ...request, status: 'CONVERTED' as const, converted_patient_id: selectedPatientId || 'new' };
      onSuccess(updatedRequest);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('já foi convertida')) {
        setError('Esta solicitação já foi convertida.');
      } else {
        setError('Não foi possível converter a solicitação. Tente novamente.');
      }
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-serif text-clinic-dark">Converter solicitação em paciente?</h2>
          <button
            onClick={onClose}
            disabled={converting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <p className="text-sm text-gray-600 mb-6">
            Essa ação criará o cadastro do paciente e registrará os dados clínicos enviados nesta solicitação como uma nova anamnese.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loadingMatches ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-clinic-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.length > 0 ? (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                    <p className="text-sm text-blue-800 font-medium">
                      Encontramos um paciente que pode corresponder a esta solicitação.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label 
                      className={`block cursor-pointer p-4 border rounded-lg transition-all ${
                        selectedPatientId === null 
                          ? 'border-clinic-gold bg-clinic-gold/5 ring-1 ring-clinic-gold' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input 
                          type="radio" 
                          name="patientMatch" 
                          checked={selectedPatientId === null}
                          onChange={() => setSelectedPatientId(null)}
                          className="mt-1 text-clinic-gold focus:ring-clinic-gold" 
                        />
                        <div>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-gray-500" />
                            Criar novo paciente
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Esta solicitação será convertida em um novo paciente.
                          </p>
                        </div>
                      </div>
                    </label>

                    {matches.map((match) => (
                      <label 
                        key={match.id}
                        className={`block cursor-pointer p-4 border rounded-lg transition-all ${
                          selectedPatientId === match.id 
                            ? 'border-clinic-gold bg-clinic-gold/5 ring-1 ring-clinic-gold' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input 
                            type="radio" 
                            name="patientMatch" 
                            checked={selectedPatientId === match.id}
                            onChange={() => setSelectedPatientId(match.id)}
                            className="mt-1 text-clinic-gold focus:ring-clinic-gold" 
                          />
                          <div>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-clinic-gold" />
                              Usar paciente existente
                            </p>
                            <div className="mt-2 text-sm text-gray-600 space-y-1">
                              <p><span className="font-medium">Nome:</span> {match.full_name}</p>
                              {match.email && <p><span className="font-medium">Email:</span> {match.email}</p>}
                              {match.phone && <p><span className="font-medium">Telefone:</span> {formatPhoneNumber(match.phone)}</p>}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg flex items-start gap-4">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <UserPlus className="w-5 h-5 text-clinic-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Novo paciente</p>
                    <p className="text-sm text-gray-600 mt-1">Esta solicitação será convertida em um novo cadastro.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={converting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clinic-gold disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConvert}
            disabled={converting || loadingMatches}
            className="px-4 py-2 text-sm font-medium text-white bg-clinic-gold border border-transparent rounded-lg hover:bg-clinic-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clinic-gold disabled:opacity-50 flex items-center gap-2"
          >
            {converting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Convertendo...</span>
              </>
            ) : (
              'Confirmar conversão'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
