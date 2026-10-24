import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (axios.isAxiosError(err) && err.response?.data?.errors) {
        setError(err.response.data.errors.map((e: { message: string }) => e.message).join(', '));
      } else {
        setError('Signup failed. Please try again.');
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
          <h1 className="text-3xl font-black" style={{ color: '#171717' }}>Create Account</h1>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>Join QuickBasket for fast grocery delivery</p>
        </div>

        <form onSubmit={handleSubmit} className="border-3 p-6 space-y-4" style={{ borderWidth: '3px', borderColor: '#171717', backgroundColor: '#fff', boxShadow: '6px 6px 0 #171717' }}>
          {error && (
            <div className="px-4 py-3 text-sm font-bold border-2" style={{ backgroundColor: '#FEE2E2', borderColor: '#EF4444', color: '#EF4444' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#171717' }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-brutal"
              style={{ borderWidth: '2px', borderColor: '#171717' }}
              placeholder="Your full name"
              required
              minLength={2}
            />
          </div>

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
                placeholder="At least 8 characters"
                required
                minLength={8}
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

          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#171717' }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-brutal"
              style={{ borderWidth: '2px', borderColor: '#171717' }}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-brutal btn-primary w-full text-base py-3"
            style={{ backgroundColor: '#FDE047', borderColor: '#171717', borderWidth: '3px', boxShadow: '4px 4px 0 #171717', color: '#171717' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm" style={{ color: '#9CA3AF' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-bold underline" style={{ color: '#171717' }}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
