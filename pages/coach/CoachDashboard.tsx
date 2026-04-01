import React from 'react';
import { User } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionTitle } from '../../components/ui/SectionTitle';

export const CoachDashboard = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <section className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white">
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-8">
          반갑습니다, <span className="text-violet-400">코치님!</span>
        </h1>
        <p className="text-xl text-slate-400 font-bold leading-relaxed mb-12">
          오늘 검토가 필요한 과제는 <span className="text-white">12건</span>입니다.<br />
          학생들의 성장을 위한 정밀 피드백을 시작해보세요.
        </p>
        <div className="flex flex-wrap gap-6">
          <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Pending Reviews</span>
            <span className="text-3xl font-black">12</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Active Students</span>
            <span className="text-3xl font-black">48</span>
          </div>
        </div>
      </div>
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px]"></div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-10">
        <SectionTitle title="검토 대기 중인 과제" subtitle="피드백이 필요한 최신 제출물입니다." />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-8 hover:scale-[1.01] transition-all">
              <div className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                    <User size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">김철수 학생</h4>
                    <p className="text-slate-400 font-bold text-sm">2024학년도 6월 모의평가 독서 지문 분석</p>
                  </div>
                </div>
                <button className="px-8 py-4 bg-violet-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-violet-600/20 hover:bg-violet-700 transition-all">
                  피드백 작성
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div className="space-y-10">
        <SectionTitle title="학급 현황" />
        <Card className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-slate-400 font-black text-xs uppercase tracking-widest">과제 제출률</span>
              <span className="text-2xl font-black text-slate-900">84%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-600 w-[84%] rounded-full" />
            </div>
          </div>
          <div className="pt-8 border-t border-slate-50 space-y-4">
            <p className="text-sm text-slate-400 font-bold">최근 활동 학생</p>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <img src={`https://picsum.photos/seed/student${i}/100`} alt="student" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                +43
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
);
