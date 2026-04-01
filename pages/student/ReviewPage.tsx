import React, { useState, useMemo } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { MOCK_REVIEWS } from '../../constants';
import { Subject } from '../../types';
import { cn } from '../../lib/utils';

export const ReviewPage = () => {
  const [filter, setFilter] = useState<Subject | 'all'>('all');
  
  const filteredReviews = useMemo(() => {
    if (filter === 'all') return MOCK_REVIEWS;
    return MOCK_REVIEWS.filter(r => r.subject === filter);
  }, [filter]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">복습노트</h1>
          <p className="text-slate-400 font-bold mt-2">나의 약점을 기록하고 극복하세요.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {[
            { id: 'all', label: '전체' },
            { id: 'reading', label: '독서' },
            { id: 'literature', label: '문학' },
            { id: 'grammar', label: '문법' },
            { id: 'mock_exam', label: '모의고사' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={cn(
                "px-8 py-3 rounded-xl text-sm font-black transition-all",
                filter === item.id ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {filteredReviews.map((note) => (
          <Card key={note.id} className="flex flex-col p-10">
            <div className="flex justify-between items-start mb-8">
              <div className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                {note.subject}
              </div>
              <span className="text-xs text-slate-300 font-bold">{note.date}</span>
            </div>
            <h4 className="text-3xl font-black text-slate-900 mb-10 tracking-tight leading-tight">{note.title}</h4>
            
            <div className="space-y-8 flex-1">
              <div>
                <h5 className="text-[10px] font-black text-violet-600 uppercase tracking-[0.3em] mb-4">My Weakness</h5>
                <p className="text-xl text-slate-700 font-bold leading-tight">{note.weakness}</p>
              </div>
              <div className="bg-violet-50 rounded-[2rem] p-6 border border-violet-100/50">
                <h5 className="text-[10px] font-black text-violet-600/60 uppercase tracking-[0.3em] mb-3">Correction Note</h5>
                <p className="text-violet-600 font-black text-base leading-relaxed italic">
                  "{note.comment}"
                </p>
              </div>
            </div>

            <button className="mt-10 flex items-center justify-center gap-2 py-5 border border-slate-100 rounded-2xl text-slate-400 hover:text-violet-600 hover:border-violet-600/20 transition-all font-black text-sm">
              노트 수정하기 <ChevronRight size={18} />
            </button>
          </Card>
        ))}
        
        <button className="border-4 border-dashed border-slate-100 rounded-[3.5rem] p-10 flex flex-col items-center justify-center text-slate-300 hover:border-violet-600/30 hover:text-violet-600 transition-all group min-h-[400px]">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 group-hover:bg-violet-50 transition-all">
            <Plus size={40} />
          </div>
          <span className="font-black text-xl">새로운 복습노트 작성</span>
        </button>
      </div>
    </div>
  );
};
