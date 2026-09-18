'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { 
  Users, BookOpen, Clock, LogOut, Check, X, 
  Home, ClipboardCheck, CalendarDays, FileText, 
  Settings, Bell, ChevronDown, Calendar as CalendarIcon, Leaf, MoreVertical,
  UserCheck, BarChart3, GraduationCap, Download, Edit2, Key, HelpCircle, Menu
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import TeacherModals from './TeacherModals';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

export default function TeacherDashboard() {
  const [data, setData] = useState<any>({ classes: [], subjects: [], timetable: [], announcements: [],
    leaves: [] });
  const [loading, setLoading] = useState(true);
  
  // Attendance Management State
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any>({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: 'RESULT'}>({isOpen: false, type: 'RESULT'});

  const router = useRouter();
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : 'Teacher';

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        const [classes, subjects, timetable, announcements, leaves] = await Promise.all([
          fetchApi('/classes').catch(() => ({ data: [] })),
          fetchApi('/subjects').catch(() => ({ data: [] })),
          fetchApi('/timetable').catch(() => ({ data: [] })),
          fetchApi('/announcements').catch(() => ({ data: [] })),
          fetchApi('/leaves').catch(() => ({ data: [] }))
        ]);
        
        setData({
          classes: classes.data || [],
          subjects: subjects.data || [],
          timetable: timetable.data || [],
          announcements: announcements.data || [],
          leaves: leaves?.data || []
        });
        
        if (classes.data.length > 0) {
          setSelectedClass(classes.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching teacher data', err);
      } finally {
        setLoading(false);
      }
    };
    loadTeacherData();
  }, []);

  useEffect(() => {
    if (!selectedClass || !attendanceDate) return;
    
    const loadClassData = async () => {
      setLoadingStudents(true);
      try {
        const [studentsRes, attendanceRes] = await Promise.all([
          fetchApi(`/students?classId=${selectedClass}`),
          fetchApi(`/attendance?classId=${selectedClass}&date=${attendanceDate}`)
        ]);
        
        setStudents(studentsRes.data);
        
        const recordsMap: any = {};
        attendanceRes.data.forEach((record: any) => {
          recordsMap[record.studentId._id || record.studentId] = record.status;
        });
        setAttendanceRecords(recordsMap);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingStudents(false);
      }
    };
    loadClassData();
  }, [selectedClass, attendanceDate]);

  const markAttendance = async (studentId: string, status: string) => {
    try {
      await fetchApi('/attendance', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          classId: selectedClass,
          date: attendanceDate,
          status
        })
      });
      setAttendanceRecords((prev: any) => ({ ...prev, [studentId]: status }));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-800"></div>
      </div>
    );
  }

  // Chart Data: Schedule Density
  const dayCounts = data.timetable.reduce((acc: any, t: any) => {
    acc[t.day] = (acc[t.day] || 0) + 1;
    return acc;
  }, {});
  const chartData = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({ 
    name: day.substring(0, 3), 
    Classes: dayCounts[day] || 0 
  }));

  // Format Date for header
  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const avatarInitials = userName ? userName.substring(0, 2).toUpperCase() : 'T1';

  // Helper to render Attendance UI
  const renderAttendanceUI = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-200px)] min-h-[600px] overflow-hidden">
      <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Mark Daily Attendance</h2>
            <p className="text-sm text-slate-500">View and manage attendance for your classes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {data.classes.map((c: any) => (
                <option key={c._id} value={c._id}>{c.className} {c.section}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
          <input 
            type="date"
            className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 p-0 overflow-auto">
        {loadingStudents ? (
          <div className="p-12 text-center text-slate-400 font-medium flex items-center justify-center h-full">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium flex items-center justify-center h-full">No students found in this class.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
              <tr>
                <th className="py-4 px-6 md:px-8 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[15%]">Roll No</th>
                <th className="py-4 px-6 md:px-8 text-xs font-semibold text-slate-400 uppercase tracking-wider w-[35%]">Student Name</th>
                <th className="py-4 px-6 md:px-8 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center w-[20%]">Current Status</th>
                <th className="py-4 px-6 md:px-8 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right w-[30%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {students.map((stu: any) => (
                <tr key={stu._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 md:px-8 text-sm font-medium text-slate-400">{stu.admissionNumber}</td>
                  <td className="py-4 px-6 md:px-8 text-sm font-bold text-slate-700">{stu.firstName} {stu.lastName}</td>
                  <td className="py-4 px-6 md:px-8 text-center">
                    {attendanceRecords[stu._id] ? (
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-md ${
                        attendanceRecords[stu._id] === 'PRESENT' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {attendanceRecords[stu._id] === 'PRESENT' ? 'Present' : 'Absent'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-500 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span> Not Marked
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 md:px-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => markAttendance(stu._id, 'PRESENT')}
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                          attendanceRecords[stu._id] === 'PRESENT'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 mr-1"/> Present
                      </button>
                      <button 
                        onClick={() => markAttendance(stu._id, 'ABSENT')}
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                          attendanceRecords[stu._id] === 'ABSENT'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        }`}
                      >
                        <X className="w-3.5 h-3.5 mr-1"/> Absent
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors ml-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loadingStudents && students.length > 0 && (
        <div className="p-4 md:px-8 border-t border-slate-100 bg-white flex items-center justify-between z-10">
          <span className="text-sm font-medium text-slate-400">
            Showing <strong className="text-slate-600">{students.length}</strong> students
          </span>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors font-medium text-sm">&lt;</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm font-medium text-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors font-medium text-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors font-medium text-sm">&gt;</button>
          </div>
        </div>
      )}
    </div>
  );

  // Helper to render Timetable UI
  const renderTimetableUI = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
      <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">My Weekly Timetable</h2>
          <p className="text-sm text-slate-500">View your comprehensive class schedule for the week</p>
        </div>
      </div>
      <div className="p-0 overflow-auto flex-1">
        {data.timetable.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium flex items-center justify-center h-full">No classes assigned yet.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
              <tr>
                <th className="py-4 px-8 text-xs font-bold text-slate-400 uppercase tracking-wider">Day</th>
                <th className="py-4 px-8 text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                <th className="py-4 px-8 text-xs font-bold text-slate-400 uppercase tracking-wider">Class</th>
                <th className="py-4 px-8 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                <th className="py-4 px-8 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {data.timetable.map((t: any) => (
                <tr key={t._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-8">
                    <p className="text-sm font-bold text-slate-700">{t.day}</p>
                  </td>
                  <td className="py-5 px-8">
                    <p className="text-sm font-medium text-slate-500">{t.startTime} - {t.endTime}</p>
                  </td>
                  <td className="py-5 px-8">
                    <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-100">
                      {t.classId?.className} {t.classId?.section}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-sm font-semibold text-slate-600">
                    {t.subjectId?.subjectName}
                  </td>
                  <td className="py-5 px-8 text-sm font-medium text-slate-400 text-right">
                    Room {t.roomNumber || '101'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex text-slate-800">
      <TeacherModals config={modalConfig} setConfig={setModalConfig} onSuccess={() => {}} />
      {/* LEFT SIDEBAR */}
      <aside className="w-[260px] bg-white border-r border-slate-200 fixed h-full flex-col z-20 hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="text-emerald-700 bg-emerald-50 p-1.5 rounded-lg">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-emerald-900 tracking-tight">SchoolNest</span>
          </div>
          <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">
            Teacher
          </span>
        </div>

        <div className="px-4 py-6 flex-1 flex flex-col gap-2 overflow-y-auto">
          {[
            { id: 'Dashboard', icon: Home },
            { id: 'My Classes', icon: Users },
            { id: 'My Subjects', icon: BookOpen },
            { id: 'Attendance', icon: ClipboardCheck },
            { id: 'Timetable', icon: CalendarDays },
            { id: 'Reports', icon: FileText },
            { id: 'Settings', icon: Settings },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === item.id 
                  ? 'bg-emerald-50 text-emerald-800' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-emerald-700' : ''}`} />
              {item.id}
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-4">
            <span>Better Learning<br/>Brighter Futures</span>
            <Leaf className="w-6 h-6 text-slate-200 opacity-50" />
          </div>
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
          <div className="flex md:hidden items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-700" />
            <span className="font-bold text-lg text-emerald-900">SchoolNest</span>
          </div>
          
          <div className="hidden md:block"></div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 border border-white rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 leading-tight">Welcome, {userName}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm group-hover:shadow-md transition-shadow">
                {avatarInitials}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* TAB ROUTING CONTENT */}
        <main className="flex-1 p-8 w-full max-w-[1500px] mx-auto">
          
          {activeTab === 'Dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-[28px] font-bold text-slate-800 tracking-tight mb-1">
                    Good Morning, {userName} 👋
                  </h1>
                  <p className="text-slate-500 text-sm">Here's what's happening with your classes today.</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <CalendarIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium">{todayFormatted}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 p-6 flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 relative overflow-hidden cursor-pointer" onClick={() => setActiveTab('My Classes')}>
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1">My Classes</p>
                      <h3 className="text-3xl font-bold text-slate-800 leading-none">{data.classes.length}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 p-6 flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 relative overflow-hidden cursor-pointer" onClick={() => setActiveTab('My Subjects')}>
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1">My Subjects</p>
                      <h3 className="text-3xl font-bold text-slate-800 leading-none">{data.subjects.length}</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 p-6 flex items-center justify-between group transition-all duration-300 hover:-translate-y-1 relative overflow-hidden cursor-pointer" onClick={() => setActiveTab('Timetable')}>
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1">Weekly Periods</p>
                      <h3 className="text-3xl font-bold text-slate-800 leading-none">{data.timetable.length}</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Schedule Density Chart - Now takes half width */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Schedule Density</h2>
                        <p className="text-sm text-slate-500">Classes distributed over the week</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-64 w-full mt-auto">
                    {chartData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">No data</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} dy={10}/>
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} />
                          <Tooltip cursor={{fill: '#f1f5f9', opacity: 0.5}} contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontWeight: 600, color: '#1e293b'}} itemStyle={{color: '#0f6044', fontWeight: 700}}/>
                          <Bar dataKey="Classes" fill="#0f6044" radius={[6, 6, 6, 6]} barSize={36}>
                            <LabelList dataKey="Classes" position="top" fill="#0f6044" fontSize={12} fontWeight={700} offset={8} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Quick Actions / Notices */}
                <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-2xl shadow-sm border border-emerald-900 p-8 text-white relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-700/50 rounded-full text-emerald-100 text-xs font-bold uppercase tracking-wider mb-6">
                      <Bell className="w-3.5 h-3.5" />
                      Important Notice
                    </div>
                    {data.announcements && data.announcements.length > 0 ? (
                      <>
                        <h2 className="text-3xl font-bold mb-3 leading-tight line-clamp-2">{data.announcements[0].title}</h2>
                        <p className="text-emerald-200/80 mb-8 max-w-sm leading-relaxed line-clamp-3">
                          {data.announcements[0].content}
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-3xl font-bold mb-3 leading-tight">Welcome to SchoolNest!</h2>
                        <p className="text-emerald-200/80 mb-8 max-w-sm leading-relaxed">
                          No new announcements at this time. Have a great day!
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="relative z-10 grid grid-cols-2 gap-4">
                    <button onClick={() => setActiveTab('Attendance')} className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm border border-white/10 group">
                      <ClipboardCheck className="w-6 h-6 mb-2 text-emerald-100 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-semibold">Mark Attendance</span>
                    </button>
                    <button onClick={() => setActiveTab('Timetable')} className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm border border-white/10 group">
                      <CalendarDays className="w-6 h-6 mb-2 text-emerald-100 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-semibold">View Timetable</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'My Classes' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">My Assigned Classes</h1>
                <p className="text-slate-500">Overview of all classes you are managing.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.classes.length === 0 ? (
                  <p className="text-slate-500 col-span-full">No classes found.</p>
                ) : data.classes.map((c: any, i: number) => (
                  <div key={c._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col group hover:shadow-md hover:border-blue-200 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">Grade {c.grade}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{c.className} {c.section}</h3>
                    <p className="text-sm text-slate-500 mb-6">Academic Year: {c.academicYear}</p>
                    
                    {/* Mock Data for aesthetics */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 mt-auto">
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-1">Total Students</p>
                        <p className="text-lg font-bold text-slate-700">{30 + (i * 2)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400 mb-1">Avg Attendance</p>
                        <p className="text-lg font-bold text-emerald-600">{92 + i}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'My Subjects' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">My Subjects</h1>
                <p className="text-slate-500">Curriculum and subjects you are currently teaching.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.subjects.length === 0 ? (
                  <p className="text-slate-500 col-span-full">No subjects found.</p>
                ) : data.subjects.map((s: any, i: number) => {
                  const progress = Math.floor(Math.random() * 40) + 40; // Random 40-80%
                  return (
                  <div key={s._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col group hover:shadow-md hover:border-emerald-200 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold rounded-md uppercase tracking-wider">{s.subjectCode}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{s.subjectName}</h3>
                    <p className="text-sm text-slate-500 mb-6 flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> Class: {s.classId?.className || 'Grade'} {s.classId?.section || 'A'}
                    </p>
                    
                    {/* Mock Progress Bar */}
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-slate-500">Syllabus Progress</span>
                        <span className="text-emerald-600">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}

          {activeTab === 'Attendance' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderAttendanceUI()}
            </div>
          )}

          {activeTab === 'Timetable' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderTimetableUI()}
            </div>
          )}

          {activeTab === 'Reports' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Academic Reports</h1>
                  <p className="text-slate-500">Generate and download performance reports.</p>
                </div>
                <button onClick={() => setModalConfig({isOpen: true, type: 'RESULT'})} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-sm hover:bg-emerald-700 transition-colors shadow-emerald-600/20">
                  <Edit2 className="w-5 h-5" /> Enter Grades
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Mid-Term Results 2026", desc: "Grade 10 & 11 Consolidated", date: "Sep 15, 2026", type: "PDF" },
                  { title: "Monthly Attendance", desc: "August 2026 - All Classes", date: "Sep 01, 2026", type: "CSV" },
                  { title: "Subject Performance", desc: "Mathematics - Q3 Review", date: "Aug 28, 2026", type: "PDF" }
                ].map((report, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-slate-300 transition-colors">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{report.title}</h3>
                    <p className="text-sm text-slate-500 mb-6">{report.desc}</p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <span className="text-xs font-medium text-slate-400">{report.date}</span>
                      <button className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition-colors">
                        <Download className="w-3.5 h-3.5" /> {report.type}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Profile Settings</h1>
                <p className="text-slate-500">Manage your account preferences and personal information.</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md">
                    {avatarInitials}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{userName}</h2>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                      <UserCheck className="w-4 h-4" /> Senior Faculty Member
                    </p>
                  </div>
                  <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors border border-slate-200">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                </div>
                
                <div className="p-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Email Address</label>
                      <input type="text" readOnly value={`teacher@schoolnest.com`} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Employee ID</label>
                      <input type="text" readOnly value="EMP001" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Phone Number</label>
                      <input type="text" readOnly value="+1 (555) 987-6543" className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Department</label>
                      <input type="text" readOnly value="Sciences & Mathematics" className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 outline-none" />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                    <Key className="w-4 h-4 text-slate-400" /> Change Password
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                    <HelpCircle className="w-4 h-4 text-slate-400" /> Help & Support
                  </button>
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
                        <input name="startDate" required type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Date *</label>
                        <input name="endDate" required type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Reason *</label>
                        <textarea name="reason" required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24 focus:ring-2 focus:ring-emerald-500/20" placeholder="e.g., Medical appointment"></textarea>
                      </div>
                      <button type="submit" className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors">
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
                          {data.leaves.map((l: any) => (
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
                          {data.leaves.length === 0 && (
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
