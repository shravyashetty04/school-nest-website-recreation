'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ParentDashboard() {
  const router = useRouter();
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : '';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="font-bold text-xl text-[#0f6044]">SchoolNest</span>
              <span className="ml-4 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full uppercase">
                Parent Portal
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Welcome, {userName}</span>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center text-sm text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center mt-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Parent Portal Coming Soon!</h1>
        <p className="text-gray-500">You are successfully logged in. Tracking your child's progress will be available shortly.</p>
      </main>
    </div>
  );
}
