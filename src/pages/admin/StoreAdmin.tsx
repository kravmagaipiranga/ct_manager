import React, { useState } from 'react';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ShoppingBag, Box, Package, Check, Plus, Edit, Trash2, X, Save, Download } from 'lucide-react';
import { ContactActions } from '../../components/shared/ContactActions';
import { OrderStatus, Product } from '../../types';
import { Pagination } from '../../components/shared/Pagination';
import { exportToCSV } from '../../lib/csv';

export default function StoreAdmin() {
  const user = useAuthStore((state) => state.user);
  const products = useDataStore((state) => state.products);
  const allOrders = useDataStore((state) => state.orders);
  const students = useDataStore((state) => state.students);
  const updateOrderStatus = useDataStore((state) => state.updateOrderStatus);

  // If user is instructor, show only orders for their students
  const orders = React.useMemo(() => {
    if (user?.role === 'INSTRUCTOR') {
      const myStudentIds = students.filter(s => s.instructorId === user.id).map(s => s.id);
      return allOrders.filter(o => myStudentIds.includes(o.studentId));
    }
    return allOrders;
  }, [allOrders, students, user]);
  
  const addProduct = useDataStore((state) => state.addProduct);
  const updateProduct = useDataStore((state) => state.updateProduct);
  const deleteProduct = useDataStore((state) => state.deleteProduct);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'PRODUCTS'>('ORDERS');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, stock: 0 });

  // Pagination State
  const [ordersPage, setOrdersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const mappedOrders = orders.map(o => {
    const student = students.find(s => s.id === o.studentId);
    return { ...o, studentName: student?.name || 'Desconhecido', studentPhone: student?.phone, studentEmail: student?.email };
  });

  // Derived Pagination
  const paginatedOrders = mappedOrders.slice((ordersPage - 1) * ITEMS_PER_PAGE, ordersPage * ITEMS_PER_PAGE);
  const ordersTotalPages = Math.ceil(mappedOrders.length / ITEMS_PER_PAGE);

  const paginatedProducts = products.slice((productsPage - 1) * ITEMS_PER_PAGE, productsPage * ITEMS_PER_PAGE);
  const productsTotalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const handleExportOrders = () => {
    exportToCSV(
      mappedOrders,
      [
        { header: 'ID do Pedido', key: 'id' },
        { header: 'Aluno', key: 'studentName' },
        { header: 'Total (R$)', key: 'total' },
        { header: 'Status', key: 'status' },
        { header: 'Data do Pedido', key: 'createdAt' }
      ],
      'Relatorio_Vendas'
    );
  };

  const handleExportProducts = () => {
    exportToCSV(
      products,
      [
        { header: 'Produto', key: 'name' },
        { header: 'Preço (R$)', key: 'price' },
        { header: 'Estoque Atual', key: 'stock' }
      ],
      'Relatorio_Produtos'
    );
  };

  const handleOpenForm = (product?: Product) => {
    if (product) {
       setEditingId(product.id);
       setFormData({
         name: product.name,
         description: product.description,
         price: product.price,
         stock: product.stock
       });
    } else {
       setEditingId(null);
       setFormData({ name: '', description: '', price: 0, stock: 0 });
    }
    setIsFormOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProduct(editingId, formData);
    } else {
      addProduct({
         id: Math.random().toString(36).substr(2, 9),
         ...formData
      });
    }
    setIsFormOpen(false);
  };

  return (
    <div className="p-6 md:p-8 flex flex-col h-full bg-krav-bg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Loja e Produtos</h1>
          <p className="text-sm text-krav-muted mt-1">Gerencie produtos e visualize pedidos de alunos.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {activeTab === 'ORDERS' ? (
            <button 
              onClick={handleExportOrders}
              className="bg-krav-card border border-krav-border text-krav-text hover:bg-black/5 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
               <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar Vendas (CSV)</span>
            </button>
          ) : (
            <button 
              onClick={handleExportProducts}
              className="bg-krav-card border border-krav-border text-krav-text hover:bg-black/5 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
               <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar Estoque (CSV)</span>
            </button>
          )}

          {activeTab === 'PRODUCTS' && (
            <button 
              onClick={() => handleOpenForm()}
              className="bg-krav-accent hover:bg-krav-accent-light text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors justify-center shadow-sm"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Cadastrar Produto</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="bg-krav-card border border-krav-border rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-krav-border p-2 shrink-0 bg-black/[0.02]">
            <button 
              onClick={() => { setActiveTab('ORDERS'); setOrdersPage(1); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                activeTab === 'ORDERS' ? 'bg-krav-card text-krav-accent shadow-sm border border-krav-border' : 'text-krav-muted hover:text-krav-text hover:bg-black/5'
              }`}
            >
              <Package className="w-4 h-4" /> Gestão de Pedidos
            </button>
            <button 
              onClick={() => { setActiveTab('PRODUCTS'); setProductsPage(1); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                activeTab === 'PRODUCTS' ? 'bg-krav-card text-krav-accent shadow-sm border border-krav-border' : 'text-krav-muted hover:text-krav-text hover:bg-black/5'
              }`}
            >
              <Box className="w-4 h-4" /> Diretório de Produtos
            </button>
          </div>

          {/* --- ORDERS VIEW --- */}
          {activeTab === 'ORDERS' && (
             <div className="flex flex-col h-full overflow-hidden">
               <div className="flex-1 overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[600px]">
                   <thead className="bg-krav-card sticky top-0 border-b border-krav-border z-10">
                     <tr>
                       <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6">Pedido ID</th>
                       <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6">Aluno</th>
                       <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6">Itens</th>
                       <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6">Total</th>
                       <th className="font-semibold text-xs text-krav-muted uppercase tracking-wider py-3 px-6">Status / Ação</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-krav-border">
                      {paginatedOrders.map(order => (
                        <tr key={order.id} className="hover:bg-black/[0.02] transition-colors">
                          <td className="py-4 px-6 font-mono text-xs text-krav-muted">#{order.id.toUpperCase()}</td>
                          <td className="py-4 px-6 text-sm font-medium text-krav-text">
                             <div className="flex items-center gap-3">
                               {order.studentName}
                               <ContactActions phone={order.studentPhone} email={order.studentEmail} iconOnly={true} />
                             </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-krav-text">
                            {order.items.reduce((acc, curr) => acc + curr.quantity, 0)} itens
                          </td>
                          <td className="py-4 px-6 text-sm font-bold text-krav-text">
                            R$ {order.total.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-4 px-6 flex items-center">
                            {order.status === 'PENDING' && (
                              <button onClick={() => updateOrderStatus(order.id, 'PROCESSING')} className="bg-krav-warning/10 text-krav-warning hover:bg-krav-warning hover:text-white border border-krav-warning/20 px-3 py-1.5 rounded text-xs font-bold transition-colors inline-flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5" /> Preparar Pedido
                              </button>
                            )}
                            {order.status === 'PROCESSING' && (
                              <button onClick={() => updateOrderStatus(order.id, 'READY')} className="bg-krav-accent/10 text-krav-accent hover:bg-krav-accent hover:text-white border border-krav-accent/20 px-3 py-1.5 rounded text-xs font-bold transition-colors inline-flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" /> Marcar como Pronto
                              </button>
                            )}
                            {order.status === 'READY' && (
                              <button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className="bg-krav-success border border-krav-success text-white hover:bg-krav-success/90 px-3 py-1.5 rounded text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm">
                                <Check className="w-3.5 h-3.5 block" /> Entregar
                              </button>
                            )}
                            {order.status === 'DELIVERED' && (
                              <span className="text-xs font-bold text-krav-success bg-krav-success/10 px-3 py-1.5 rounded inline-flex tracking-wider">ENTREGUE</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {paginatedOrders.length === 0 && (
                        <tr><td colSpan={5} className="py-12 text-center text-sm text-krav-muted">Nenhum pedido encontrado.</td></tr>
                      )}
                   </tbody>
                 </table>
               </div>
               
               <Pagination currentPage={ordersPage} totalPages={ordersTotalPages} onPageChange={setOrdersPage} />
             </div>
          )}

          {/* --- PRODUCTS DIRECTORY VIEW --- */}
          {activeTab === 'PRODUCTS' && (
            <div className="flex flex-col h-full bg-krav-bg">
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map(p => (
                    <div key={p.id} onClick={() => handleOpenForm(p)} className="cursor-pointer border border-krav-border rounded-lg p-4 bg-krav-card hover:border-krav-accent hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
                      <div className="w-full h-32 bg-krav-bg rounded mb-4 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-krav-border" />
                      </div>
                      <h3 className="font-semibold text-krav-text text-sm truncate group-hover:text-krav-accent transition-colors pr-8">{p.name}</h3>
                      <p className="text-xs text-krav-muted mt-1 flex-1 line-clamp-2">{p.description}</p>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-krav-border">
                        <span className="font-bold text-krav-accent">R$ {p.price.toFixed(2).replace('.', ',')}</span>
                        <span className="text-[10px] text-krav-muted font-semibold uppercase tracking-wider bg-krav-bg px-2 py-1 rounded border border-krav-border">
                          Est: {p.stock}
                        </span>
                      </div>
                      
                      {/* Hover actions */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteProduct(p.id); }} 
                        className="absolute right-2 top-2 p-1.5 bg-krav-card border border-transparent rounded hover:bg-krav-danger/10 hover:text-krav-danger hover:border-krav-danger/20 opacity-0 group-hover:opacity-100 transition-all text-krav-muted"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {paginatedProducts.length === 0 && (
                     <div className="col-span-full py-12 text-center text-sm text-krav-muted">Nenhum produto cadastrado.</div>
                  )}
                </div>
              </div>
              
              <Pagination currentPage={productsPage} totalPages={productsTotalPages} onPageChange={setProductsPage} />
            </div>
          )}
        </div>

        {/* --- PRODUCT EDIT / CREATE SLIDE OVEr --- */}
        {activeTab === 'PRODUCTS' && isFormOpen && (
          <div className="flex-1 max-w-sm w-full shrink-0 flex flex-col bg-krav-card border border-krav-border rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] xl:shadow-sm overflow-hidden h-full z-20 xl:z-auto fixed right-0 top-0 xl:relative xl:right-auto animate-in slide-in-from-right xl:slide-in-from-right-none duration-300">
             <div className="p-5 border-b border-krav-border bg-black/5 flex justify-between items-center shrink-0">
               <h3 className="font-bold flex items-center gap-2 text-krav-text">
                 <Box className="w-5 h-5 text-krav-accent" />
                 {editingId ? 'Editar Produto' : 'Novo Produto'}
               </h3>
               <button onClick={() => setIsFormOpen(false)} className="text-krav-muted hover:text-krav-danger p-1">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <form onSubmit={handleSaveProduct} className="p-5 flex-1 overflow-y-auto flex flex-col gap-5 bg-krav-bg">
                <div>
                  <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Nome do Produto</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-krav-card text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Preço (R$)</label>
                    <input type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="w-full bg-krav-card text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none font-medium" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Estoque Base</label>
                    <input type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} className="w-full bg-krav-card text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none font-medium" required />
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-krav-text mb-1.5 uppercase tracking-wider">Descrição</label>
                   <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-krav-card text-sm border border-krav-border focus:border-krav-accent p-2.5 rounded-lg transition-colors outline-none resize-none" required />
                </div>

                <div className="mt-auto pt-6 pb-20 xl:pb-0">
                  <button type="submit" className="w-full bg-krav-accent text-white font-bold py-3.5 text-sm rounded-xl hover:bg-krav-accent-light transition-colors flex items-center justify-center gap-2 shadow-md">
                    <Save className="w-4 h-4" /> {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
                  </button>
                </div>
             </form>
          </div>
        )}
      </div>
    </div>
  );
}
