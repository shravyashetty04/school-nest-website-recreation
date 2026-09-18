'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function TeacherModals({ config, setConfig, onSuccess }: { 
  config: { isOpen: boolean, type: 'RESULT' }, 
  setConfig: any,
  onSuccess: () => void 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form State
  const [formData, setFormData] = useState<any>({});
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    if (config.isOpen && config.type === 'RESULT') {
      fetchApi('/exams').then(res => setExams(res.data)).catch(console.error);
    }
  }, [config.isOpen, config.type]);

  if (!config.isOpen) return null;

  const closeModal = () => {
    setConfig({ ...config, isOpen: false });
    setFormData({});
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
      if (config.type === 'RESULT') endpoint = '/results';

      // Automatically assign grade based on marks if not provided
      let finalData = { ...formData };
      if (!finalData.grade && finalData.marksObtained && finalData.maxMarks) {
        const percentage = (finalData.marksObtained / finalData.maxMarks) * 100;
        if (percentage >= 90) finalData.grade = 'A+';
        else if (percentage >= 80) finalData.grade = 'A';
        else if (percentage >= 70) finalData.grade = 'B';
        else if (percentage >= 60) finalData.grade = 'C';
        else if (percentage >= 50) finalData.grade = 'D';
        else finalData.grade = 'F';
      }

      await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(finalData),
      });

      setSuccess(`Successfully added result!`);
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

  const title = 'Enter Student Grade';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
          <h3 className="font-bold text-lg text-emerald-800">{title}</h3>
          <button onClick={closeModal} className="text-emerald-500 hover:text-emerald-700 transition-colors p-1 rounded-md hover:bg-emerald-200/50">
            <X className="w-5 h-5" />
          </button>
        </div>

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

          <form onSubmit={handleManualSubmit} className="space-y-4">
            
            {config.type === 'RESULT' && (
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Student ID *</label>
                     <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20" onChange={(e) => setFormData({...formData, studentId: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject ID *</label>
                     <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20" onChange={(e) => setFormData({...formData, subjectId: e.target.value})} />
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Exam / Assessment *</label>
                   <select required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20" onChange={(e) => setFormData({...formData, examId: e.target.value})}>
                     <option value="">Select Exam</option>
                     {exams.map(e => (
                       <option key={e._id} value={e._id}>{e.examName} ({e.examType})</option>
                     ))}
                   </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Marks Obtained *</label>
                     <input required type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20" onChange={(e) => setFormData({...formData, marksObtained: Number(e.target.value)})} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Maximum Marks *</label>
                     <input required type="number" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20" onChange={(e) => setFormData({...formData, maxMarks: Number(e.target.value)})} />
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Remarks (Optional)</label>
                   <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20" placeholder="Excellent progress!" onChange={(e) => setFormData({...formData, remarks: e.target.value})} />
                 </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
              <button disabled={loading} type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center min-w-[120px]">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Grade'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
