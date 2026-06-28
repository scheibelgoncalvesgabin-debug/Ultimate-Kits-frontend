import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api.js';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSuccess = (data) => {
    localStorage.setItem('pk_token',   data.token);
    if (data.refresh) localStorage.setItem('pk_refresh', data.refresh);
    navigate('/', { replace: true });
  };

  const loginMutation = useMutation({
    mutationFn: () => api.post('/auth/login', { email, password }).then(r => r.data),
    onSuccess: handleSuccess,
    onError: (e) => toast.error(e.response?.data?.error || 'Login failed'),
  });

  const registerMutation = useMutation({
    mutationFn: () => api.post('/auth/register', { email, username, password }).then(r => r.data),
    onSuccess: handleSuccess,
    onError: (e) => toast.error(e.response?.data?.error || 'Registration failed'),
  });

  const isPending = loginMutation.isPending || registerMutation.isPending;

  const submit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === 'login') loginMutation.mutate();
    else registerMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎁</div>
          <h1 className="text-2xl font-bold text-white">PremiumKits</h1>
          <p className="text-gray-500 text-sm mt-1">Minecraft Kit Management Panel</p>
        </div>

        {/* Card */}
        <div className="bg-[#1e1e2e] border border-[#373750] rounded-2xl p-6 shadow-2xl">
          {/* Tab */}
          <div className="flex mb-6 bg-[#13131f] rounded-lg p-1">
            <button
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'login' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setMode('login')}>
              Sign In
            </button>
            <button
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'register' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setMode('register')}>
              Register
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Email</label>
              <input
                type="email" required autoFocus className="input"
                placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs text-gray-400 block mb-1">Username</label>
                <input
                  type="text" required className="input"
                  placeholder="YourUsername"
                  value={username} onChange={e => setUsername(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 block mb-1">Password</label>
              <input
                type="password" required className="input"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit" disabled={isPending || !email || !password}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-all mt-2">
              {isPending
                ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          PremiumKits Panel v2.0 — Your data is isolated per account
        </p>
      </div>
    </div>
  );
}
