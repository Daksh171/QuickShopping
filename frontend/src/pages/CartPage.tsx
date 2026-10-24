import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CartPage() {
  const { user } = useAuth();
  const { cart, loading, updateItem, removeItem } = useCart();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto mb-4" style={{ color: '#E5E5E5' }} />
        <h2 className="text-2xl font-black mb-2" style={{ color: '#171717' }}>Login to view your cart</h2>
        <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>Please login to add items and manage your cart</p>
        <Link to="/login" className="btn-brutal btn-primary inline-flex" style={{ backgroundColor: '#FDE047', borderColor: '#171717', borderWidth: '3px', boxShadow: '4px 4px 0 #171717', color: '#171717' }}>
          Login
        </Link>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Loading your cart..." />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto mb-4" style={{ color: '#E5E5E5' }} />
        <h2 className="text-2xl font-black mb-2" style={{ color: '#171717' }}>Your cart is empty</h2>
        <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>Browse our products and add something delicious!</p>
        <Link to="/products" className="btn-brutal btn-primary inline-flex" style={{ backgroundColor: '#FDE047', borderColor: '#171717', borderWidth: '3px', boxShadow: '4px 4px 0 #171717', color: '#171717' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  const handleUpdate = async (itemId: string, quantity: number) => {
    setActionLoading(itemId);
    try {
      if (quantity < 1) await removeItem(itemId);
      else await updateItem(itemId, quantity);
    } catch {}
    setActionLoading(null);
  };

  const handleRemove = async (itemId: string) => {
    setActionLoading(itemId);
    try { await removeItem(itemId); } catch {}
    setActionLoading(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-6" style={{ color: '#171717' }}>
        <ShoppingBag size={28} className="inline mr-2" />
        Your Cart ({cart.itemCount} items)
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item._id}
              className="flex gap-4 p-4 border-3"
              style={{ borderWidth: '3px', borderColor: '#171717', backgroundColor: '#fff', boxShadow: '4px 4px 0 #171717' }}
            >
              {/* Image */}
              <div className="w-20 h-20 flex-shrink-0 border-2 flex items-center justify-center text-3xl" style={{ borderColor: '#171717', backgroundColor: '#FAFAF5' }}>
                🛒
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product.slug}`} className="font-bold text-sm hover:underline block truncate" style={{ color: '#171717' }}>
                  {item.product.name}
                </Link>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{item.product.packageSize}</p>
                <p className="font-black mt-1" style={{ color: '#171717' }}>₹{item.product.price}</p>
              </div>

              {/* Quantity + Remove */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center border-2 font-bold text-sm" style={{ borderColor: '#171717', backgroundColor: '#FDE047' }}>
                  <button
                    onClick={() => handleUpdate(item._id, item.quantity - 1)}
                    disabled={actionLoading === item._id}
                    className="px-2 py-1 hover:bg-yellow-300 disabled:opacity-50"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-2 py-1 border-x-2 min-w-[28px] text-center" style={{ borderColor: '#171717' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdate(item._id, item.quantity + 1)}
                    disabled={actionLoading === item._id}
                    className="px-2 py-1 hover:bg-yellow-300 disabled:opacity-50"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black" style={{ color: '#171717' }}>₹{item.lineTotal.toFixed(2)}</span>
                  <button
                    onClick={() => handleRemove(item._id)}
                    disabled={actionLoading === item._id}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="border-3 p-6 sticky top-20" style={{ borderWidth: '3px', borderColor: '#171717', backgroundColor: '#fff', boxShadow: '6px 6px 0 #171717' }}>
            <h3 className="text-lg font-black mb-4" style={{ color: '#171717' }}>Order Summary</h3>

            <div className="space-y-2 mb-4 pb-4 border-b-2" style={{ borderBottomColor: '#E5E5E5' }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#9CA3AF' }}>Items ({cart.itemCount})</span>
                <span className="font-bold" style={{ color: '#171717' }}>₹{cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#9CA3AF' }}>Delivery</span>
                <span className="font-bold" style={{ color: '#22C55E' }}>FREE</span>
              </div>
            </div>

            <div className="flex justify-between mb-6">
              <span className="font-black text-lg" style={{ color: '#171717' }}>Total</span>
              <span className="font-black text-lg" style={{ color: '#171717' }}>₹{cart.total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-brutal btn-primary w-full flex items-center justify-center gap-2 text-base py-3"
              style={{ backgroundColor: '#FDE047', borderColor: '#171717', borderWidth: '3px', boxShadow: '4px 4px 0 #171717', color: '#171717' }}
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
