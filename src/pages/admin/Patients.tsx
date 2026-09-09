import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Eye, Users, CheckCircle2, Trash2 } from 'lucide-react';
import { patientsService } from '../../services/patientsService';
import { Patient } from '../../types/patient';
import { formatPhoneNumber } from '../../utils/whatsapp';

export const Patients = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(location.state?.message || null);

  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!patientToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await patientsService.deletePatient(patientToDelete.id);
      setSuccessMessage('Paciente excluído com sucesso.');
      setPatientToDelete(null);
      fetchPatients(); // Atualiza a listagem automaticamente
    } catch (err: any) {
      console.error('Erro ao excluir paciente:', err);
      if (err.message === 'HAS_DEPENDENCIES') {
        setDeleteError('Este paciente possui registros vinculados (agendamentos, anamnese, etc.) e não pode ser excluído no momento.');
      } else {
        setDeleteError('Não foi possível excluir o paciente. Pode haver dados relacionados que impedem a exclusão.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        navigate(location.pathname, { replace: true, state: {} });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate, location.pathname]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, count } = await patientsService.fetchPatients(page, limit, debouncedSearch);
      setPatients(data);
      setTotalCount(count);
    } catch (err) {
      console.error('Failed to fetch patients', err);
      setError('Não foi possível carregar os pacientes.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-clinic-dark">Pacientes</h1>
          <p className="text-gray-500 mt-1">Cadastro e histórico dos pacientes da clínica</p>
        </div>
        <button
          onClick={() => navigate('/painel/pacientes/new')}
          className="flex items-center gap-2 px-4 py-2 bg-clinic-gold text-white font-medium rounded-lg hover:bg-clinic-goldDark transition-colors text-sm shadow-sm"
        >
          Novo Paciente
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          {successMessage}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome, telefone ou e-mail..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-gold focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center flex-col gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-clinic-gold border-t-transparent"></div>
            <p className="text-sm text-gray-500">Carregando pacientes...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
            <button 
              onClick={fetchPatients}
              className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm"
            >
              Tentar novamente
            </button>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum paciente cadastrado.</h3>
            {debouncedSearch && <p className="text-gray-500">Tente buscar por outro termo.</p>}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4 font-medium">Paciente</th>
                    <th className="px-6 py-4 font-medium">Telefone</th>
                    <th className="px-6 py-4 font-medium">E-mail</th>
                    <th className="px-6 py-4 font-medium">Nascimento</th>
                    <th className="px-6 py-4 font-medium">Cadastro</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patients.map(patient => (
                    <tr 
                      key={patient.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/painel/pacientes/${patient.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{patient.full_name}</div>
                        {patient.cpf && <div className="text-xs text-gray-400">CPF: {patient.cpf}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatPhoneNumber(patient.phone) || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 truncate max-w-xs">
                        {patient.email || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/painel/pacientes/${patient.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            Ver ficha
                          </button>
                          <button 
                            className="inline-flex items-center justify-center p-1.5 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPatientToDelete(patient);
                            }}
                            title="Excluir paciente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {patients.map(patient => (
                <div 
                  key={patient.id} 
                  className="p-4 space-y-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  onClick={() => navigate(`/painel/pacientes/${patient.id}`)}
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{patient.full_name}</h4>
                    {patient.email && <p className="text-sm text-gray-500 truncate mt-0.5">{patient.email}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="block text-xs text-gray-400 mb-0.5">Telefone</span>
                      {formatPhoneNumber(patient.phone) || '-'}
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400 mb-0.5">Nascimento</span>
                      {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/painel/pacientes/${patient.id}`);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      Ver ficha
                    </button>
                    <button 
                      className="flex-none flex items-center justify-center px-4 py-2 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPatientToDelete(patient);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Mostrando <span className="font-medium">{(page - 1) * limit + 1}</span> até <span className="font-medium">{Math.min(page * limit, totalCount)}</span> de <span className="font-medium">{totalCount}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {patientToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isDeleting && setPatientToDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden max-w-[calc(100vw-32px)] sm:max-w-md">
            <h2 className="text-xl font-serif text-gray-900 mb-2">Excluir paciente?</h2>
            <p className="text-sm text-gray-600 mb-6">
              Esta ação removerá o cadastro de <strong className="font-medium">{patientToDelete.full_name}</strong> e os dados associados. Essa ação não poderá ser desfeita.
            </p>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                {deleteError}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-2">
              <button 
                onClick={() => setPatientToDelete(null)}
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
