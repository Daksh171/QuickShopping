import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Sparkles, TrendingUp } from 'lucide-react';
import type { Category, Product } from '../types';
import * as api from '../lib/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [snacksDrinks, setSnacksDrinks] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, bestRes, snacksRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ limit: 8, sort: 'newest' }),
          api.getProducts({ limit: 4, category: 'snacks-chips' }),
        ]);
        if (catRes.data) setCategories(catRes.data.categories);
        if (bestRes.data) setBestSellers(bestRes.data.products);
        if (snacksRes.data) setSnacksDrinks(snacksRes.data.products);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading fresh picks..." />;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#FDE047' }}>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-black uppercase tracking-wider mb-4 border-2"
              style={{ borderColor: '#171717', backgroundColor: '#fff' }}>
              <Clock size={14} />
              Delivery in 10 minutes
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4" style={{ color: '#171717' }}>
              Groceries delivered<br />
              <span style={{ textDecoration: 'underline', textDecorationColor: '#171717', textUnderlineOffset: '6px', textDecorationThickness: '4px' }}>
                at your door
              </span>
            </h1>
            <p className="text-lg font-medium mb-6 max-w-lg" style={{ color: '#333' }}>
              Fresh fruits, dairy, snacks, beverages and household essentials.
              Shop from 1000+ products at best prices.
            </p>
            <Link
              to="/products"
              className="btn-brutal btn-dark inline-flex items-center gap-2 text-base"
              style={{ backgroundColor: '#171717', color: '#fff', borderColor: '#171717', borderWidth: '3px', boxShadow: '4px 4px 0 #171717', padding: '12px 24px' }}
            >
              Start Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        {/* Decorative shapes */}
        <div className="absolute top-8 right-8 w-20 h-20 border-4 hidden md:block" style={{ borderColor: '#171717' }} />
        <div className="absolute bottom-12 right-32 w-12 h-12 hidden md:block" style={{ backgroundColor: '#171717' }} />
        <div className="absolute top-1/2 right-16 w-40 h-40 border-4 rotate-12 hidden lg:block" style={{ borderColor: '#171717' }} />
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-black" style={{ color: '#171717' }}>
            <Sparkles size={24} className="inline mr-2" style={{ color: '#FDE047' }} />
            Shop by Category
          </h2>
          <Link to="/products" className="text-sm font-bold hover:underline flex items-center gap-1" style={{ color: '#171717' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center text-center"
            >
              <div
                className="w-full aspect-square flex items-center justify-center text-4xl mb-2 border-3 transition-all group-hover:shadow-[4px_4px_0_#171717] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                style={{ borderWidth: '3px', borderColor: '#171717', backgroundColor: '#fff', boxShadow: '2px 2px 0 #171717' }}
              >
                {getCategoryEmoji(cat.slug)}
              </div>
              <span className="text-xs font-bold leading-tight" style={{ color: '#171717' }}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-black" style={{ color: '#171717' }}>
            <TrendingUp size={24} className="inline mr-2" style={{ color: '#22C55E' }} />
            Best Sellers
          </h2>
          <Link to="/products" className="text-sm font-bold hover:underline flex items-center gap-1" style={{ color: '#171717' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {bestSellers.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div
            className="p-6 md:p-8 border-3 flex flex-col justify-center"
            style={{ borderWidth: '3px', borderColor: '#171717', backgroundColor: '#FDE047', boxShadow: '6px 6px 0 #171717' }}
          >
            <span className="text-xs font-black uppercase tracking-wider mb-2">Limited time</span>
            <h3 className="text-2xl md:text-3xl font-black mb-2" style={{ color: '#171717' }}>
              Free Delivery
            </h3>
            <p className="font-medium mb-4" style={{ color: '#333' }}>On your first 3 orders. No minimum cart value!</p>
            <Link to="/products" className="btn-brutal btn-dark self-start" style={{ backgroundColor: '#171717', color: '#fff', borderColor: '#171717', borderWidth: '3px', boxShadow: '4px 4px 0 #333' }}>
              Order Now
            </Link>
          </div>
          <div
            className="p-6 md:p-8 border-3 flex flex-col justify-center"
            style={{ borderWidth: '3px', borderColor: '#171717', backgroundColor: '#171717', boxShadow: '6px 6px 0 #FDE047', color: '#fff' }}
          >
            <span className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: '#FDE047' }}>Fresh Daily</span>
            <h3 className="text-2xl md:text-3xl font-black mb-2">
              Farm to Table
            </h3>
            <p className="font-medium mb-4 text-gray-300">Fresh fruits and vegetables sourced directly from local farms.</p>
            <Link to="/products?category=fruits-vegetables" className="btn-brutal btn-primary self-start" style={{ backgroundColor: '#FDE047', color: '#171717', borderColor: '#FDE047', borderWidth: '3px', boxShadow: '4px 4px 0 #FDE047' }}>
              Shop Fresh
            </Link>
          </div>
        </div>
      </section>

      {/* Snacks section */}
      {snacksDrinks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 pb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black" style={{ color: '#171717' }}>
              🍿 Popular Snacks
            </h2>
            <Link to="/products?category=snacks-chips" className="text-sm font-bold hover:underline flex items-center gap-1" style={{ color: '#171717' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {snacksDrinks.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    'fruits-vegetables': '🥦',
    'dairy-bakery': '🥛',
    'snacks-chips': '🍿',
    'cold-drinks-juices': '🥤',
    'instant-food': '🍜',
    'chocolates-sweets': '🍫',
    'tea-coffee': '☕',
    'personal-care': '🧴',
    'household-essentials': '🏠',
  };
  return map[slug] || '📦';
}
