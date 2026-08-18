import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Search, Filter, Inbox, Phone, Clock, ChevronLeft, ChevronRight, Eye, User, Ban } from 'lucide-react';
import { contactRequestsService, ContactRequest } from '../../services/contactRequestsService';
import { RequestStatusBadge } from '../../components/admin/requests/RequestStatusBadge';
import { RequestDetailsDrawer } from '../../components/admin/requests/RequestDetailsDrawer';
import { formatPhoneNumber } from '../../utils/whatsapp';

export default function ContactRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;
  
  // Summary
  const [summary, setSummary] = useState({ PENDING: 0, IN_CONTACT: 0, CONVERTED: 0, CANCELLED: 0 });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [procedureFilter, setProcedureFilter] = useState('all');

  // Drawer
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await contactRequestsService.fetchSummary();
      setSummary(data as any);
    } catch (err) {
      console.error('Failed to fetch summary', err);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { data, count } = await contactRequestsService.fetchContactRequests(page, limit, {
        searchTerm,
        status: statusFilter,
        procedure: procedureFilter
      });
      setRequests(data);
      setTotalCount(count);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, statusFilter, procedureFilter]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const totalPages = Math.ceil(totalCount / limit);

  const handleUpdate = (updatedRequest: ContactRequest) => {
    setRequests(prev => prev.map(r => r.id === updatedRequest.id ? updatedRequest : r));
    setSelectedRequest(updatedRequest);
    fetchSummary(); // Refresh summary counts
  };

  const handleOpenPatient = (patientId: string) => {
    navigate(`/painel/pacientes/${patientId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-clinic-dark">Solicitações</h1>
          <p className="text-gray-500 mt-1">Gerencie leads e contatos recebidos pelo site</p>
        </div>
        <button 
          onClick={() => { fetchRequests(); fetchSummary(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pendentes</p>
            <p className="text-2xl font-serif text-clinic-dark mt-1">{summary.PENDING}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
            <Inbox className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Em contato</p>
            <p className="text-2xl font-serif text-clinic-dark mt-1">{summary.IN_CONTACT}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Phone className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Convertidas</p>
            <p className="text-2xl font-serif text-clinic-dark mt-1">{summary.CONVERTED}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-full text-green-600">
            <User className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Canceladas</p>
            <p className="text-2xl font-serif text-clinic-dark mt-1">{summary.CANCELLED}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-full text-red-600">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou telefone..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-gold focus:border-transparent text-sm"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-48 pl-9 pr-8 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-clinic-gold focus:border-transparent text-sm"
            >
              <option value="all">Todos os Status</option>
              <option value="PENDING">Pendentes</option>
              <option value="IN_CONTACT">Em contato</option>
              <option value="CONVERTED">Convertidas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </div>
          
          <select
            value={procedureFilter}
            onChange={(e) => { setProcedureFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-48 px-4 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-clinic-gold focus:border-transparent text-sm"
          >
            <option value="all">Todos os Procedimentos</option>
            <option value="Harmonização">Harmonização</option>
            <option value="Toxina">Toxina</option>
            <option value="Preenchimento">Preenchimento</option>
            <option value="Bioestimulador">Bioestimulador</option>
            <option value="Fios">Fios de PDO</option>
            <option value="Skinbooster">Skinbooster</option>
            <option value="Microagulhamento">Microagulhamento</option>
          </select>
        </div>
      </div>

      {/* List / Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-clinic-gold border-t-transparent"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma solicitação encontrada</h3>
            <p className="text-gray-500">Quando alguém preencher o formulário do site, a solicitação aparecerá aqui.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4 font-medium">Cliente</th>
                    <th className="px-6 py-4 font-medium">Procedimento</th>
                    <th className="px-6 py-4 font-medium">Contato</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Data</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{request.full_name}</div>
                        {request.email && <div className="text-sm text-gray-500">{request.email}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {request.procedure_interest || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatPhoneNumber(request.phone) || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <RequestStatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(request.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => { setSelectedRequest(request); setIsDrawerOpen(true); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden divide-y divide-gray-100">
              {requests.map(request => (
                <div key={request.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{request.full_name}</h4>
                      <p className="text-sm text-gray-500 truncate mt-0.5">{request.procedure_interest || 'Sem procedimento'}</p>
                    </div>
                    <RequestStatusBadge status={request.status} />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {formatPhoneNumber(request.phone) || '-'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(request.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => { setSelectedRequest(request); setIsDrawerOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalhes
                  </button>
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

      <RequestDetailsDrawer 
        request={selectedRequest}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={handleUpdate}
        onOpenPatient={handleOpenPatient}
      />
    </div>
  );
}
