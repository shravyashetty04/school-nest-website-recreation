'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || !role) {
      router.push('/login');
      return;
    }

    switch (role) {
      case 'SUPER_ADMIN':
      case 'SCHOOL_ADMIN':
        router.push('/dashboard/admin');
        break;
      case 'TEACHER':
        router.push('/dashboard/teacher');
        break;
      case 'STUDENT':
        router.push('/dashboard/student');
        break;
      case 'PARENT':
        router.push('/dashboard/parent');
        break;
      default:
        // Fallback for unknown roles
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0f6044]"></div>
    </div>
  );
}
