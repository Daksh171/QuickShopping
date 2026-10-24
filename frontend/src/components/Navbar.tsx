import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, MapPin, LogOut, Package, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-3 border-dark" style={{ borderBottomWidth: '3px', borderBottomColor: '#171717' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-primary border-2 border-dark flex items-center justify-center font-black text-lg" style={{ backgroundColor: '#FDE047', borderColor: '#171717' }}>
              Q
            </div>
            <span className="font-black text-xl hidden sm:block" style={{ color: '#171717' }}>QuickBasket</span>
          </Link>

          {/* Location */}
          <div className="hidden md:flex items-center gap-1 text-sm font-semibold px-3 cursor-pointer hover:bg-gray-50 py-2 rounded" style={{ color: '#171717' }}>
            <MapPin size={16} />
            <span>Delivery in <strong>10 mins</strong></span>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for groceries, snacks, drinks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-brutal pl-10 text-sm"
                style={{ borderWidth: '2px' }}
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 font-bold text-sm border-2 border-dark hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#171717' }}
                >
                  <User size={18} />
                  <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border-3 border-dark z-50" style={{ borderWidth: '3px', borderColor: '#171717', boxShadow: '4px 4px 0 #171717' }}>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-primary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                        style={{ color: '#171717' }}
                      >
                        <Package size={16} />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-red-50 w-full text-left border-t-2"
                        style={{ color: '#EF4444', borderTopColor: '#171717' }}
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-brutal btn-dark text-xs px-4 py-2" style={{ backgroundColor: '#171717', color: '#fff', borderColor: '#171717', boxShadow: '3px 3px 0 #171717' }}>
                Login
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 font-bold text-sm border-2 hover:bg-gray-50 transition-colors"
              style={{ borderColor: '#171717', backgroundColor: itemCount > 0 ? '#FDE047' : 'white' }}
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs font-black text-white rounded-full" style={{ backgroundColor: '#EF4444', fontSize: '10px' }}>
                  {itemCount}
                </span>
              )}
              <span className="hidden sm:block">Cart</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for groceries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-brutal pl-10 text-sm"
                  style={{ borderWidth: '2px' }}
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
