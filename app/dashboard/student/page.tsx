'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { 
  Calendar, FileText, IndianRupee, LogOut, CheckCircle, Clock, 
  Home, BookOpen, Bell, ChevronDown, GraduationCap, School, Leaf,
  ClipboardList, AlertCircle, FileCheck, Menu, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function StudentDashboard() {
  const [data, setData] = useState<any>({
    stats: null,
    timetable: [],
    fees: [],
    results: [],
    attendance: [],
    assignments: [],
    announcements: [],
    leaves: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : 'Student';
  const avatarInitials = userName ? userName.substring(0, 2).toUpperCase() : 'ST';

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const [statsRes, timetableRes, feesRes, resultsRes, attendanceRes, assignmentsRes, announcementsRes, leavesRes] = await Promise.all([
          fetchApi('/dashboard/student').catch(() => ({ data: null })),
          fetchApi('/timetable').catch(() => ({ data: [] })),
          fetchApi('/fees').catch(() => ({ data: [] })),
          fetchApi('/results').catch(() => ({ data: [] })),
          fetchApi('/attendance').catch(() => ({ data: [] })),
          fetchApi('/assignments').catch(() => ({ data: [] })),
          fetchApi('/announcements').catch(() => ({ data: [] })),
          fetchApi('/leaves').catch(() => ({ data: [] }))
        ]);
        
        setData({
          stats: statsRes.data,
          timetable: timetableRes.data || [],
          fees: feesRes.data || [],
          results: resultsRes.data || [],
          attendance: attendanceRes.data || [],
          assignments: assignmentsRes.data || [],
          announcements: announcementsRes?.data || [],
          leaves: leavesRes?.data || []
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadStudentData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f9ff]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f9ff]">
        <div className="text-rose-500 bg-rose-50 p-6 rounded-xl font-bold shadow-sm border border-rose-100">Error loading dashboard: {error}</div>
      </div>
    );
  }

  const { stats, timetable, fees, results, attendance, assignments, announcements, leaves } = data;


  const handlePayment = async (feeId: string, amount: number) => {
    try {
      await fetchApi('/fees/payments', {
        method: 'POST',
        body: JSON.stringify({
          feeId,
          amount,
          paymentMethod: 'CARD',
          transactionId: `TXN${Math.floor(Math.random() * 1000000)}`
        })
      });
      // Refresh data
      const feesRes = await fetchApi('/fees');
      setData((prev: any) => ({ ...prev, fees: feesRes.data }));
      alert('Payment successful!');
    } catch (err: any) {
      alert(err.message || 'Payment failed');
    }
  };


  const handleRequestLeave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await fetchApi('/leaves', {
        method: 'POST',
        body: JSON.stringify({
          startDate: formData.get('startDate'),
          endDate: formData.get('endDate'),
          reason: formData.get('reason')
        })
      });
      // Refresh
      const leavesRes = await fetchApi('/leaves');
      setData((prev: any) => ({ ...prev, leaves: leavesRes.data }));
      alert('Leave requested successfully!');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert(err.message || 'Failed to request leave');
    }
  };

  // Calculate Attendance Stats for Recharts
  const presentCount = attendance.filter((a: any) => a.status === 'PRESENT').length;
  const absentCount = attendance.filter((a: any) => a.status === 'ABSENT').length;
  
  const attendancePieData = [
    { name: 'Present', value: presentCount || 85 },
    { name: 'Absent', value: absentCount || 15 }
  ];
  const COLORS = ['#0284c7', '#f43f5e']; // Sky for present, Red for absent

  // Calculate pending assignments
  const pendingAssignments = assignments.filter((a: any) => !a.isSubmitted).length;

  return (
    <div className="min-h-screen bg-[#f0f9ff] font-sans flex text-slate-800">
      
      {/* LEFT SIDEBAR */}
      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside className={`w-[260px] bg-white border-r border-sky-100 fixed h-full flex-col z-50 md:flex transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-sky-50">
          <div className="flex items-center gap-2">
            <div className="text-sky-600 bg-sky-50 p-1.5 rounded-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-sky-900 tracking-tight">SchoolNest</span>
          </div>
        </div>

        {/* Nav Links */}
        <div className="px-4 py-6 flex-1 flex flex-col gap-2 overflow-y-auto">
          {[
            { id: 'Dashboard', icon: Home },
            { id: 'Timetable', icon: Calendar },
            { id: 'Assignments', icon: ClipboardList, badge: pendingAssignments > 0 ? pendingAssignments : null },
            { id: 'Academics', icon: FileText },
            { id: 'Attendance', icon: Clock },
            { id: 'Fees', icon: IndianRupee },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === item.id 
                  ? 'bg-sky-50 text-sky-700' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-sky-600' : ''}`} />
                {item.id}
              </div>
              {item.badge && (
                <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom Branding */}
        <div className="p-6 border-t border-sky-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen max-w-full">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-sky-100 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex md:hidden items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 hover:text-sky-600 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <GraduationCap className="w-6 h-6 text-sky-600" />
            <span className="font-bold text-lg text-sky-900">SchoolNest</span>
          </div>
          
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-slate-800">Student Portal</h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              {pendingAssignments > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 border border-white rounded-full"></span>}
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 leading-tight">{userName}</p>
                <p className="text-[11px] font-medium text-slate-400">Student</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm group-hover:shadow-md transition-shadow">
                {avatarInitials}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* TAB ROUTING CONTENT */}
        <main className="flex-1 p-8 w-full max-w-[1400px] mx-auto">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'Dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Hero Banner */}
              <div className="bg-sky-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-lg shadow-sky-600/20">
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-3xl font-bold mb-2">Welcome back, {userName.split(' ')[0]}! 👋</h2>
                  
                  {announcements && announcements.length > 0 ? (
                    <div className="bg-sky-700/50 backdrop-blur-md rounded-xl p-4 border border-sky-400 mb-6 flex items-start gap-3">
                      <Bell className="w-5 h-5 text-sky-200 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sky-100 text-xs font-bold uppercase tracking-wider mb-1">Latest Notice</p>
                        <p className="font-bold text-white text-lg">{announcements[0].title}</p>
                        <p className="text-sm text-sky-100 mt-1">{announcements[0].content}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sky-100 text-lg mb-6">Here's what's happening with your classes today.</p>
                  )}

                  
                  <div className="flex gap-4">
                    {timetable[0] && (
                      <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <p className="text-sky-100 text-xs font-bold uppercase tracking-wider mb-1">Up Next</p>
                        <p className="font-bold text-lg flex items-center gap-2">
                          <Clock className="w-4 h-4 text-sky-200" /> {timetable[0].startTime} - {timetable[0].subjectId?.subjectName}
                        </p>
                        <p className="text-sm text-sky-100">Room {timetable[0].roomNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-sky-400/30 rounded-full translate-y-1/2 blur-2xl pointer-events-none"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Stats) */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Quick Links / Assignments */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                      <div className="flex items-center">
                        <ClipboardList className="w-5 h-5 mr-2 text-sky-500" />
                        <h2 className="text-lg font-bold text-slate-800">Pending Assignments</h2>
                      </div>
                      <button onClick={() => setActiveTab('Assignments')} className="text-sm font-bold text-sky-600 hover:text-sky-700">View All</button>
                    </div>
                    <div className="p-6">
                      {pendingAssignments === 0 ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium bg-emerald-50 p-4 rounded-xl">
                          <CheckCircle className="w-5 h-5" /> You're all caught up on your assignments!
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {assignments.filter((a: any) => !a.isSubmitted).slice(0,3).map((a: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:border-sky-200 transition-colors cursor-pointer bg-slate-50">
                              <div>
                                <p className="font-bold text-slate-800 mb-1">{a.title || 'Homework Assignment'}</p>
                                <p className="text-xs font-semibold text-sky-600">{a.subjectId?.subjectName}</p>
                              </div>
                              <span className="text-xs font-bold bg-white border border-slate-200 text-slate-500 px-3 py-1.5 rounded-lg shadow-sm">
                                Due: {new Date(a.dueDate || Date.now() + 86400000).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Results */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileCheck className="w-5 h-5 mr-2 text-emerald-500" />
                        <h2 className="text-lg font-bold text-slate-800">Recent Grades</h2>
                      </div>
                      <button onClick={() => setActiveTab('Academics')} className="text-sm font-bold text-sky-600 hover:text-sky-700">View Transcript</button>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {results.length === 0 ? (
                        <div className="col-span-full text-center text-slate-400 py-4 font-medium">No results published yet.</div>
                      ) : (
                        results.slice(0, 4).map((r: any) => (
                          <div key={r._id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex justify-between items-center">
                            <div>
                              <h3 className="font-bold text-slate-800 mb-1">{r.subjectId?.subjectName}</h3>
                              <p className="text-xs text-slate-500 font-medium">{r.examId?.examName}</p>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-lg mb-1">
                                {r.grade}
                              </span>
                              <span className="text-xs font-bold text-slate-400">{r.marksObtained}/{r.maxMarks}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Column (Charts & Alerts) */}
                <div className="space-y-8">
                  {/* Attendance Chart */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-slate-800 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-sky-500" />
                        Attendance
                      </h2>
                    </div>
                    <div className="h-[200px] w-full">
                      {attendance.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">No data available</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={attendancePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                              {attendancePieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-3xl font-bold text-slate-800">
                        {Math.round((presentCount / ((presentCount + absentCount) || 1)) * 100)}%
                      </p>
                      <p className="text-sm font-medium text-slate-500">Overall Attendance</p>
                    </div>
                  </div>

                  {/* Fee Alerts */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center mb-6">
                      <AlertCircle className="w-5 h-5 mr-2 text-rose-500" />
                      <h2 className="text-lg font-bold text-slate-800">Fee Alerts</h2>
                    </div>
                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                      {fees.filter((f:any) => f.status !== 'PAID').length === 0 ? (
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                          <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm font-bold text-emerald-700">All fees paid!</p>
                        </div>
                      ) : (
                        fees.filter((f:any) => f.status !== 'PAID').map((f: any) => (
                          <div key={f._id} className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-rose-900">{f.feeType}</span>
                              <span className="text-xs font-bold text-rose-700 bg-rose-200 px-2 py-1 rounded">DUE</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-semibold text-rose-600">Balance:</span>
                              <span className="font-bold text-rose-700 text-lg">₹{f.balance.toLocaleString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <button onClick={() => setActiveTab('Fees')} className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm rounded-xl transition-colors">
                      View All Invoices
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TIMETABLE TAB */}
          {activeTab === 'Timetable' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">My Timetable</h1>
                  <p className="text-slate-500">Your weekly class schedule.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                <div className="overflow-x-auto h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                      <tr>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Day</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
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
                            <p className="text-sm font-bold text-sky-700">{t.subjectId?.subjectName}</p>
                            <p className="text-xs font-medium text-slate-400">{t.teacherId?.firstName} {t.teacherId?.lastName}</p>
                          </td>
                          <td className="py-4 px-6 text-sm font-medium text-slate-400 text-right">
                            {t.roomNumber}
                          </td>
                        </tr>
                      ))}
                      {timetable.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">No schedule data available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ACADEMICS / RESULTS TAB */}
          {activeTab === 'Academics' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Academic Results</h1>
                  <p className="text-slate-500">Your examination grades and transcripts.</p>
                </div>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors">
                  Download Transcript
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200">No results published yet.</div>
                ) : (
                  results.map((r: any) => (
                    <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6" />
                        </div>
                        <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl ${
                          r.grade.includes('A') ? 'bg-emerald-100 text-emerald-700' :
                          r.grade.includes('B') ? 'bg-blue-100 text-blue-700' :
                          r.grade.includes('C') ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {r.grade}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{r.subjectId?.subjectName}</h3>
                      <p className="text-sm font-semibold text-slate-400 mb-4">{r.examId?.examName}</p>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score</span>
                        <span className="text-sm font-bold text-slate-700">{r.marksObtained} / {r.maxMarks}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'Attendance' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Attendance Log</h1>
                  <p className="text-slate-500">Review your daily attendance history.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {attendance.map((a: any) => (
                        <tr key={a._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-medium text-slate-800">
                            {new Date(a.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-md ${a.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {attendance.length === 0 && (
                        <tr>
                          <td colSpan={2} className="py-12 text-center text-slate-400 font-medium">No attendance records found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === 'Assignments' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Homework & Assignments</h1>
                  <p className="text-slate-500">Track and manage your coursework.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200">No assignments found.</div>
                ) : (
                  assignments.map((a: any) => {
                    const isOverdue = new Date(a.dueDate) < new Date() && !a.isSubmitted;
                    return (
                      <div key={a._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col relative overflow-hidden group">
                        {/* Status Strip */}
                        <div className={`absolute top-0 left-0 w-full h-1 ${
                          a.isSubmitted ? 'bg-emerald-500' : 
                          isOverdue ? 'bg-rose-500' : 'bg-amber-500'
                        }`}></div>

                        <div className="flex justify-between items-start mb-3 mt-2">
                          <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded">
                            {a.subjectId?.subjectName || 'Subject'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                             a.isSubmitted ? 'text-emerald-700 bg-emerald-100' : 
                             isOverdue ? 'text-rose-700 bg-rose-100' : 'text-amber-700 bg-amber-100'
                          }`}>
                            {a.isSubmitted ? 'Submitted' : isOverdue ? 'Overdue' : 'Pending'}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{a.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">{a.description}</p>
                        
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Due: {new Date(a.dueDate || Date.now()).toLocaleDateString()}
                          </span>
                          {!a.isSubmitted && (
                             <button className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors">
                               Submit
                             </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* FEES TAB */}
          {activeTab === 'Fees' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Fee Management</h1>
                  <p className="text-slate-500">View your invoices and payment history.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice / Detail</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Paid</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Balance</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {fees.map((f: any) => (
                        <tr key={f._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-800 mb-0.5">{f.feeType}</p>
                            <p className="text-xs text-slate-400 font-medium">Due: {new Date(f.dueDate).toLocaleDateString()}</p>
                          </td>
                          <td className="py-4 px-6 text-right font-semibold text-slate-600">₹{f.amount.toLocaleString()}</td>
                          <td className="py-4 px-6 text-right font-semibold text-emerald-600">₹{f.amountPaid.toLocaleString()}</td>
                          <td className="py-4 px-6 text-right font-bold text-rose-600">₹{f.balance.toLocaleString()}</td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                              f.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {f.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {f.status !== 'PAID' ? (
                              <button onClick={() => handlePayment(f._id, f.balance)} className="px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-sky-700 transition-colors">
                                Pay Now
                              </button>
                            ) : (
                              <button className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
                                Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {fees.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">No fee records found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        
          {/* LEAVES TAB */}
          {activeTab === 'Leaves' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Leave Management</h1>
                <p className="text-slate-500">Request time off and view your leave history.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Request Leave</h3>
                    <form onSubmit={handleRequestLeave} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Date *</label>
                        <input name="startDate" required type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Date *</label>
                        <input name="endDate" required type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500/20" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reason *</label>
                        <textarea name="reason" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24 focus:ring-2 focus:ring-sky-500/20" placeholder="e.g., Medical appointment"></textarea>
                      </div>
                      <button type="submit" className="w-full py-2 bg-sky-600 text-white font-bold rounded-xl shadow-sm shadow-sky-600/20 hover:bg-sky-700 transition-colors">
                        Submit Request
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="font-bold text-slate-800">Leave History</h3>
                    </div>
                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Dates</th>
                            <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</th>
                            <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {leaves.map((l: any) => (
                            <tr key={l._id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-6">
                                <p className="text-sm font-bold text-slate-700">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</p>
                              </td>
                              <td className="py-4 px-6 text-sm text-slate-500 max-w-[200px] truncate" title={l.reason}>
                                {l.reason}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                                  l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' 
                                  : l.status === 'REJECTED' ? 'bg-rose-50 text-rose-600'
                                  : 'bg-amber-50 text-amber-600'
                                }`}>
                                  {l.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {leaves.length === 0 && (
                            <tr>
                              <td colSpan={3} className="py-12 text-center text-slate-400 font-medium">No leave requests found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
