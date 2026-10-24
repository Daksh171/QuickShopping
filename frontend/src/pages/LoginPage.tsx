import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 items-center justify-center font-black text-2xl border-3 mb-4" style={{ backgroundColor: '#FDE047', borderWidth: '3px', borderColor: '#171717', boxShadow: '4px 4px 0 #171717' }}>
            Q
          </div>
          <h1 className="text-3xl font-black" style={{ color: '#171717' }}>Welcome Back</h1>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Login to your QuickBasket account</p>
        </div>

        <form onSubmit={handleSubmit} className="border-3 p-6 space-y-4" style={{ borderWidth: '3px', borderColor: '#171717', backgroundColor: '#fff', boxShadow: '6px 6px 0 #171717' }}>
          {error && (
            <div className="px-4 py-3 text-sm font-bold border-2" style={{ backgroundColor: '#FEE2E2', borderColor: '#EF4444', color: '#EF4444' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#171717' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-brutal"
              style={{ borderWidth: '2px', borderColor: '#171717' }}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#171717' }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-brutal pr-10"
                style={{ borderWidth: '2px', borderColor: '#171717' }}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#9CA3AF' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-brutal btn-primary w-full text-base py-3"
            style={{ backgroundColor: '#FDE047', borderColor: '#171717', borderWidth: '3px', boxShadow: '4px 4px 0 #171717', color: '#171717' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-sm" style={{ color: '#9CA3AF' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold underline" style={{ color: '#171717' }}>Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
