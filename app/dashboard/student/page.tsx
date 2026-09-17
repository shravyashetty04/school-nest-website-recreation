'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Calendar, FileText, IndianRupee, LogOut, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function StudentDashboard() {
  const [data, setData] = useState<any>({ timetable: [], fees: [], results: [], attendance: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : '';

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const [timetable, fees, results, attendance] = await Promise.all([
          fetchApi('/timetable'),
          fetchApi('/fees'),
          fetchApi('/results'),
          fetchApi('/attendance')
        ]);
        
        setData({
          timetable: timetable.data,
          fees: fees.data,
          results: results.data,
          attendance: attendance.data
        });
      } catch (err) {
        console.error('Error fetching student data', err);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate Attendance Stats for Recharts
  const presentCount = data.attendance.filter((a: any) => a.status === 'PRESENT').length;
  const absentCount = data.attendance.filter((a: any) => a.status === 'ABSENT').length;
  
  const attendancePieData = [
    { name: 'Present', value: presentCount },
    { name: 'Absent', value: absentCount }
  ];
  const COLORS = ['#10b981', '#ef4444']; // Emerald for present, Red for absent

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="font-bold text-xl text-blue-600">SchoolNest</span>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase">
                Student Portal
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Timetable */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">My Schedule</h2>
              </div>
              <div className="p-0 overflow-x-auto">
                {data.timetable.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No classes scheduled.</div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Day</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.timetable.map((t: any) => (
                        <tr key={t._id} className="hover:bg-gray-50">
                          <td className="p-4 text-sm font-medium text-gray-900">{t.day}</td>
                          <td className="p-4 text-sm text-gray-600">{t.startTime} - {t.endTime}</td>
                          <td className="p-4 text-sm font-medium text-blue-600">{t.subjectId?.subjectName}</td>
                          <td className="p-4 text-sm text-gray-600">{t.roomNumber || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Recent Results</h2>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.results.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500 py-4">No results published yet.</div>
                ) : (
                  data.results.map((r: any) => (
                    <div key={r._id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{r.subjectId?.subjectName}</h3>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                          {r.grade}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Exam: {r.examId?.examName}</p>
                      <p className="text-xs font-medium text-gray-500">Marks: {r.marksObtained} / {r.maxMarks}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Detailed Attendance List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Attendance Log</h2>
              </div>
              <div className="p-6">
                 {data.attendance.length === 0 ? (
                  <div className="text-center text-gray-500">No attendance records found.</div>
                 ) : (
                  <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
                    {data.attendance.map((a: any) => (
                      <div key={a._id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50">
                        <div>
                           <p className="text-sm font-medium text-gray-900">{new Date(a.date).toLocaleDateString()}</p>
                           <p className="text-xs text-gray-500">Class: {a.classId?.className} {a.classId?.section}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${a.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                 )}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Attendance Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-6">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Attendance Overview</h2>
              </div>
              <div className="h-64 w-full">
                {data.attendance.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500 text-sm">No data available</div>
                ) : (
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
                )}
              </div>
            </div>

            {/* Fee Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <IndianRupee className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Fee Status</h2>
              </div>
              <div className="space-y-4">
                {data.fees.length === 0 ? (
                  <p className="text-sm text-gray-500">No fee records found.</p>
                ) : (
                  data.fees.map((f: any) => (
                    <div key={f._id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{f.feeType}</span>
                        {f.status === 'PAID' ? (
                          <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3 mr-1" /> PAID
                          </span>
                        ) : (
                          <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            <Clock className="w-3 h-3 mr-1" /> {f.status}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Total: ₹{f.amount.toLocaleString()}</span>
                        <span>Paid: ₹{f.amountPaid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-gray-900">Balance:</span>
                        <span className="text-red-600">₹{f.balance.toLocaleString()}</span>
                      </div>
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
