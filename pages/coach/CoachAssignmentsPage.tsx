import React from 'react';
import { FileText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { cn } from '../../lib/utils';

export const CoachAssignmentsPage = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">과제 검토</h1>
        <p className="text-slate-400 font-bold mt-2">학생들이 제출한 과제를 검토하고 피드백을 남겨주세요.</p>
      </div>
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
        {['대기 중', '검토 완료'].map((label, i) => (
          <button 
            key={i} 
            className={cn(
              "px-8 py-3 rounded-xl text-sm font-black transition-all",
              i === 0 ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>

    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="p-8 group hover:border-violet-600/20 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-violet-600 transition-all">
                <FileText size={28} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">독서</span>
                  <span className="text-xs text-slate-300 font-bold">제출일: 2024-04-01</span>
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-1">2024학년도 6월 모의평가 독서 지문 분석</h4>
                <p className="text-sm text-slate-400 font-bold">학생: 김철수 (고3 A반)</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-xs hover:bg-slate-100 transition-all">
                제출물 보기
              </button>
              <button className="px-8 py-4 bg-violet-600 text-white rounded-xl font-black text-sm shadow-lg shadow-violet-600/20 hover:bg-violet-700 transition-all">
                피드백 작성하기
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);
