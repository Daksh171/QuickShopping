import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import type { Order } from '../types';
import * as api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api.getOrders()
      .then((res) => {
        if (res.data) setOrders(res.data.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <LoadingSpinner text="Loading your orders..." />;

  const statusColor: Record<string, string> = {
    PLACED: '#FDE047',
    CONFIRMED: '#22C55E',
    DELIVERED: '#22C55E',
    CANCELLED: '#EF4444',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-6" style={{ color: '#171717' }}>
        <Package size={28} className="inline mr-2" />
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto mb-4" style={{ color: '#E5E5E5' }} />
          <h3 className="text-xl font-black mb-2" style={{ color: '#171717' }}>No orders yet</h3>
          <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>Place your first order and it will show up here</p>
          <Link to="/products" className="btn-brutal btn-primary inline-flex" style={{ backgroundColor: '#FDE047', borderColor: '#171717', borderWidth: '2px', boxShadow: '3px 3px 0 #171717', color: '#171717' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/order-success/${order._id}`}
              className="block border-3 p-4 md:p-6 transition-all hover:shadow-[6px_6px_0_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5"
              style={{ borderWidth: '3px', borderColor: '#171717', backgroundColor: '#fff', boxShadow: '4px 4px 0 #171717' }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-black" style={{ color: '#171717' }}>#{order.orderNumber}</span>
                    <span
                      className="badge-brutal text-xs"
                      style={{ backgroundColor: statusColor[order.status] || '#E5E5E5', borderColor: '#171717', borderWidth: '2px', color: order.status === 'CANCELLED' ? '#fff' : '#171717' }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#555' }}>
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}: {order.items.map(i => i.productNameSnapshot).join(', ').substring(0, 60)}
                    {order.items.map(i => i.productNameSnapshot).join(', ').length > 60 ? '...' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-lg" style={{ color: '#171717' }}>₹{order.totalAmount.toFixed(2)}</span>
                  <ChevronRight size={20} style={{ color: '#9CA3AF' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
