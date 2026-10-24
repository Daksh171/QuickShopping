import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, ArrowLeft, Package } from 'lucide-react';
import type { Product } from '../types';
import * as api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { addToCart, updateItem, removeItem, getItemForProduct } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getProductBySlug(slug)
      .then((res) => {
        if (res.data) setProduct(res.data.product);
        else setError('Product not found');
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner text="Loading product..." />;
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Package size={64} className="mx-auto mb-4" style={{ color: '#E5E5E5' }} />
        <h2 className="text-2xl font-black mb-2" style={{ color: '#171717' }}>{error || 'Product not found'}</h2>
        <Link to="/products" className="btn-brutal btn-primary mt-4 inline-flex" style={{ backgroundColor: '#FDE047', borderColor: '#171717', borderWidth: '2px', boxShadow: '3px 3px 0 #171717', color: '#171717' }}>
          Browse Products
        </Link>
      </div>
    );
  }

  const cartItem = getItemForProduct(product._id);
  const categoryObj = typeof product.category === 'object' ? product.category : null;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = async () => {
    if (!user) { navigate('/login'); return; }
    setActionLoading(true);
    try { await addToCart(product._id, 1); } catch {}
    setActionLoading(false);
  };

  const handleIncrement = async () => {
    if (!cartItem) return;
    setActionLoading(true);
    try { await updateItem(cartItem._id, cartItem.quantity + 1); } catch {}
    setActionLoading(false);
  };

  const handleDecrement = async () => {
    if (!cartItem) return;
    setActionLoading(true);
    try {
      if (cartItem.quantity <= 1) await removeItem(cartItem._id);
      else await updateItem(cartItem._id, cartItem.quantity - 1);
    } catch {}
    setActionLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link to="/" className="hover:underline font-semibold" style={{ color: '#9CA3AF' }}>Home</Link>
        <span style={{ color: '#9CA3AF' }}>/</span>
        <Link to="/products" className="hover:underline font-semibold" style={{ color: '#9CA3AF' }}>Products</Link>
        {categoryObj && (
          <>
            <span style={{ color: '#9CA3AF' }}>/</span>
            <Link to={`/products?category=${categoryObj.slug}`} className="hover:underline font-semibold" style={{ color: '#9CA3AF' }}>
              {categoryObj.name}
            </Link>
          </>
        )}
        <span style={{ color: '#9CA3AF' }}>/</span>
        <span className="font-bold" style={{ color: '#171717' }}>{product.name}</span>
      </div>

      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm font-bold mb-6 hover:underline" style={{ color: '#171717' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="border-3 p-8 flex items-center justify-center" style={{ borderWidth: '3px', borderColor: '#171717', backgroundColor: '#fff', boxShadow: '6px 6px 0 #171717' }}>
          <div className="text-9xl">🛒</div>
        </div>

        {/* Details */}
        <div>
          {categoryObj && (
            <Link
              to={`/products?category=${categoryObj.slug}`}
              className="badge-brutal mb-3 inline-block"
              style={{ borderColor: '#171717', borderWidth: '2px', backgroundColor: '#FDE047', color: '#171717' }}
            >
              {categoryObj.name}
            </Link>
          )}

          <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: '#171717' }}>{product.name}</h1>
          <p className="text-sm font-semibold mb-4" style={{ color: '#9CA3AF' }}>{product.packageSize}</p>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-black" style={{ color: '#171717' }}>₹{product.price}</span>
            {product.originalPrice && (
              <>
                <span className="text-xl line-through" style={{ color: '#9CA3AF' }}>₹{product.originalPrice}</span>
                <span className="badge-brutal" style={{ backgroundColor: '#22C55E', color: '#fff', borderColor: '#22C55E', borderWidth: '2px' }}>
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: '#555' }}>{product.description}</p>

          <div className="flex items-center gap-2 mb-6">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: product.stock > 0 ? '#22C55E' : '#EF4444' }}
            />
            <span className="text-sm font-bold" style={{ color: product.stock > 0 ? '#22C55E' : '#EF4444' }}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Cart actions */}
          {cartItem ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center border-3 font-bold text-lg" style={{ borderWidth: '3px', borderColor: '#171717', backgroundColor: '#FDE047' }}>
                <button onClick={handleDecrement} disabled={actionLoading} className="px-4 py-3 hover:bg-yellow-300 disabled:opacity-50" aria-label="Decrease">
                  <Minus size={18} />
                </button>
                <span className="px-4 py-3 border-x-3 min-w-[56px] text-center" style={{ borderColor: '#171717' }}>
                  {cartItem.quantity}
                </span>
                <button onClick={handleIncrement} disabled={actionLoading} className="px-4 py-3 hover:bg-yellow-300 disabled:opacity-50" aria-label="Increase">
                  <Plus size={18} />
                </button>
              </div>
              <span className="text-sm font-bold" style={{ color: '#9CA3AF' }}>
                Subtotal: <strong style={{ color: '#171717' }}>₹{(product.price * cartItem.quantity).toFixed(2)}</strong>
              </span>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={actionLoading || product.stock === 0}
              className="btn-brutal btn-primary flex items-center gap-2 text-base px-8 py-3"
              style={{ backgroundColor: product.stock === 0 ? '#E5E5E5' : '#FDE047', borderColor: '#171717', borderWidth: '3px', boxShadow: '4px 4px 0 #171717', color: '#171717' }}
            >
              <ShoppingCart size={20} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
