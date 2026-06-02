'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowLeft, 
  Plus, 
  Minus, 
  ShieldCheck, 
  ShoppingCart,
  Loader2,
  Package
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const router = useRouter();

  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const res = await fetch('/api/v1/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 404) {
        setCartItems([]);
        return;
      }

      const result = await res.json();
      if (res.ok) {
        setCartItems(result.data || []);
      } else {
        toast.error(result.mensagens?.[0] || 'Erro ao carregar carrinho');
      }
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
      toast.error('Erro de conexão ao carregar carrinho');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      const result = await res.json();
      if (res.ok) {
        // Atualização otimista
        setCartItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ));
      } else {
        toast.error(result.mensagens?.[0] || 'Erro ao atualizar quantidade');
      }
    } catch (error) {
      toast.error('Erro ao atualizar quantidade');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        toast.success('Item removido');
      } else {
        const result = await res.json();
        toast.error(result.mensagens?.[0] || 'Erro ao remover item');
      }
    } catch (error) {
      toast.error('Erro ao remover item');
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      const token = localStorage.getItem('token');
      
      // Buscar transportadora disponível
      const shippersRes = await fetch('/api/v1/shippers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const shippersData = await shippersRes.json();
      const shipperId = shippersData.data?.[0]?.id || 1;

      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          shipper_id: shipperId,
          // Facilitando para testes locais: se não houver shipperId, a API cuidará do padrão
        })
      });

      const result = await res.json();
      if (res.ok) {
        toast.success('Pedido finalizado com sucesso!', {
          autoClose: 5000,
          icon: '🎉',
        });
        setCartItems([]);
        // Redirecionar após sucesso opcionalmente
      } else {
        toast.error(result.mensagens?.[0] || 'Erro ao finalizar pedido');
      }
    } catch (error) {
      toast.error('Erro ao finalizar pedido');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.products.price * item.quantity), 0);
  const shipping = subtotal > 200 ? 0 : 25;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white p-6">
        <Loader2 className="w-12 h-12 text-[#10b981] animate-spin mb-4" />
        <p className="text-slate-400 font-medium animate-pulse">Carregando seu carrinho premium...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-6">
        <div className="max-w-7xl mx-auto py-12">
          <header className="mb-12 flex justify-between items-center">
            <h1 className="text-4xl font-bold tracking-tight">Seu Carrinho</h1>
            <button 
              onClick={() => router.push('/products')}
              className="flex items-center gap-2 text-[#10b981] hover:bg-[#10b981]/10 px-4 py-2 rounded-xl transition font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para Produtos
            </button>
          </header>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center shadow-2xl">
            <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-slate-500" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Carrinho Vazio</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8 text-lg">
              Parece que o seu carrinho de compras ainda não tem itens. Explore nossa vitrine e descubra produtos incríveis!
            </p>
            <button 
              onClick={() => router.push('/products')}
              className="bg-[#10b981] hover:bg-[#059669] text-white px-10 py-4 rounded-2xl font-bold text-lg transition transform hover:scale-105 shadow-xl shadow-emerald-900/20"
            >
              Começar a Compras
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-[#10b981]/30">
      {/* Dekorasyonlar */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10b981]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#10b981]/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-2">Seu Carrinho</h1>
            <p className="text-slate-400 text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-[#10b981] rounded-full"></span>
              {cartItems.length} {cartItems.length === 1 ? 'item selecionado' : 'itens selecionados'}
            </p>
          </div>
          <button 
            onClick={() => router.push('/products')}
            className="flex items-center gap-2 text-[#10b981] hover:bg-[#10b981]/10 px-6 py-3 rounded-2xl transition font-bold border border-[#10b981]/20 backdrop-blur-sm self-start"
          >
            <ArrowLeft className="w-5 h-5" />
            Continuar Compras
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Lista de Itens */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <div 
                key={item.product_id}
                className="group bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 transition hover:bg-slate-800/60 hover:border-[#10b981]/30 hover:-translate-y-1 shadow-lg"
              >
                {/* Imagem Placeholder Premium */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-700/50 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-600/20 to-transparent"></div>
                  <Package className="w-10 h-10 text-slate-500 group-hover:scale-110 transition duration-500" />
                </div>

                <div className="flex-grow text-center sm:text-left">
                  <span className="text-[10px] font-bold tracking-widest text-[#10b981] uppercase bg-[#10b981]/10 px-2 py-0.5 rounded mb-2 inline-block">
                    SKU: {item.products.sku || 'N/A'}
                  </span>
                  <h3 className="text-xl font-bold mb-1 group-hover:text-[#10b981] transition">{item.products.name}</h3>
                  <p className="text-slate-400 text-sm mb-3">Estoque disponível: {item.products.stock_quantity}</p>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                    <div className="flex bg-slate-900/60 p-1.5 rounded-xl items-center gap-3 border border-white/5">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        data-testid={`decrement-qty-${item.id}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span 
                        data-testid={`quantity-val-${item.id}`}
                        className="w-8 text-center font-bold text-lg"
                      >
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        data-testid={`increment-qty-${item.id}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.id)}
                      data-testid={`remove-item-${item.id}`}
                      className="text-red-400/50 hover:text-red-400 p-2 rounded-xl hover:bg-red-400/10 transition"
                      title="Remover item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="text-center sm:text-right min-w-[120px]">
                  <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Preço Total</p>
                  <p className="text-2xl font-black text-white">
                    R$ {(item.products.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-slate-500 text-[10px] mt-1">R$ {parseFloat(item.products.price).toFixed(2)} / un</p>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-8">
            <div className="bg-slate-800/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
              
              <h2 className="text-2xl font-bold mb-8 border-b border-white/5 pb-4">Resumo</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Subtotal</span>
                  <span className="text-white">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Frete</span>
                  <span className={shipping === 0 ? 'text-[#10b981] font-bold' : 'text-white'}>
                    {shipping === 0 ? 'GRÁTIS' : `R$ ${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-[#10b981] bg-[#10b981]/5 p-3 rounded-xl border border-[#10b981]/10">
                    💡 Adicione mais <strong>R$ {(200 - subtotal).toFixed(2)}</strong> para ganhar <strong>frete grátis</strong>!
                  </p>
                )}
              </div>
              
              <div className="pt-6 border-t border-white/10 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total do Pedido</span>
                  <span className="text-4xl font-black text-white tabular-nums">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={checkoutLoading}
                data-testid="checkout-button"
                className="w-full bg-[#10b981] hover:bg-[#059669] disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black text-xl transition transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    Finalizar Pedido
                    <ShoppingCart className="w-6 h-6" />
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                Pagamento processado em ambiente seguro
              </div>
            </div>

            {/* Seller Info Placeholder */}
            <div className="mt-6 bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#10b981]/10 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-[#10b981]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200 uppercase">Transportadora</p>
                <p className="text-sm text-slate-400">Entrega Express (Shipper ID: 1)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
