import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import type { Order } from '../types';
import * as api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getOrderById(id)
      .then((res) => {
        if (res.data) setOrder(res.data.order);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading order..." />;

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black mb-2" style={{ color: '#171717' }}>Order not found</h2>
        <Link to="/" className="btn-brutal btn-primary mt-4 inline-flex" style={{ backgroundColor: '#FDE047', borderColor: '#171717', borderWidth: '2px', boxShadow: '3px 3px 0 #171717', color: '#171717' }}>
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="border-3 p-8" style={{ borderWidth: '3px', borderColor: '#171717', backgroundColor: '#fff', boxShadow: '6px 6px 0 #171717' }}>
        <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center border-3 rounded-full" style={{ borderWidth: '3px', borderColor: '#22C55E', backgroundColor: '#F0FFF4' }}>
          <CheckCircle size={40} style={{ color: '#22C55E' }} />
        </div>

        <h1 className="text-3xl font-black mb-2" style={{ color: '#171717' }}>Order Placed!</h1>
        <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>Thank you for your order. Your groceries are on the way!</p>

        <div className="inline-block border-2 px-4 py-2 mb-6" style={{ borderColor: '#171717', backgroundColor: '#FDE047' }}>
          <span className="text-xs font-bold uppercase" style={{ color: '#171717' }}>Order #</span>
          <span className="font-black ml-1" style={{ color: '#171717' }}>{order.orderNumber}</span>
        </div>

        <div className="border-t-2 pt-4 mt-4 text-left space-y-2" style={{ borderTopColor: '#E5E5E5' }}>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>
                <span className="font-bold" style={{ color: '#171717' }}>{item.productNameSnapshot}</span>
                <span style={{ color: '#9CA3AF' }}> × {item.quantity}</span>
              </span>
              <span className="font-bold" style={{ color: '#171717' }}>₹{item.lineTotal.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-4 border-t-2 mt-4 text-lg" style={{ borderTopColor: '#E5E5E5' }}>
            <span className="font-black" style={{ color: '#171717' }}>Total</span>
            <span className="font-black" style={{ color: '#171717' }}>₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <Link to="/orders" className="btn-brutal btn-dark flex items-center justify-center gap-2" style={{ backgroundColor: '#171717', color: '#fff', borderColor: '#171717', borderWidth: '2px', boxShadow: '3px 3px 0 #171717' }}>
            <Package size={16} />
            View All Orders
          </Link>
          <Link to="/products" className="btn-brutal btn-primary flex items-center justify-center gap-2" style={{ backgroundColor: '#FDE047', borderColor: '#171717', borderWidth: '2px', boxShadow: '3px 3px 0 #171717', color: '#171717' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
