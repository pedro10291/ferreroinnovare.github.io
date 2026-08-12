import React, { useState } from 'react';
import { X, Phone, Mail, Calendar, User, FileText, CheckCircle, ExternalLink, Activity, Ban } from 'lucide-react';
import { ContactRequest, contactRequestsService } from '../../../services/contactRequestsService';
import { formatPhoneNumber, generateWhatsAppLink } from '../../../utils/whatsapp';
import { RequestStatusBadge } from './RequestStatusBadge';
import { ConvertPatientDialog } from './ConvertPatientDialog';

interface RequestDetailsDrawerProps {
  request: ContactRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: ContactRequest) => void;
  onOpenPatient: (patientId: string) => void;
}

export const RequestDetailsDrawer: React.FC<RequestDetailsDrawerProps> = ({
  request,
  isOpen,
  onClose,
  onUpdate,
  onOpenPatient
}) => {
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const { clinical_data } = request;

  const handleMarkInContact = async () => {
    try {
      setLoadingAction('IN_CONTACT');
      await contactRequestsService.updateStatus(request.id, 'IN_CONTACT');
      onUpdate({ ...request, status: 'IN_CONTACT' });
    } catch (err) {
      alert('Erro ao atualizar status.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancelar esta solicitação? Ela continuará registrada no sistema, mas não poderá seguir pelo fluxo normal de conversão.')) {
      return;
    }
    try {
      setLoadingAction('CANCELLED');
      await contactRequestsService.updateStatus(request.id, 'CANCELLED');
      onUpdate({ ...request, status: 'CANCELLED' });
    } catch (err) {
      alert('Erro ao cancelar solicitação.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleConversionSuccess = (updatedRequest: ContactRequest) => {
    setShowConvertDialog(false);
    onUpdate(updatedRequest);
  };

  const whatsappLink = generateWhatsAppLink(request.phone);

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-serif text-clinic-dark font-medium">Detalhes da Solicitação</h2>
            <RequestStatusBadge status={request.status} />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Sessão: Contato */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-clinic-gold" />
              Dados do Contato
            </h3>
            
            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nome completo</p>
                  <p className="text-sm font-medium text-gray-900">{request.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Procedimento de interesse</p>
                  <p className="text-sm font-medium text-gray-900">{request.procedure_interest || 'Não especificado'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {request.email || 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Telefone</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {formatPhoneNumber(request.phone) || 'Não informado'}
                    </p>
                    {whatsappLink && (
                      <a 
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md hover:bg-green-100 transition-colors"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {request.message && (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-1">Mensagem</p>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm text-gray-700 italic">
                    "{request.message}"
                  </div>
                </div>
              )}
              
              <div className="pt-2 flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                Recebida em {new Date(request.created_at).toLocaleString('pt-BR')}
              </div>
            </div>
          </section>

          {/* Sessão: Dados Clínicos */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-clinic-gold" />
              Dados Clínicos
            </h3>
            
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm divide-y divide-gray-100">
              {clinical_data?.birthDate && (
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">Data de nascimento</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {new Date(clinical_data.birthDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              
              {clinical_data?.medicalHistory && clinical_data.medicalHistory.length > 0 && (
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-2">Histórico médico</p>
                  <div className="flex flex-wrap gap-2">
                    {clinical_data.medicalHistory.map((item: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-red-50 text-red-700 text-xs rounded-md">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {clinical_data?.pastSurgeries && (
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">Cirurgias/procedimentos anteriores</p>
                  <p className="text-sm text-gray-900">{clinical_data.pastSurgeries}</p>
                </div>
              )}

              {clinical_data?.medications && (
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">Medicamentos em uso</p>
                  <p className="text-sm text-gray-900">{clinical_data.medications}</p>
                </div>
              )}

              {clinical_data?.allergies && (
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">Alergias</p>
                  <p className="text-sm text-gray-900 font-medium text-red-600">{clinical_data.allergies}</p>
                </div>
              )}

              {clinical_data?.habits && clinical_data.habits.length > 0 && (
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-2">Hábitos</p>
                  <div className="flex flex-wrap gap-2">
                    {clinical_data.habits.map((item: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {clinical_data?.observations && (
                <div className="p-4 bg-yellow-50/50">
                  <p className="text-xs text-yellow-800/60 mb-1">Observações</p>
                  <p className="text-sm text-yellow-900">{clinical_data.observations}</p>
                </div>
              )}
              
              {!clinical_data || Object.keys(clinical_data).length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">
                  Nenhum dado clínico fornecido.
                </div>
              ) : null}
            </div>
          </section>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          {request.status === 'CONVERTED' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Esta solicitação já foi convertida em paciente.</span>
              </div>
              {request.converted_patient_id && (
                <button
                  onClick={() => onOpenPatient(request.converted_patient_id!)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver paciente
                </button>
              )}
            </div>
          ) : request.status === 'CANCELLED' ? (
            <div className="flex items-center justify-center p-2 text-red-600">
              <Ban className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Solicitação cancelada</span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleCancel}
                disabled={loadingAction !== null}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-transparent rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <div className="flex items-center gap-3">
                {request.status === 'PENDING' && (
                  <button
                    onClick={handleMarkInContact}
                    disabled={loadingAction !== null}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clinic-gold disabled:opacity-50"
                  >
                    {loadingAction === 'IN_CONTACT' ? 'Atualizando...' : 'Marcar como "Em contato"'}
                  </button>
                )}
                
                <button
                  onClick={() => setShowConvertDialog(true)}
                  disabled={loadingAction !== null}
                  className="px-4 py-2 text-sm font-medium text-white bg-clinic-gold border border-transparent rounded-lg hover:bg-clinic-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-clinic-gold disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  Converter em paciente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showConvertDialog && (
        <ConvertPatientDialog 
          request={request}
          onClose={() => setShowConvertDialog(false)}
          onSuccess={handleConversionSuccess}
        />
      )}
    </>
  );
};
