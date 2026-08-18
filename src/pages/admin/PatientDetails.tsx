import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Calendar as CalendarIcon, FileText, Clock, FilePlus, ChevronRight, Inbox, ShieldAlert, ClipboardList } from 'lucide-react';
import { patientsService } from '../../services/patientsService';
import { Patient, Anamnesis, PatientRecord } from '../../types/patient';
import { Appointment } from '../../services/appointmentsService';
import { ContactRequest } from '../../services/contactRequestsService';
import { formatPhoneNumber } from '../../utils/whatsapp';
import { Card, CardContent } from '../../components/ui/Card';
import { RequestStatusBadge } from '../../components/admin/requests/RequestStatusBadge';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PatientPDFDocument } from '../../components/admin/PatientPDFDocument';

export const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [anamnesisVersions, setAnamnesisVersions] = useState<Anamnesis[]>([]);
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [originRequest, setOriginRequest] = useState<ContactRequest | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!patient) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await patientsService.deletePatient(patient.id);
      navigate('/painel/pacientes', { state: { message: 'Paciente excluído com sucesso.' } });
    } catch (err: any) {
      console.error('Erro ao excluir paciente:', err);
      setDeleteError('Não foi possível excluir o paciente. Verifique sua conexão e tente novamente.');
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        
        const [
          patientData, 
          anamnesisData, 
          recordsData, 
          appointmentsData, 
          requestData
        ] = await Promise.all([
          patientsService.fetchPatientById(id),
          patientsService.fetchPatientAnamnesis(id),
          patientsService.fetchPatientRecords(id),
          patientsService.fetchPatientAppointments(id),
          patientsService.fetchPatientOriginRequest(id)
        ]);

        if (!patientData) {
          setError("Paciente não encontrado.");
          return;
        }

        setPatient(patientData);
        setAnamnesisVersions(anamnesisData);
        setRecords(recordsData);
        setAppointments(appointmentsData);
        setOriginRequest(requestData);

      } catch (err) {
        console.error("Error fetching patient details:", err);
        setError("Não foi possível carregar os dados do paciente.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-clinic-gold border-t-transparent"></div>
        <p className="text-gray-500">Carregando dados do paciente...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">{error || "Paciente não encontrado."}</h3>
        <button 
          onClick={() => navigate('/painel/pacientes')}
          className="flex items-center gap-2 px-4 py-2 mt-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para lista
        </button>
      </div>
    );
  }

  const currentAnamnesis = anamnesisVersions.length > 0 ? anamnesisVersions[0] : null;
  const previousAnamnesisCount = anamnesisVersions.length > 1 ? anamnesisVersions.length - 1 : 0;

  // Split appointments
  const now = new Date();
  const upcomingAppointments = appointments.filter(a => a.status === 'SCHEDULED' && new Date(a.scheduled_at) >= now);
  // Historico contains completed, cancelled, no_show, rescheduled and even past scheduled that were missed
  const historyAppointments = appointments.filter(a => !(a.status === 'SCHEDULED' && new Date(a.scheduled_at) >= now));

  const formatClinicalValue = (value: any): string => {
    if (!value) return 'Não informado';
    
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          return formatObjectValue(parsed);
        } catch (e) {
          return value;
        }
      }
      return value;
    }
    
    if (typeof value === 'object') {
      return formatObjectValue(value);
    }
    
    return String(value);
  };

  const formatObjectValue = (obj: any): string => {
    if (!obj) return 'Não informado';
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return 'Não informado';
      return obj.join(', ');
    }
    
    if ('answer' in obj) {
      const ans = obj.answer;
      if (ans === 'Não' || ans === 'Nunca') {
        if (obj.details) return `${ans} (${obj.details})`;
        return ans === 'Não' ? 'Não possui' : 'Nunca realizou';
      }
      if (ans === 'Sim' || ans === 'Sim, recentemente' || ans === 'Sim, há algum tempo') {
        if (obj.details) return `${ans}: ${obj.details}`;
        return ans;
      }
      return ans;
    }
    
    return JSON.stringify(obj);
  };

  const DataBlock = ({ label, value }: { label: string, value?: string | null }) => (
    <div className="mb-4">
      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
      <p className="text-gray-800 text-sm whitespace-pre-wrap">{value || <span className="text-gray-400 italic">Não informado</span>}</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Nav */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/painel/pacientes')}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-serif text-clinic-dark">Ficha do Paciente</h1>
        </div>
        
        <div>
          <PDFDownloadLink
            document={
              <PatientPDFDocument 
                patient={patient} 
                anamnesis={currentAnamnesis} 
                records={records} 
                appointments={appointments} 
                originRequest={originRequest}
              />
            }
            fileName={`ficha-${patient.full_name.replace(/\s+/g, '-').toLowerCase()}.pdf`}
            className="flex items-center gap-2 px-4 py-2 bg-clinic-gold text-white font-medium rounded-lg hover:bg-clinic-goldDark transition-colors text-sm shadow-sm"
          >
            {({ loading }) => (
              loading ? 'Gerando PDF...' : 'Baixar ficha em PDF'
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Hero / Header Card */}
      <Card glass={false} className="border-t-4 border-t-clinic-gold overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start justify-between flex-col md:flex-row gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-clinic-surface flex items-center justify-center text-clinic-gold border border-clinic-border shrink-0 shadow-inner">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-3xl font-serif text-clinic-dark">{patient.full_name}</h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-3 text-sm text-gray-600">
                  {patient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" /> {formatPhoneNumber(patient.phone)}
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" /> {patient.email}
                    </div>
                  )}
                  {patient.birth_date && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" /> {new Date(patient.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Clinical Data */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Anamnese */}
          <Card glass={false}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-clinic-gold" />
                <h3 className="text-lg font-serif text-clinic-dark">Anamnese Atual</h3>
              </div>
              {previousAnamnesisCount > 0 && (
                <span className="text-xs bg-white px-2 py-1 border border-gray-200 rounded-full text-gray-500">
                  +{previousAnamnesisCount} versões anteriores (histórico preservado)
                </span>
              )}
            </div>
            <CardContent className="p-6">
              {currentAnamnesis ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                  <DataBlock label="Doenças Relevantes" value={formatClinicalValue(currentAnamnesis.relevant_diseases)} />
                  <DataBlock label="Alergias" value={formatClinicalValue(currentAnamnesis.allergies)} />
                  <DataBlock label="Medicamentos em uso" value={formatClinicalValue(currentAnamnesis.medications)} />
                  <DataBlock label="Procedimentos Anteriores" value={formatClinicalValue(currentAnamnesis.previous_procedures)} />
                  <div className="sm:col-span-2">
                    <DataBlock label="Observações Profissionais" value={formatClinicalValue(currentAnamnesis.professional_notes)} />
                  </div>
                  <div className="sm:col-span-2 mt-2">
                    <p className="text-xs text-gray-400">Atualizado em {new Date(currentAnamnesis.created_at).toLocaleDateString('pt-BR')} às {new Date(currentAnamnesis.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FilePlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Nenhuma anamnese registrada.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Atendimentos (Patient Records) */}
          <Card glass={false}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50 rounded-t-xl">
              <ClipboardList className="w-5 h-5 text-clinic-gold" />
              <h3 className="text-lg font-serif text-clinic-dark">Histórico de Atendimentos</h3>
            </div>
            <CardContent className="p-0">
              {records.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {records.map(record => (
                    <div key={record.id} className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{record.procedure_name || 'Procedimento não informado'}</h4>
                          <p className="text-sm text-gray-500">Profissional: {record.professional_name || 'Não informado'}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                          <Clock className="w-4 h-4" />
                          {new Date(record.record_date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Evolução Clínica</span>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.evolution_notes || <span className="italic text-gray-400">Sem anotações de evolução.</span>}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Nenhum atendimento realizado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Appointments & Origin */}
        <div className="space-y-6">
          
          {/* Próximos Agendamentos */}
          <Card glass={false}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50 rounded-t-xl">
              <CalendarIcon className="w-5 h-5 text-clinic-gold" />
              <h3 className="text-lg font-serif text-clinic-dark">Próximos Agendamentos</h3>
            </div>
            <CardContent className="p-0">
              {upcomingAppointments.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {upcomingAppointments.map(app => (
                    <div key={app.id} className="p-5 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100 w-fit">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(app.scheduled_at).toLocaleDateString('pt-BR')} às {new Date(app.scheduled_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded font-medium">AGENDADO</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm mt-1">{app.procedures?.title || 'Procedimento Genérico'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Com: {app.profiles?.full_name || 'Profissional não atribuído'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-gray-500">
                  Nenhum agendamento futuro.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Agendamentos */}
          <Card glass={false}>
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
              <h3 className="text-md font-serif text-clinic-dark">Histórico de Agendamentos</h3>
            </div>
            <CardContent className="p-0 max-h-80 overflow-y-auto">
              {historyAppointments.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {historyAppointments.map(app => (
                    <div key={app.id} className="p-4 flex flex-col gap-1.5">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-500">
                          {new Date(app.scheduled_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                          app.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                          app.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                          app.status === 'NO_SHOW' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {app.status === 'COMPLETED' ? 'Concluído' :
                           app.status === 'CANCELLED' ? 'Cancelado' :
                           app.status === 'NO_SHOW' ? 'Faltou' : app.status}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{app.procedures?.title || 'Procedimento Genérico'}</p>
                      <p className="text-xs text-gray-500">Com: {app.profiles?.full_name || 'Profissional não atribuído'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-gray-500">
                  Nenhum histórico disponível.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Origem */}
          {originRequest && (
            <Card glass={false} className="bg-clinic-surfaceHover border-clinic-border">
              <div className="px-6 py-4 border-b border-clinic-border flex items-center gap-2">
                <Inbox className="w-4 h-4 text-clinic-textSecondary" />
                <h3 className="text-md font-serif text-clinic-dark">Solicitação de Origem</h3>
              </div>
              <CardContent className="p-5 text-sm space-y-3">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Data da captação</span>
                  <p className="text-gray-800">{new Date(originRequest.created_at).toLocaleDateString('pt-BR')} às {new Date(originRequest.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Interesse Original</span>
                  <p className="text-gray-800">{originRequest.procedure_interest || '-'}</p>
                </div>
                {originRequest.message && (
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">Mensagem</span>
                    <p className="text-gray-700 italic border-l-2 border-clinic-gold pl-3 py-1 bg-white rounded-r-md mt-1 whitespace-pre-wrap">{originRequest.message}</p>
                  </div>
                )}
                <div className="pt-2">
                  <RequestStatusBadge status={originRequest.status} />
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Zona de atenção */}
      <div className="mt-12 border-t border-red-100 pt-8 max-w-3xl">
        <h3 className="text-lg font-serif text-red-900 mb-2 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Zona de atenção
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Ações destrutivas relacionadas a este paciente.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-white border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 rounded-lg text-sm font-medium transition-colors"
        >
          Excluir paciente
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden max-w-[calc(100vw-32px)] sm:max-w-md">
            <h2 className="text-xl font-serif text-gray-900 mb-2">Excluir paciente?</h2>
            <p className="text-sm text-gray-600 mb-6">
              Esta ação removerá o cadastro deste paciente e os dados relacionados conforme as regras atuais do sistema.<br/><br/>
              Essa ação não pode ser desfeita.
            </p>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                {deleteError}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-2">
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center min-w-[140px] transition-colors"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Excluir paciente'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
