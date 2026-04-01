import React from 'react';
import { ChevronLeft, Upload, FileText, Clock, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MOCK_ASSIGNMENTS } from '../../constants';
import { Assignment } from '../../types';
import { cn } from '../../lib/utils';

interface AssignmentsPageProps {
  selectedAssignment: Assignment | null;
  setSelectedAssignment: (assignment: Assignment | null) => void;
}

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({ 
  selectedAssignment, 
  setSelectedAssignment 
}) => {
  if (selectedAssignment) {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <button onClick={() => setSelectedAssignment(null)} className="flex items-center gap-2 text-slate-400 hover:text-violet-600 transition-colors font-black text-sm group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 목록으로 돌아가기
        </button>
        
        <div className="bg-white rounded-[3.5rem] p-10 md:p-20 border border-slate-100 shadow-xl shadow-slate-200/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-black text-violet-600 uppercase tracking-[0.2em]">{selectedAssignment.subject}</span>
                <Badge status={selectedAssignment.status} />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">{selectedAssignment.title}</h1>
            </div>
            <div className="bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Deadline</span>
              <span className="text-xl font-black text-slate-900">{selectedAssignment.dueDate}</span>
            </div>
          </div>

          <div className="space-y-12">
            <div className="prose prose-slate max-w-none">
              <h3 className="text-xl font-black text-slate-900 mb-4">과제 설명</h3>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">{selectedAssignment.description}</p>
            </div>

            <div className="pt-12 border-t border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-8">과제 제출</h3>
              <div className="border-4 border-dashed border-slate-100 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center hover:border-violet-600/30 hover:bg-violet-50/30 transition-all cursor-pointer group">
                <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-slate-300 group-hover:text-violet-600 transition-all mb-6">
                  <Upload size={36} />
                </div>
                <p className="text-xl font-black text-slate-900 mb-2">파일을 드래그하거나 클릭하여 업로드</p>
                <p className="text-slate-400 font-bold">PDF, JPG, PNG (최대 20MB)</p>
              </div>
              <button className="mt-10 w-full py-6 bg-violet-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-violet-600/20 hover:bg-violet-700 hover:scale-[1.01] active:scale-[0.99] transition-all">
                과제 제출하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">나의 과제</h1>
          <p className="text-slate-400 font-bold mt-2">총 {MOCK_ASSIGNMENTS.length}개의 과제가 배정되었습니다.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {['전체', '미제출', '완료'].map((label, i) => (
            <button 
              key={i} 
              className={cn(
                "px-8 py-3 rounded-xl text-sm font-black transition-all",
                i === 1 ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {MOCK_ASSIGNMENTS.map((item) => (
          <Card key={item.id} onClick={() => setSelectedAssignment(item)}>
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                <FileText size={28} />
              </div>
              <Badge status={item.status} />
            </div>
            <span className="text-[10px] font-black text-violet-600/50 uppercase tracking-widest mb-2 block">{item.subject}</span>
            <h4 className="text-2xl font-black text-slate-900 mb-8 leading-tight h-16 overflow-hidden line-clamp-2">{item.title}</h4>
            <div className="flex items-center justify-between pt-8 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-black">
                <Clock size={14} />
                <span>D-3</span>
              </div>
              <div className="text-violet-600 font-black text-xs flex items-center gap-1">
                자세히 보기 <ChevronRight size={14} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
