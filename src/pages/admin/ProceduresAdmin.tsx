import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Procedure } from '../../types/procedure';
import { Plus, X, Edit2, Save, Trash2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from '../../components/admin/ImageUpload';

export const ProceduresAdmin = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [editingProc, setEditingProc] = useState<Procedure | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const MAX_PROCEDURES = 10;

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('procedures').select('*').order('display_order');
    if (!error && data) setProcedures(data as Procedure[]);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!editingProc) return;
    try {
      // Remover campos de array não suportados mais pela interface simplificada
      // Mas manteremos o que tiver no db caso eles existam
      const payload = { ...editingProc, updated_at: new Date().toISOString() };
      
      const { error } = await supabase
        .from('procedures')
        .upsert(payload);
        
      if (!error) {
        setEditingProc(null);
        fetchProcedures();
      } else {
        alert('Erro ao salvar procedimento.');
        console.error(error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUploaded = (url: string) => {
    if (editingProc) {
      setEditingProc({ ...editingProc, image: url });
    }
  };

  const handleImageRemoved = () => {
    if (editingProc) {
      setEditingProc({ ...editingProc, image: undefined });
    }
  };

  const isLimitReached = procedures.length >= MAX_PROCEDURES;

  if (editingProc) {
    return (
      <div className="bg-clinic-bg min-h-[80vh] pb-12">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setEditingProc(null)} 
            className="flex items-center gap-2 text-sm text-clinic-textSecondary hover:text-clinic-textPrimary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-clinic-gold text-white px-6 py-2 rounded-md hover:bg-clinic-goldDark transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" /> Salvar Procedimento
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna da Imagem */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 border border-clinic-border rounded-xl shadow-sm">
              <h3 className="text-lg font-serif text-clinic-textPrimary mb-2">Foto do Procedimento</h3>
              <p className="text-xs text-gray-500 mb-6">Esta imagem será exibida na página do procedimento.</p>
              
              <ImageUpload 
                folder="procedures" 
                currentImageUrl={editingProc.image}
                onImageUploaded={handleImageUploaded}
                onImageRemoved={handleImageRemoved}
              />
            </div>
          </div>

          {/* Coluna dos Dados Básicos */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 border border-clinic-border rounded-xl shadow-sm">
              <h3 className="text-lg font-serif text-clinic-textPrimary mb-6">Informações Básicas</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-clinic-textSecondary mb-1">Título</label>
                  <input 
                    type="text" 
                    value={editingProc.title || ''} 
                    onChange={(e) => setEditingProc({...editingProc, title: e.target.value})}
                    className="w-full px-4 py-2 border border-clinic-border rounded-md focus:ring-1 focus:ring-clinic-gold focus:border-clinic-gold"
                    placeholder="Ex: Harmonização Facial"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-clinic-textSecondary mb-1">Slug (URL)</label>
                  <input 
                    type="text" 
                    value={editingProc.slug || ''} 
                    onChange={(e) => setEditingProc({...editingProc, slug: e.target.value})}
                    className="w-full px-4 py-2 border border-clinic-border rounded-md bg-gray-50"
                    placeholder="harmonizacao-facial"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Identificador único usado no link da página.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-clinic-textSecondary mb-1">Resumo Curto (Home)</label>
                  <textarea 
                    value={editingProc.short_description || ''} 
                    onChange={(e) => setEditingProc({...editingProc, short_description: e.target.value})}
                    className="w-full px-4 py-2 border border-clinic-border rounded-md h-20"
                    placeholder="Uma frase impactante para a listagem principal..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-clinic-textSecondary mb-1">Descrição Completa</label>
                  <textarea 
                    value={editingProc.description || ''} 
                    onChange={(e) => setEditingProc({...editingProc, description: e.target.value})}
                    className="w-full px-4 py-2 border border-clinic-border rounded-md h-40"
                    placeholder="Descreva o procedimento em detalhes..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-clinic-dark">Procedimentos</h1>
          <p className="text-gray-500 mt-1">Gerencie o portfólio de tratamentos da clínica</p>
        </div>
        
        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${isLimitReached ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
            {procedures.length} de {MAX_PROCEDURES} procedimentos
          </span>
          
          <button 
            onClick={() => setEditingProc({ id: crypto.randomUUID(), title: '', slug: '', active: true, display_order: procedures.length + 1 } as unknown as Procedure)}
            disabled={isLimitReached}
            className={`px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2 shadow-sm
              ${isLimitReached 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-clinic-dark text-white hover:bg-clinic-gold'
              }`}
          >
            <Plus className="w-4 h-4" /> Novo Procedimento
          </button>
        </div>
      </div>

      {isLimitReached && (
        <div className="bg-orange-50 border border-orange-100 text-orange-800 px-4 py-3 rounded-lg text-sm font-medium">
          Limite de {MAX_PROCEDURES} procedimentos atingido.
        </div>
      )}

      {isLoading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-clinic-gold border-t-transparent"></div>
        </div>
      ) : procedures.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
          <p className="text-gray-500 font-medium">Nenhum procedimento cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {procedures.map((proc) => (
            <div key={proc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-gray-100 relative">
                {proc.image ? (
                  <img src={proc.image} alt={proc.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">Sem foto</span>
                  </div>
                )}
                {!proc.active && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                    Inativo
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-serif text-clinic-dark text-lg line-clamp-1">{proc.title}</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4 line-clamp-2 flex-1">
                  {proc.short_description || 'Sem descrição.'}
                </p>
                <button 
                  onClick={() => setEditingProc(proc)}
                  className="w-full py-2 bg-gray-50 hover:bg-clinic-gold hover:text-white text-clinic-dark text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProceduresAdmin;
