'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { 
  Users, GraduationCap, School, IndianRupee, Megaphone, LogOut, 
  Home, BookOpen, CalendarDays, Settings, Bell, ChevronDown, Leaf, Plus,
  MoreVertical, Mail, Phone, Menu, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminModals from './AdminModals';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<any>({
    stats: null,
    teachers: [],
    students: [],
    classes: [],
    subjects: [],
    timetable: [],
    fees: [],
    leaves: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: 'TEACHER'|'STUDENT'|'TIMETABLE'|'ANNOUNCEMENT'|'FEE'}>({isOpen: false, type: 'TEACHER'});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const router = useRouter();
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : 'Admin';
  const avatarInitials = userName ? userName.substring(0, 2).toUpperCase() : 'AD';

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [statsRes, teachersRes, studentsRes, classesRes, subjectsRes, timetableRes, feesRes, leavesRes] = await Promise.all([
          fetchApi('/dashboard/admin').catch(() => ({ data: null })),
          fetchApi('/teachers').catch(() => ({ data: [] })),
          fetchApi('/students').catch(() => ({ data: [] })),
          fetchApi('/classes').catch(() => ({ data: [] })),
          fetchApi('/subjects').catch(() => ({ data: [] })),
          fetchApi('/timetable').catch(() => ({ data: [] })),
          fetchApi('/fees').catch(() => ({ data: [] })),
          fetchApi('/leaves').catch(() => ({ data: [] }))
        ]);
        
        setData({
          stats: statsRes.data,
          teachers: teachersRes.data || [],
          students: studentsRes.data || [],
          classes: classesRes.data || [],
          subjects: subjectsRes.data || [],
          timetable: timetableRes.data || [],
          fees: feesRes?.data || [],
          leaves: leavesRes?.data || []
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-rose-500 bg-rose-50 p-6 rounded-xl font-bold shadow-sm border border-rose-100">Error loading dashboard: {error}</div>
      </div>
    );
  }

  const { stats, teachers, students, classes, subjects, timetable, fees, leaves } = data;

  // Chart Data
  const attendancePieData = [
    { name: 'Present', value: stats?.stats?.attendance?.presentStudents || 85 },
    { name: 'Absent', value: stats?.stats?.attendance?.absentStudents || 15 }
  ];
  const COLORS = ['#4f46e5', '#f43f5e'];

  const revenueData = [
    { name: 'Collected', amount: stats?.stats?.revenue?.totalRevenue || 0 },
    { name: 'Pending', amount: stats?.stats?.revenue?.totalPending || 0 }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      {/* LEFT SIDEBAR */}
      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside className={`w-[260px] bg-white border-r border-slate-200 fixed h-full flex-col z-50 md:flex transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="text-indigo-700 bg-indigo-50 p-1.5 rounded-lg">
              <School className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-indigo-900 tracking-tight">SchoolNest</span>
          </div>
          <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider">
            Admin
          </span>
        </div>

        {/* Nav Links */}
        <div className="px-4 py-6 flex-1 flex flex-col gap-2 overflow-y-auto">
          {[
            { id: 'Dashboard', icon: Home },
            { id: 'Teachers', icon: GraduationCap },
            { id: 'Students', icon: Users },
            { id: 'Academics', icon: BookOpen },
            { id: 'Timetable', icon: CalendarDays },
            { id: 'Finance', icon: IndianRupee },
            { id: 'Settings', icon: Settings },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-800' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-700' : ''}`} />
              {item.id}
            </button>
          ))}
        </div>

        {/* Bottom Branding */}
        <div className="p-6 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen max-w-full">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex md:hidden items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 hover:text-indigo-600 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <School className="w-6 h-6 text-indigo-700" />
            <span className="font-bold text-lg text-indigo-900">SchoolNest</span>
          </div>
          
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-slate-800">Master Administration Portal</h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 border border-white rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 leading-tight">{userName}</p>
                <p className="text-[11px] font-medium text-slate-400">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm group-hover:shadow-md transition-shadow">
                {avatarInitials}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* TAB ROUTING CONTENT */}
        <main className="flex-1 p-8 w-full max-w-[1500px] mx-auto">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'Dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 p-6 flex items-start group transition-all cursor-pointer" onClick={() => setActiveTab('Students')}>
                  <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 mr-4 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Total Students</p>
                    <h3 className="text-2xl font-bold text-slate-800">{stats?.stats?.totalStudents || 0}</h3>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 p-6 flex items-start group transition-all cursor-pointer" onClick={() => setActiveTab('Teachers')}>
                  <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 mr-4 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Total Teachers</p>
                    <h3 className="text-2xl font-bold text-slate-800">{stats?.stats?.totalTeachers || 0}</h3>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 p-6 flex items-start group transition-all cursor-pointer" onClick={() => setActiveTab('Academics')}>
                  <div className="p-3.5 rounded-xl bg-purple-50 text-purple-600 mr-4 group-hover:scale-110 transition-transform">
                    <School className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Active Classes</p>
                    <h3 className="text-2xl font-bold text-slate-800">{stats?.stats?.totalClasses || 0}</h3>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 p-6 flex items-start group transition-all cursor-pointer" onClick={() => setActiveTab('Finance')}>
                  <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600 mr-4 group-hover:scale-110 transition-transform">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-800">₹{stats?.stats?.revenue?.totalRevenue?.toLocaleString() || 0}</h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts Area */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Attendance Chart */}
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                       <h2 className="text-lg font-bold text-slate-800 mb-6">Today's Attendance</h2>
                       <div className="h-64 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                             <Pie data={attendancePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                               {attendancePieData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                               ))}
                             </Pie>
                             <RechartsTooltip contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontWeight: 600}} itemStyle={{fontWeight: 700}}/>
                             <Legend wrapperStyle={{fontSize: '12px', fontWeight: 600, color: '#64748b'}} />
                           </PieChart>
                         </ResponsiveContainer>
                       </div>
                     </div>

                     {/* Revenue Chart */}
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                       <h2 className="text-lg font-bold text-slate-800 mb-6">Financial Overview</h2>
                       <div className="h-64 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} dy={10} />
                              <YAxis tickFormatter={(value) => `₹${value/1000}k`} allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} />
                              <RechartsTooltip cursor={{fill: '#f1f5f9', opacity: 0.5}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontWeight: 600}} />
                              <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 6, 6]} barSize={36} />
                            </BarChart>
                          </ResponsiveContainer>
                       </div>
                     </div>
                  </div>
                </div>

                {/* Sidebar Announcements */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center">
                      <Megaphone className="w-5 h-5 mr-2 text-indigo-600" />
                      Announcements
                    </h2>
                    <button onClick={() => setModalConfig({isOpen: true, type: 'ANNOUNCEMENT'})} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">New</button>
                  </div>
                  <div className="space-y-4 flex-1 overflow-y-auto">
                    {stats?.recentAnnouncements?.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">No recent announcements.</div>
                    ) : (
                      stats?.recentAnnouncements?.map((announcement: any) => (
                        <div key={announcement._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800">{announcement.title}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded uppercase tracking-wider text-slate-500">
                              {announcement.audience}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">{announcement.description}</p>
                          <p className="text-xs font-semibold text-slate-400 mt-3 flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" /> {new Date(announcement.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEACHERS TAB */}
          {activeTab === 'Teachers' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Teacher Directory</h1>
                  <p className="text-slate-500">Manage faculty members and teaching staff.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors shadow-indigo-600/20" onClick={() => setModalConfig({isOpen: true, type: 'TEACHER'})}>
                  <Plus className="w-5 h-5" /> Add Teacher
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Subjects</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {teachers.map((t: any) => (
                        <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                {t.firstName[0]}{t.lastName[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{t.firstName} {t.lastName}</p>
                                <p className="text-xs font-medium text-slate-400">{t.employeeId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-slate-600 flex items-center gap-1.5 mb-1"><Mail className="w-3.5 h-3.5 text-slate-400"/> {t.email}</p>
                            <p className="text-sm text-slate-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400"/> {t.phone}</p>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-1.5">
                              {t.assignedSubjects?.length > 0 ? t.assignedSubjects.slice(0, 2).map((s: any, i: number) => (
                                <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">{s.subjectCode || 'SUB'}</span>
                              )) : <span className="text-xs text-slate-400">None</span>}
                              {t.assignedSubjects?.length > 2 && <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded">+{t.assignedSubjects.length - 2}</span>}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-md ${t.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {teachers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">No teachers found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STUDENTS TAB */}
          {activeTab === 'Students' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Student Roster</h1>
                  <p className="text-slate-500">Manage student records and enrollments.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors shadow-indigo-600/20" onClick={() => setModalConfig({isOpen: true, type: 'STUDENT'})}>
                  <Plus className="w-5 h-5" /> Enroll Student
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Class</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Parent Info</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {students.slice(0, 50).map((s: any) => (
                        <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                {s.firstName[0]}{s.lastName[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{s.firstName} {s.lastName}</p>
                                <p className="text-xs font-medium text-slate-400">Roll: {s.admissionNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                              {s.classId?.className || 'Grade'} {s.classId?.section || 'A'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-slate-600 mb-1">{s.parentId?.firstName} {s.parentId?.lastName}</p>
                            <p className="text-xs font-medium text-slate-400">{s.parentId?.phone || 'No phone'}</p>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-md ${s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">No students found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {students.length > 50 && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm font-medium text-slate-500">
                    Showing 50 of {students.length} students. Use pagination to see more.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACADEMICS TAB */}
          {activeTab === 'Academics' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Academics</h1>
                  <p className="text-slate-500">Manage classes, subjects, and curriculum.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModalConfig({isOpen: true, type: 'SUBJECT'})} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors">
                    Add Subject
                  </button>
                  <button onClick={() => setModalConfig({isOpen: true, type: 'CLASS'})} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors shadow-indigo-600/20">
                    Add Class
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((c: any) => (
                  <div key={c._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                        <School className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">{c.academicYear}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{c.className} - Section {c.section}</h3>
                    <p className="text-sm text-slate-500 mb-6 flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> {c.students?.length || 0} Students Enrolled
                    </p>
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assigned Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {subjects.filter((s:any) => s.classId?._id === c._id).map((s:any) => (
                          <span key={s._id} className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold rounded-md">
                            {s.subjectName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TIMETABLE TAB */}
          {activeTab === 'Timetable' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Master Timetable</h1>
                  <p className="text-slate-500">View and manage the schedule across all classes.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors shadow-indigo-600/20" onClick={() => setModalConfig({isOpen: true, type: 'TIMETABLE'})}>
                  <Plus className="w-5 h-5" /> Schedule Class
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                <div className="overflow-x-auto h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Day</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Class</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject & Teacher</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {timetable.map((t: any) => (
                        <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-700">{t.day}</td>
                          <td className="py-4 px-6 text-sm font-medium text-slate-500">{t.startTime} - {t.endTime}</td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                              {t.classId?.className} {t.classId?.section}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-indigo-700">{t.subjectId?.subjectName}</p>
                            <p className="text-xs font-medium text-slate-400">{t.teacherId?.firstName} {t.teacherId?.lastName}</p>
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-slate-400 text-right">
                            {t.roomNumber}
                          </td>
                        </tr>
                      ))}
                      {timetable.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">No schedule data available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FINANCE TAB */}
          {activeTab === 'Finance' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Fee Management</h1>
                  <p className="text-slate-500">Monitor and manage student fees and payments.</p>
                </div>
                <button onClick={() => setModalConfig({isOpen: true, type: 'FEE'})} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors shadow-indigo-600/20">
                  <Plus className="w-5 h-5" /> Issue Fee
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                <div className="overflow-x-auto h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                      <tr>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Student & Fee Type</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount (₹)</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Paid (₹)</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Balance (₹)</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {fees.map((f: any) => (
                        <tr key={f._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-indigo-700">{f.studentId?.firstName} {f.studentId?.lastName}</p>
                            <p className="text-xs font-bold text-slate-800 mt-0.5">{f.feeType}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Due: {new Date(f.dueDate).toLocaleDateString()}</p>
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-slate-500 text-right">{f.amount.toLocaleString()}</td>
                          <td className="py-4 px-6 text-sm font-bold text-emerald-600 text-right">{f.amountPaid.toLocaleString()}</td>
                          <td className="py-4 px-6 text-sm font-bold text-rose-600 text-right">{f.balance.toLocaleString()}</td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                              f.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {f.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {fees.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">No fees issued yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          
          {/* LEAVES TAB */}
          {activeTab === 'Leaves Inbox' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Leave Approvals</h1>
                  <p className="text-slate-500">Review and manage leave requests from students and teachers.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                <div className="overflow-x-auto h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                      <tr>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Requester</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Dates</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Action / Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {leaves.map((l: any) => (
                        <tr key={l._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-indigo-700">{l.userId?.firstName || l.userId?.name} {l.userId?.lastName || ''}</p>
                            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{l.userId?.email}</p>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                                  l.role === 'TEACHER' ? 'bg-purple-50 text-purple-600' : 'bg-sky-50 text-sky-600'
                                }`}>
                                  {l.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-slate-600">
                            {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-500 max-w-[200px] truncate" title={l.reason}>
                            {l.reason}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {l.status === 'PENDING' ? (
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => updateLeaveStatus(l._id, 'APPROVED')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors" title="Approve">
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => updateLeaveStatus(l._id, 'REJECTED')} className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100 transition-colors" title="Reject">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                                <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                                  l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' 
                                  : 'bg-rose-50 text-rose-600'
                                }`}>
                                  {l.status}
                                </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {leaves.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">No leave requests found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'Settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[60vh] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                <Settings className="w-8 h-8 opacity-50" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">System Settings</h2>
              <p className="text-slate-500 text-center max-w-md">Global configuration, academic year management, and school profile settings are coming in the next release.</p>
            </div>
          )}

        </main>
      </div>
      <AdminModals config={modalConfig} setConfig={setModalConfig} onSuccess={() => window.location.reload()} />
    </div>
  );
}
