import React from 'react';
import { CheckCircle2, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { MOCK_FEEDBACKS } from '../../constants';

export const FeedbackPage = () => (
  <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div>
      <h1 className="text-5xl font-black text-slate-900 tracking-tighter">학습 피드백</h1>
      <p className="text-slate-400 font-bold mt-2">코치님의 정밀 교정 포인트를 확인하세요.</p>
    </div>

    <div className="space-y-8">
      {MOCK_FEEDBACKS.map((fb) => (
        <Card key={fb.id} className="p-10 md:p-14">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-violet-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-violet-600/20">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{fb.assignmentTitle}</h3>
                <span className="text-sm text-slate-400 font-bold">{fb.date} 피드백 완료</span>
              </div>
            </div>
            <button className="p-3 text-slate-300 hover:text-slate-600 transition-colors">
              <MoreHorizontal size={28} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h4 className="text-[10px] font-black text-violet-600 uppercase tracking-[0.3em] mb-8">Key Correction Points</h4>
              <ul className="space-y-6">
                {fb.points.map((point, i) => (
                  <li key={i} className="flex gap-4 text-lg text-slate-700 font-bold leading-relaxed">
                    <div className="mt-2 w-2 h-2 bg-violet-600 rounded-full shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Next Action Goal</h4>
              <p className="text-slate-900 font-black text-2xl leading-tight mb-8">
                {fb.nextGoal}
              </p>
              <div className="flex items-center gap-2 text-violet-600 font-black text-sm cursor-pointer hover:translate-x-1 transition-transform">
                관련 학습 자료 보러가기 <ArrowRight size={18} />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);
