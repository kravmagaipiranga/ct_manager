import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { ShoppingCart, ShoppingBag, Plus, Minus, CreditCard, PackageCheck, Search, Tag, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function StudentStore() {
  const user = useAuthStore((state) => state.user);
  const products = useDataStore((state) => state.products).filter(p => p.stock > 0);
  const placeOrder = useDataStore((state) => state.placeOrder);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [cart, setCart] = useState<{productId: string, quantity: number}[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId, quantity: 1 }];
    });
    setOrderSuccess(false);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0));
  };

  const handleCheckout = () => {
    if (!user || cart.length === 0) return;
    setIsOrdering(true);
    
    // Simulate API delay
    setTimeout(() => {
      placeOrder(user.id, cart);
      setCart([]);
      setIsOrdering(false);
      setOrderSuccess(true);
      
      setTimeout(() => setOrderSuccess(false), 3000);
    }, 1000);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalCartItems = cart.reduce((a,b)=>a+b.quantity,0);

  return (
    <div className="p-5 md:p-8 flex flex-col h-full bg-krav-bg">
      <div className="flex justify-between items-start mb-6 shrink-0 relative">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-krav-text">Loja Oficial</h1>
          <p className="text-sm text-krav-muted mt-1">Uniformes, equipamentos e acessórios.</p>
        </div>
      </div>

      <div className="w-full">
         <div className="relative mb-6">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-krav-muted" />
            <input 
              type="text" 
              placeholder="Buscar produtos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-krav-card text-krav-text border border-krav-border rounded-xl pl-10 pr-4 py-3 text-sm shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-24">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-krav-card border text-krav-text border-krav-border rounded-xl p-5 flex flex-col hover:border-krav-accent/50 transition-colors shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-krav-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 bg-krav-bg rounded-lg flex items-center justify-center mb-4 border border-krav-border">
                  <Tag className="w-6 h-6 text-krav-muted" />
                </div>
                <h4 className="font-bold text-sm leading-tight">{p.name}</h4>
                <p className="text-xs text-krav-muted mt-1 leading-relaxed flex-1">{p.description}</p>
                <div className="flex justify-between items-end mt-4 pt-4 border-t border-krav-border">
                  <div>
                    <span className="text-xs text-krav-muted block">Preço</span>
                    <span className="font-bold text-lg text-krav-accent">R$ {p.price.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <button 
                    onClick={() => addToCart(p.id)}
                    className="bg-krav-text hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-transform active:scale-95"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* Floating Cart Button */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-20 right-5 md:bottom-8 md:right-8 w-14 h-14 bg-krav-accent text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:bg-krav-accent-light transition-transform hover:scale-105 z-40 block"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalCartItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-krav-danger text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-krav-bg">
            {totalCartItems}
          </span>
        )}
      </button>

      {/* Cart Modal / Sidebar Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="w-full max-w-sm h-full bg-krav-bg flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
             <div className="p-5 border-b border-krav-border bg-krav-card shrink-0 flex items-center justify-between">
               <h3 className="font-bold flex items-center gap-2 text-krav-text">
                 <ShoppingCart className="w-5 h-5 text-krav-accent" />
                 Meu Carrinho {totalCartItems > 0 && <span className="bg-krav-accent text-white text-[10px] px-2 py-0.5 rounded-full">{totalCartItems}</span>}
               </h3>
               <button onClick={() => setIsCartOpen(false)} className="text-krav-muted hover:text-krav-danger p-1">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-5 bg-krav-bg">
               {orderSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-krav-success/10 text-krav-success rounded-full flex items-center justify-center mb-4">
                      <PackageCheck className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-krav-success">Pedido Realizado!</p>
                    <p className="text-xs text-krav-muted mt-2">Retire seus itens com o instrutor na próxima aula.</p>
                  </div>
               ) : cart.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                   <ShoppingCart className="w-10 h-10 text-krav-muted mb-3" />
                   <p className="text-sm font-medium text-krav-text">Seu carrinho está vazio.</p>
                   <p className="text-xs text-krav-muted mt-1">Adicione produtos para continuar.</p>
                 </div>
               ) : (
                 <div className="flex flex-col gap-4">
                   {cart.map(item => {
                     const product = products.find(p => p.id === item.productId)!;
                     return (
                       <div key={item.productId} className="flex justify-between items-center border-b border-krav-border pb-4 bg-krav-card p-3 rounded-lg border">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-krav-text leading-tight">{product.name}</p>
                            <p className="text-xs text-krav-accent font-semibold mt-1">R$ {(product.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-krav-bg rounded-lg border border-krav-border p-1">
                            <button onClick={() => removeFromCart(item.productId)} className="w-6 h-6 flex items-center justify-center text-krav-muted hover:text-krav-text"><Minus className="w-3 h-3" /></button>
                            <span className="text-xs font-bold w-4 text-center text-krav-text">{item.quantity}</span>
                            <button onClick={() => addToCart(item.productId)} className="w-6 h-6 flex items-center justify-center text-krav-muted hover:text-krav-text"><Plus className="w-3 h-3" /></button>
                          </div>
                       </div>
                     );
                   })}
                 </div>
               )}
             </div>

             {cart.length > 0 && !orderSuccess && (
               <div className="p-5 border-t border-krav-border bg-krav-card shrink-0">
                 <div className="flex justify-between font-bold text-lg mb-4 text-krav-text">
                   <span>Total:</span>
                   <span className="text-krav-accent">R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
                 </div>
                 <button 
                   onClick={handleCheckout}
                   disabled={isOrdering}
                   className="w-full bg-krav-accent hover:bg-krav-accent-light text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
                 >
                   {isOrdering ? (
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   ) : (
                     <>
                       <CreditCard className="w-4 h-4" />
                       Finalizar Pedido
                     </>
                   )}
                 </button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
