'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Users, GraduationCap, School, IndianRupee, Megaphone, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : '';

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchApi('/dashboard/admin');
        setStats(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0f6044]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 bg-red-50 p-4 rounded-lg">Error: {error}</div>
      </div>
    );
  }

  // Chart Data
  const attendancePieData = [
    { name: 'Present', value: stats?.stats?.attendance?.presentStudents || 0 },
    { name: 'Absent', value: stats?.stats?.attendance?.absentStudents || 0 }
  ];
  const COLORS = ['#10b981', '#ef4444'];

  const revenueData = [
    { name: 'Collected', amount: stats?.stats?.revenue?.totalRevenue || 0 },
    { name: 'Pending', amount: stats?.stats?.revenue?.totalPending || 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="font-bold text-xl text-[#0f6044]">SchoolNest</span>
              <span className="ml-4 px-3 py-1 bg-[#0f6044]/10 text-[#0f6044] text-xs font-semibold rounded-full uppercase">
                Admin Panel
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.stats?.totalStudents || 0}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 mr-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Teachers</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.stats?.totalTeachers || 0}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600 mr-4">
              <School className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Classes</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.stats?.totalClasses || 0}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600 mr-4">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">₹{stats?.stats?.revenue?.totalRevenue?.toLocaleString() || 0}</h3>
              <p className="text-xs font-medium text-red-500 mt-1">Pending: ₹{stats?.stats?.revenue?.totalPending?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Charts Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Attendance Chart */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                 <h2 className="text-lg font-bold text-gray-900 mb-6">Today's Attendance</h2>
                 <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={attendancePieData}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={80}
                         paddingAngle={5}
                         dataKey="value"
                       >
                         {attendancePieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <RechartsTooltip />
                       <Legend />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
               </div>

               {/* Revenue Chart */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                 <h2 className="text-lg font-bold text-gray-900 mb-6">Financial Overview</h2>
                 <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <YAxis tickFormatter={(value) => `₹${value/1000}k`} allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="amount" fill="#0f6044" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Announcements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Megaphone className="w-5 h-5 mr-2 text-[#0f6044]" />
                  Announcements
                </h2>
                <button className="text-sm font-medium text-[#0f6044] hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {stats?.recentAnnouncements?.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No announcements found.</p>
                ) : (
                  stats?.recentAnnouncements?.map((announcement: any) => (
                    <div key={announcement._id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">
                          {announcement.audience}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{announcement.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
