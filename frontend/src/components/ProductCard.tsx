import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { addToCart, updateItem, removeItem, getItemForProduct } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const cartItem = getItemForProduct(product._id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await addToCart(product._id, 1);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
    setLoading(false);
  };

  const handleIncrement = async () => {
    if (!cartItem) return;
    setLoading(true);
    try {
      await updateItem(cartItem._id, cartItem.quantity + 1);
    } catch (err) {
      console.error('Failed to update cart:', err);
    }
    setLoading(false);
  };

  const handleDecrement = async () => {
    if (!cartItem) return;
    setLoading(true);
    try {
      if (cartItem.quantity <= 1) {
        await removeItem(cartItem._id);
      } else {
        await updateItem(cartItem._id, cartItem.quantity - 1);
      }
    } catch (err) {
      console.error('Failed to update cart:', err);
    }
    setLoading(false);
  };

  const categoryObj = typeof product.category === 'object' ? product.category : null;

  return (
    <div className="card-brutal flex flex-col h-full" style={{ backgroundColor: '#fff', borderWidth: '3px', borderColor: '#171717', boxShadow: '4px 4px 0 #171717' }}>
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block relative">
        <div className="aspect-square bg-gray-50 flex items-center justify-center p-4 overflow-hidden" style={{ backgroundColor: '#FAFAF5' }}>
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🛒
          </div>
        </div>
        {discount > 0 && (
          <span
            className="absolute top-2 left-2 px-2 py-0.5 text-xs font-black text-white"
            style={{ backgroundColor: '#22C55E' }}
          >
            {discount}% OFF
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 border-t-2" style={{ borderTopColor: '#171717' }}>
        {categoryObj && (
          <Link
            to={`/products?category=${categoryObj.slug}`}
            className="text-xs font-bold uppercase tracking-wider mb-1 hover:underline"
            style={{ color: '#9CA3AF' }}
          >
            {categoryObj.name}
          </Link>
        )}
        <Link to={`/product/${product.slug}`} className="font-bold text-sm leading-tight mb-1 hover:underline" style={{ color: '#171717' }}>
          {product.name}
        </Link>
        <p className="text-xs mb-2" style={{ color: '#9CA3AF' }}>{product.packageSize}</p>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <span className="font-black text-lg" style={{ color: '#171717' }}>₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs line-through ml-1" style={{ color: '#9CA3AF' }}>₹{product.originalPrice}</span>
            )}
          </div>

          {/* Add / Qty controls */}
          {cartItem ? (
            <div
              className="flex items-center border-2 font-bold"
              style={{ borderColor: '#171717', backgroundColor: '#FDE047' }}
            >
              <button
                onClick={handleDecrement}
                disabled={loading}
                className="px-2 py-1 hover:bg-yellow-300 transition-colors disabled:opacity-50"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="px-2 py-1 text-sm min-w-[28px] text-center border-x-2" style={{ borderColor: '#171717' }}>
                {cartItem.quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={loading}
                className="px-2 py-1 hover:bg-yellow-300 transition-colors disabled:opacity-50"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={loading || product.stock === 0}
              className="btn-brutal btn-primary text-xs px-3 py-1.5"
              style={{
                backgroundColor: product.stock === 0 ? '#E5E5E5' : '#FDE047',
                borderColor: '#171717',
                borderWidth: '2px',
                boxShadow: '2px 2px 0 #171717',
                color: '#171717',
              }}
              aria-label={`Add ${product.name} to cart`}
            >
              {product.stock === 0 ? 'Out of Stock' : (
                <>
                  <ShoppingCart size={14} />
                  ADD
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
