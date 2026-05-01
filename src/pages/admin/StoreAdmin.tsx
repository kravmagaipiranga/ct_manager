import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ShoppingBag, Box, Package, Check, Plus, Edit, Trash2, X, Save, Download } from 'lucide-react';
import { ContactActions } from '../../components/shared/ContactActions';
import { OrderStatus, Product } from '../../types';
import { Pagination } from '../../components/shared/Pagination';
import { exportToCSV } from '../../lib/csv';
import { toast } from 'sonner';

export default function StoreAdmin() {
  const user = useAuthStore((state) => state.user);
  const allProducts = useDataStore((state) => state.products);
  const allOrdersStore = useDataStore((state) => state.orders);
  
  const products = React.useMemo(() => allProducts.filter(p => p.academyId === user?.academyId || !p.academyId), [allProducts, user]);
  const allOrders = React.useMemo(() => allOrdersStore.filter(o => o.academyId === user?.academyId || !o.academyId), [allOrdersStore, user]);
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

  const navigate = useNavigate();

  const handleOpenForm = (product?: Product) => {
    if (product) {
       navigate(`/admin/store/${product.id}`);
    } else {
       navigate('/admin/store/new');
    }
  };

  const handleUpdateOrderStatus = (id: string, newStatus: OrderStatus) => {
    updateOrderStatus(id, newStatus);
    toast.success('Status do pedido atualizado!');
  };

  return (
    <div className="p-6 md:p-8 flex flex-col bg-krav-bg">
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

      <div className="flex gap-6 mb-8">
        <div className="bg-krav-card border border-krav-border rounded-xl flex-1 flex flex-col shadow-sm">
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
             <div className="flex flex-col">
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
                            <ul className="list-disc pl-4 text-xs space-y-1">
                               {order.items.map((i, idx) => {
                                  const prod = products.find(p => p.id === i.productId);
                                  return (
                                     <li key={idx}>
                                        {i.quantity}x {prod?.name || 'Produto Removido'}
                                        {i.variation && <span className="font-bold text-krav-accent ml-1">({i.variation})</span>}
                                     </li>
                                  )
                               })}
                            </ul>
                          </td>
                          <td className="py-4 px-6 text-sm font-bold text-krav-text">
                            R$ {order.total.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-4 px-6 flex items-center">
                            {order.status === 'PENDING' && (
                              <button onClick={() => handleUpdateOrderStatus(order.id, 'PROCESSING')} className="bg-krav-warning/10 text-krav-warning hover:bg-krav-warning hover:text-white border border-krav-warning/20 px-3 py-1.5 rounded text-xs font-bold transition-colors inline-flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5" /> Preparar Pedido
                              </button>
                            )}
                            {order.status === 'PROCESSING' && (
                              <button onClick={() => handleUpdateOrderStatus(order.id, 'READY')} className="bg-krav-accent/10 text-krav-accent hover:bg-krav-accent hover:text-white border border-krav-accent/20 px-3 py-1.5 rounded text-xs font-bold transition-colors inline-flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" /> Marcar como Pronto
                              </button>
                            )}
                            {order.status === 'READY' && (
                              <button onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')} className="bg-krav-success border border-krav-success text-white hover:bg-krav-success/90 px-3 py-1.5 rounded text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm">
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
            <div className="flex flex-col bg-krav-bg">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map(p => (
                    <div key={p.id} onClick={() => handleOpenForm(p)} className="cursor-pointer border border-krav-border rounded-lg p-4 bg-krav-card hover:border-krav-accent hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
                      <div className="w-full h-32 bg-krav-bg rounded mb-4 flex items-center justify-center overflow-hidden">
                        {p.imageUrl ? (
                           <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                           <ShoppingBag className="w-8 h-8 text-krav-border" />
                        )}
                      </div>
                      <h3 className="font-semibold text-krav-text text-sm truncate group-hover:text-krav-accent transition-colors pr-8 mb-2 flex-1">{p.name}</h3>
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-krav-border">
                        <span className="font-bold text-krav-accent">R$ {p.price.toFixed(2).replace('.', ',')}</span>
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
      </div>
    </div>
  );
}
