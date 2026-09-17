'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Users, BookOpen, Clock, LogOut, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TeacherDashboard() {
  const [data, setData] = useState<any>({ classes: [], subjects: [], timetable: [] });
  const [loading, setLoading] = useState(true);
  
  // Attendance Management State
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any>({});
  const [loadingStudents, setLoadingStudents] = useState(false);

  const router = useRouter();
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : '';

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        const [classes, subjects, timetable] = await Promise.all([
          fetchApi('/classes'),
          fetchApi('/subjects'),
          fetchApi('/timetable')
        ]);
        
        setData({
          classes: classes.data,
          subjects: subjects.data,
          timetable: timetable.data
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
        
        // Map existing attendance to student IDs
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
      // Update local state instantly
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0f6044]"></div>
      </div>
    );
  }

  // Chart Data: Schedule Density
  const dayCounts = data.timetable.reduce((acc: any, t: any) => {
    acc[t.day] = (acc[t.day] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.keys(dayCounts).map(day => ({ name: day, Periods: dayCounts[day] }));

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="font-bold text-xl text-[#0f6044]">SchoolNest</span>
              <span className="ml-4 px-3 py-1 bg-[#0f6044]/10 text-[#0f6044] text-xs font-semibold rounded-full uppercase">
                Teacher Portal
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 mr-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">My Classes</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.classes.length}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 mr-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">My Subjects</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.subjects.length}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600 mr-4">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Weekly Periods</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.timetable.length}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Area: Attendance & Timetable */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Attendance Module */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Mark Daily Attendance</h2>
                <div className="flex gap-4">
                  <select 
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f6044]"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {data.classes.map((c: any) => (
                      <option key={c._id} value={c._id}>{c.className} {c.section}</option>
                    ))}
                  </select>
                  <input 
                    type="date"
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f6044]"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="p-0">
                {loadingStudents ? (
                  <div className="p-8 text-center text-gray-500">Loading students...</div>
                ) : students.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No students found in this class.</div>
                ) : (
                  <div className="max-h-96 overflow-y-auto overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 sticky top-0">
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Roll No</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Student Name</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-center">Current Status</th>
                          <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {students.map((stu: any) => (
                          <tr key={stu._id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-sm font-medium text-gray-500">{stu.admissionNumber}</td>
                            <td className="p-4 text-sm font-medium text-gray-900">{stu.firstName} {stu.lastName}</td>
                            <td className="p-4 text-center">
                              {attendanceRecords[stu._id] ? (
                                <span className={`text-xs font-bold px-2 py-1 rounded ${attendanceRecords[stu._id] === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {attendanceRecords[stu._id]}
                                </span>
                              ) : (
                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded">Not Marked</span>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button 
                                onClick={() => markAttendance(stu._id, 'PRESENT')}
                                className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded text-xs font-bold transition-colors"
                              >
                                <Check className="w-3 h-3 mr-1"/> Present
                              </button>
                              <button 
                                onClick={() => markAttendance(stu._id, 'ABSENT')}
                                className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-bold transition-colors"
                              >
                                <X className="w-3 h-3 mr-1"/> Absent
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Timetable */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-[#0f6044]" />
                <h2 className="text-lg font-bold text-gray-900">My Weekly Timetable</h2>
              </div>
              <div className="p-0 overflow-x-auto">
                {data.timetable.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No classes assigned yet.</div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Day</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.timetable.map((t: any) => (
                        <tr key={t._id} className="hover:bg-gray-50">
                          <td className="p-4 text-sm font-medium text-gray-900">{t.day}</td>
                          <td className="p-4 text-sm text-gray-600">{t.startTime} - {t.endTime}</td>
                          <td className="p-4 text-sm font-medium text-[#0f6044]">
                            {t.classId?.className} {t.classId?.section}
                          </td>
                          <td className="p-4 text-sm text-gray-600">{t.subjectId?.subjectName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             {/* Chart */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Schedule Density</h2>
                <div className="h-64 w-full">
                  {chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="Periods" fill="#0f6044" radius={[4, 4, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
