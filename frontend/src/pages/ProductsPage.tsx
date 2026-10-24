import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SortAsc, ChevronLeft, ChevronRight, Search, Package } from 'lucide-react';
import type { Product, Category, PaginationInfo } from '../types';
import * as api from '../lib/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.data) setCategories(res.data.categories);
    });
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await api.getProducts({
          page: currentPage,
          limit: 12,
          category: currentCategory || undefined,
          search: currentSearch || undefined,
          sort: currentSort,
        });
        if (res.data) {
          setProducts(res.data.products);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [currentCategory, currentSearch, currentSort, currentPage]);

  const updateParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    if (updates.category !== undefined || updates.search !== undefined || updates.sort !== undefined) {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const currentCategoryObj = categories.find(c => c.slug === currentCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm mb-2">
          <Link to="/" className="hover:underline font-semibold" style={{ color: '#9CA3AF' }}>Home</Link>
          <span style={{ color: '#9CA3AF' }}>/</span>
          <span className="font-bold" style={{ color: '#171717' }}>
            {currentCategoryObj ? currentCategoryObj.name : 'All Products'}
          </span>
        </div>
        <h1 className="text-3xl font-black" style={{ color: '#171717' }}>
          {currentSearch ? `Results for "${currentSearch}"` : currentCategoryObj ? currentCategoryObj.name : 'All Products'}
        </h1>
        {pagination && (
          <p className="text-sm font-semibold mt-1" style={{ color: '#9CA3AF' }}>{pagination.total} products found</p>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        {/* Category filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} style={{ color: '#171717' }} />
          <select
            value={currentCategory}
            onChange={(e) => updateParams({ category: e.target.value })}
            className="input-brutal text-sm py-2 px-3"
            style={{ width: 'auto', borderWidth: '2px', borderColor: '#171717' }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SortAsc size={16} style={{ color: '#171717' }} />
          <select
            value={currentSort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="input-brutal text-sm py-2 px-3"
            style={{ width: 'auto', borderWidth: '2px', borderColor: '#171717' }}
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>

        {/* Search */}
        {currentSearch && (
          <button
            onClick={() => updateParams({ search: '' })}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold border-2"
            style={{ borderColor: '#171717', backgroundColor: '#FDE047' }}
          >
            <Search size={12} />
            "{currentSearch}" ✕
          </button>
        )}
        {currentCategory && (
          <button
            onClick={() => updateParams({ category: '' })}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold border-2"
            style={{ borderColor: '#171717', backgroundColor: '#E5E5E5' }}
          >
            {currentCategoryObj?.name} ✕
          </button>
        )}
      </div>

      {/* Product grid */}
      {loading ? (
        <LoadingSpinner text="Loading products..." />
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto mb-4" style={{ color: '#E5E5E5' }} />
          <h3 className="text-xl font-black mb-2" style={{ color: '#171717' }}>No products found</h3>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Try adjusting your filters or search terms</p>
          <Link to="/products" className="btn-brutal btn-primary mt-4 inline-flex" style={{ backgroundColor: '#FDE047', borderColor: '#171717', borderWidth: '2px', boxShadow: '3px 3px 0 #171717', color: '#171717' }}>
            View All Products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => updateParams({ page: String(currentPage - 1) })}
                disabled={currentPage <= 1}
                className="btn-brutal btn-white p-2 disabled:opacity-30"
                style={{ borderColor: '#171717', borderWidth: '2px', boxShadow: '2px 2px 0 #171717' }}
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => updateParams({ page: String(page) })}
                  className="btn-brutal px-3 py-1 text-sm font-black"
                  style={{
                    backgroundColor: page === currentPage ? '#FDE047' : '#fff',
                    borderColor: '#171717',
                    borderWidth: '2px',
                    boxShadow: page === currentPage ? '0 0 0 #171717' : '2px 2px 0 #171717',
                    transform: page === currentPage ? 'translate(2px, 2px)' : 'none',
                    color: '#171717',
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => updateParams({ page: String(currentPage + 1) })}
                disabled={currentPage >= pagination.pages}
                className="btn-brutal btn-white p-2 disabled:opacity-30"
                style={{ borderColor: '#171717', borderWidth: '2px', boxShadow: '2px 2px 0 #171717' }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
