import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../lib/api';
import { v4 as uuidv4 } from 'uuid';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black mb-2" style={{ color: '#171717' }}>Your cart is empty</h2>
        <Link to="/products" className="btn-brutal btn-primary mt-4 inline-flex" style={{ backgroundColor: '#FDE047', borderColor: '#171717', borderWidth: '2px', boxShadow: '3px 3px 0 #171717', color: '#171717' }}>
          Browse Products
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);
    try {
      const idempotencyKey = uuidv4();
      const res = await api.createOrder(idempotencyKey);
      if (res.success && res.data) {
        await refreshCart();
        navigate(`/order-success/${res.data.order._id}`);
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Failed to place order');
      } else {
        setError('Failed to place order. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm font-bold mb-6 hover:underline" style={{ color: '#171717' }}>
        <ArrowLeft size={16} /> Back to Cart
      </button>

      <h1 className="text-3xl font-black mb-6" style={{ color: '#171717' }}>
        <ShieldCheck size={28} className="inline mr-2" style={{ color: '#22C55E' }} />
        Checkout
      </h1>

      {/* Order summary */}
      <div className="border-3 p-6 mb-6" style={{ borderWidth: '3px', borderColor: '#171717', backgroundColor: '#fff', boxShadow: '6px 6px 0 #171717' }}>
        <h3 className="font-black text-lg mb-4" style={{ color: '#171717' }}>Order Summary</h3>

        <div className="space-y-3 mb-4">
          {cart.items.map((item) => (
            <div key={item._id} className="flex justify-between items-center text-sm">
              <div className="flex-1 min-w-0">
                <span className="font-bold truncate block" style={{ color: '#171717' }}>{item.product.name}</span>
                <span style={{ color: '#9CA3AF' }}>{item.product.packageSize} × {item.quantity}</span>
              </div>
              <span className="font-bold ml-4" style={{ color: '#171717' }}>₹{item.lineTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t-2 pt-4 mt-4" style={{ borderTopColor: '#E5E5E5' }}>
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: '#9CA3AF' }}>Subtotal</span>
            <span className="font-bold" style={{ color: '#171717' }}>₹{cart.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: '#9CA3AF' }}>Delivery</span>
            <span className="font-bold" style={{ color: '#22C55E' }}>FREE</span>
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t-2" style={{ borderTopColor: '#E5E5E5' }}>
            <span className="font-black text-xl" style={{ color: '#171717' }}>Total</span>
            <span className="font-black text-xl" style={{ color: '#171717' }}>₹{cart.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment simulation notice */}
      <div className="border-2 p-4 mb-6 flex items-start gap-3" style={{ borderColor: '#FDE047', backgroundColor: '#FFFBEB' }}>
        <ShieldCheck size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#EAB308' }} />
        <div>
          <p className="font-bold text-sm" style={{ color: '#171717' }}>Simulated Checkout</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>This is a demo — no real payment will be processed. Your order will be created immediately.</p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm font-bold border-2 mb-4" style={{ backgroundColor: '#FEE2E2', borderColor: '#EF4444', color: '#EF4444' }}>
          {error}
        </div>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="btn-brutal btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
        style={{ backgroundColor: '#FDE047', borderColor: '#171717', borderWidth: '3px', boxShadow: '6px 6px 0 #171717', color: '#171717' }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="loader-brutal" style={{ width: '1.25rem', height: '1.25rem', borderWidth: '2px' }} />
            Placing Order...
          </span>
        ) : (
          'Place Order — ₹' + cart.total.toFixed(2)
        )}
      </button>
    </div>
  );
}
