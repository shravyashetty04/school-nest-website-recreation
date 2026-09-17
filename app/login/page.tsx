'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      // Save token and role
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('role', data.data.role);
      localStorage.setItem('userName', data.data.name);
      
      // Push to smart dashboard router
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2">Enter your credentials to access your account.</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f6044] focus:border-[#0f6044] outline-none transition-all"
              placeholder="you@school.edu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f6044] focus:border-[#0f6044] outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0f6044] hover:bg-[#0c4d36] text-white font-medium py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Log in'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#0f6044] font-medium hover:underline">
            Get started
          </Link>
        </p>
      </div>
    </div>
  );
}
