'use client';

import { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { fetchApi, API_BASE_URL } from '@/lib/api';

export default function AdminModals({ config, setConfig, onSuccess }: { 
  config: { isOpen: boolean, type: 'TEACHER'|'STUDENT'|'TIMETABLE'|'ANNOUNCEMENT'|'FEE'|'CLASS'|'SUBJECT' }, 
  setConfig: any,
  onSuccess: () => void 
}) {
  const [tab, setTab] = useState<'MANUAL'|'CSV'>('MANUAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form State
  const [formData, setFormData] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);

  if (!config.isOpen) return null;

  const closeModal = () => {
    setConfig({ ...config, isOpen: false });
    setTab('MANUAL');
    setFormData({});
    setFile(null);
    setError('');
    setSuccess('');
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let endpoint = '';
      if (config.type === 'TEACHER') endpoint = '/teachers';
      if (config.type === 'STUDENT') endpoint = '/students';
      if (config.type === 'TIMETABLE') endpoint = '/timetable';
      if (config.type === 'ANNOUNCEMENT') endpoint = '/announcements';
      if (config.type === 'FEE') endpoint = '/fees';
      if (config.type === 'CLASS') endpoint = '/classes';
      if (config.type === 'SUBJECT') endpoint = '/subjects';

      await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      setSuccess(`Successfully added ${config.type.toLowerCase()}!`);
      setTimeout(() => {
        closeModal();
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let endpoint = '';
      if (config.type === 'TEACHER') endpoint = '/teachers/bulk';
      if (config.type === 'STUDENT') endpoint = '/students/bulk';
      if (config.type === 'TIMETABLE') endpoint = '/timetable/bulk';

      const data = new FormData();
      data.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message || 'Upload failed');

      setSuccess(`Successfully imported ${result.count} records!`);
      setTimeout(() => {
        closeModal();
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred during bulk upload.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    let headers = '';
    let filename = '';
    
    if (config.type === 'TEACHER') {
      headers = 'firstName,lastName,email,phone\nJohn,Doe,john@example.com,1234567890';
      filename = 'teacher_template.csv';
    } else if (config.type === 'STUDENT') {
      headers = 'firstName,lastName,email,phone,classId,section\nJane,Smith,jane@example.com,0987654321,classObjectIdHere,A';
      filename = 'student_template.csv';
    } else if (config.type === 'TIMETABLE') {
      headers = 'classId,section,subjectId,teacherId,day,startTime,endTime,roomNumber\nclassObjectId,A,subjectObjectId,teacherObjectId,Monday,09:00,10:00,101';
      filename = 'timetable_template.csv';
    }

    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const title = config.type === 'TEACHER' ? 'Add New Teacher' 
              : config.type === 'STUDENT' ? 'Enroll New Student' 
              : config.type === 'TIMETABLE' ? 'Schedule Class'
              : config.type === 'FEE' ? 'Issue New Fee'
              : config.type === 'CLASS' ? 'Add New Class'
              : config.type === 'SUBJECT' ? 'Add New Subject'
              : 'Broadcast Announcement';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {(config.type !== 'ANNOUNCEMENT' && config.type !== 'FEE' && config.type !== 'CLASS' && config.type !== 'SUBJECT') && (
          <div className="flex border-b border-slate-100">
            <button 
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'MANUAL' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              onClick={() => setTab('MANUAL')}
            >
              Manual Entry
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex justify-center items-center gap-2 ${tab === 'CSV' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              onClick={() => setTab('CSV')}
            >
              <UploadCloud className="w-4 h-4" /> Bulk Upload (CSV)
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-600 text-sm font-medium">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-emerald-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {tab === 'MANUAL' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              
              {/* Dynamic Form Fields based on Type */}
              {(config.type === 'TEACHER' || config.type === 'STUDENT') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name *</label>
                    <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" placeholder="John" onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name *</label>
                    <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" placeholder="Doe" onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                </div>
              )}

              {(config.type === 'TEACHER' || config.type === 'STUDENT') && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                  <input required type="email" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" placeholder="john.doe@example.com" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              )}

              {(config.type === 'TEACHER' || config.type === 'STUDENT') && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone *</label>
                  <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" placeholder="+1 (555) 000-0000" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              )}

              {config.type === 'STUDENT' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Class Object ID</label>
                    <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" placeholder="Optional" onChange={(e) => setFormData({...formData, classId: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Section</label>
                    <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" placeholder="A" onChange={(e) => setFormData({...formData, section: e.target.value})} />
                  </div>
                </div>
              )}

              {config.type === 'TIMETABLE' && (
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Class ID *</label>
                       <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" onChange={(e) => setFormData({...formData, classId: e.target.value})} />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Section *</label>
                       <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" onChange={(e) => setFormData({...formData, section: e.target.value})} />
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject ID *</label>
                       <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" onChange={(e) => setFormData({...formData, subjectId: e.target.value})} />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Teacher ID *</label>
                       <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" onChange={(e) => setFormData({...formData, teacherId: e.target.value})} />
                     </div>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Day *</label>
                       <select required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" onChange={(e) => setFormData({...formData, day: e.target.value})}>
                          <option value="">Select</option>
                          <option value="Monday">Mon</option>
                          <option value="Tuesday">Tue</option>
                          <option value="Wednesday">Wed</option>
                          <option value="Thursday">Thu</option>
                          <option value="Friday">Fri</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Time *</label>
                       <input required type="time" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Time *</label>
                       <input required type="time" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
                     </div>
                   </div>
                </div>
              )}

              {config.type === 'ANNOUNCEMENT' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title *</label>
                    <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" placeholder="Sports Day 2026" onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Content *</label>
                    <textarea required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-32 focus:ring-2 focus:ring-indigo-500/20" placeholder="Write your announcement here..." onChange={(e) => setFormData({...formData, content: e.target.value})}></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Audience *</label>
                    <select required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" onChange={(e) => setFormData({...formData, audience: e.target.value})}>
                      <option value="">Select Audience</option>
                      <option value="ALL">All (Teachers, Students & Parents)</option>
                      <option value="TEACHERS">Teachers Only</option>
                      <option value="STUDENTS">Students Only</option>
                      <option value="PARENTS">Parents Only</option>
                    </select>
                  </div>
                </div>
              )}

              {config.type === 'FEE' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Student ID *</label>
                    <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" onChange={(e) => setFormData({...formData, studentId: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fee Type / Title *</label>
                    <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. Tuition Fee - Q3" onChange={(e) => setFormData({...formData, feeType: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Amount (₹) *</label>
                      <input required type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" placeholder="50000" onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Due Date *</label>
                      <input required type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {config.type === 'CLASS' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Class Name *</label>
                    <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. Grade 10 Alpha" onChange={(e) => setFormData({...formData, className: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Grade *</label>
                      <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. 10" onChange={(e) => setFormData({...formData, grade: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Section *</label>
                      <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. A" onChange={(e) => setFormData({...formData, section: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Academic Year *</label>
                      <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" placeholder="2026-2027" onChange={(e) => setFormData({...formData, academicYear: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Room Number</label>
                      <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. 101" onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {config.type === 'SUBJECT' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject Name *</label>
                      <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. Advanced Physics" onChange={(e) => setFormData({...formData, subjectName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject Code *</label>
                      <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" placeholder="e.g. PHY-301" onChange={(e) => setFormData({...formData, subjectCode: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Class ID *</label>
                    <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" placeholder="ObjectID of Class" onChange={(e) => setFormData({...formData, classId: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Max Marks *</label>
                      <input required type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" defaultValue={100} onChange={(e) => setFormData({...formData, maxMarks: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Passing Marks *</label>
                      <input required type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20" defaultValue={40} onChange={(e) => setFormData({...formData, passingMarks: Number(e.target.value)})} />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                <button disabled={loading} type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm shadow-indigo-600/20 transition-all flex items-center justify-center min-w-[120px]">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Record'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCSVSubmit} className="space-y-6">
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-1">CSV Template</h4>
                  <p className="text-xs text-slate-500">Download the required template format to ensure a successful import.</p>
                </div>
                <button type="button" onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 hover:bg-slate-50 transition-colors shadow-sm">
                  <Download className="w-3.5 h-3.5" /> Template
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors group relative cursor-pointer">
                <input 
                  type="file" 
                  accept=".csv" 
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="flex justify-center mb-3 text-indigo-500 group-hover:scale-110 transition-transform">
                  {file ? <FileText className="w-10 h-10" /> : <UploadCloud className="w-10 h-10" />}
                </div>
                <p className="text-sm font-bold text-slate-700 mb-1">
                  {file ? file.name : 'Click or drag file to upload'}
                </p>
                <p className="text-xs text-slate-500">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'CSV files only. Max 5MB.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                <button disabled={loading || !file} type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm shadow-indigo-600/20 transition-all flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Import Data'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
