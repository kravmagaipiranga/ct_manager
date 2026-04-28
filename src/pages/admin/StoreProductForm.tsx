import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { Product } from '../../types';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StoreProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const isEditing = Boolean(id);
  const products = useDataStore((state) => state.products);
  const addProduct = useDataStore((state) => state.addProduct);
  const updateProduct = useDataStore((state) => state.updateProduct);
  const deleteProduct = useDataStore((state) => state.deleteProduct);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    variationsString: ''
  });

  useEffect(() => {
    if (isEditing && id) {
      const product = products.find(p => p.id === id);
      if (product) {
        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price,
          stock: product.stock || 0,
          imageUrl: product.imageUrl || '',
          variationsString: product.variations ? product.variations.join(', ') : ''
        });
      } else {
        navigate('/admin/store');
      }
    }
  }, [id, isEditing, products, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saveData = {
       ...formData,
       variations: formData.variationsString.split(',').map(s => s.trim()).filter(Boolean)
    };
    if (isEditing && id) {
      updateProduct(id, saveData);
      toast.success('Produto atualizado com sucesso!');
    } else {
      addProduct({
         id: Math.random().toString(36).substr(2, 9),
         ...saveData
      });
      toast.success('Produto cadastrado com sucesso!');
    }
    navigate('/admin/store');
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id!);
      navigate('/admin/store');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/store')}
          className="p-2 hover:bg-black/20 rounded-lg text-krav-muted hover:text-krav-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </h1>
          <p className="text-sm text-krav-muted mt-1">Preencha os detalhes do produto para a loja da academia.</p>
        </div>
      </div>

      <div className="bg-krav-card border border-krav-border rounded-xl overflow-hidden shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-krav-muted mb-1">Nome do Produto</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full bg-krav-bg text-krav-text border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-krav-muted mb-1">Preço (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} 
                  className="w-full bg-krav-bg text-krav-text border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-krav-muted mb-1">Estoque Inicial</label>
                <input 
                  type="number" 
                  min="0" 
                  value={formData.stock} 
                  onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} 
                  className="w-full bg-krav-bg text-krav-text border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none" 
                  required 
                />
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-krav-muted mb-1">Descrição</label>
               <textarea 
                  rows={4}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full bg-krav-bg text-krav-text border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none resize-none" 
               />
            </div>

            <div>
              <label className="block text-sm font-medium text-krav-muted mb-1">Variações (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ex: P, M, G, GG ou Branco, Preto" 
                value={formData.variationsString} 
                onChange={e => setFormData({...formData, variationsString: e.target.value})} 
                className="w-full bg-krav-bg text-krav-text border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none" 
              />
              <p className="text-xs text-krav-muted mt-2">Separe as opções por vírgula</p>
            </div>

            <div>
               <label className="block text-sm font-medium text-krav-muted mb-1">Imagem do Produto (URL)</label>
               <div className="flex gap-3 items-center">
                 <input 
                    type="url" 
                    placeholder="https://exemplo.com/imagem.png" 
                    value={formData.imageUrl} 
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                    className="flex-1 bg-krav-bg text-krav-text border border-krav-border focus:border-krav-accent p-3 rounded-lg transition-colors outline-none" 
                 />
                 <button type="button" onClick={() => {
                    const url = prompt('Cole a URL da imagem:');
                    if(url) setFormData({...formData, imageUrl: url});
                 }} className="bg-krav-bg border border-krav-border text-krav-text px-4 py-3 rounded-lg hover:bg-black/10 transition-colors font-medium shadow-sm">
                   Upload Link
                 </button>
               </div>
               {formData.imageUrl && (
                 <div className="mt-4 p-2 bg-krav-bg border border-krav-border rounded-lg inline-block">
                    <img src={formData.imageUrl} alt="Preview" className="h-24 w-24 object-cover rounded" />
                 </div>
               )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-krav-border flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-krav-danger hover:text-red-400 hover:bg-krav-danger/10 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Produto
              </button>
            ) : (
              <div></div>
            )}
            
            <div className="flex gap-3">
               <button
                  type="button"
                  onClick={() => navigate('/admin/store')}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-krav-muted hover:text-krav-text hover:bg-black/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-krav-accent text-white flex items-center gap-2 hover:bg-krav-accent-light transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Salvar Alterações' : 'Salvar Produto'}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
