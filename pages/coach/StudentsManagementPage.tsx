import React from 'react';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export const StudentsManagementPage = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">학생 관리</h1>
        <p className="text-slate-400 font-bold mt-2">담당 학생들의 학습 현황을 한눈에 확인하세요.</p>
      </div>
      <div className="flex gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="학생 이름 검색..." 
            className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/20 w-64"
          />
        </div>
        <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-violet-600 transition-all">
          <Filter size={24} />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden">
              <img src={`https://picsum.photos/seed/student${i}/100`} alt="student" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900">학생 {i}</h4>
              <p className="text-xs text-slate-400 font-bold">최근 접속: 2시간 전</p>
            </div>
          </div>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-xs font-black">
              <span className="text-slate-400">학습 달성률</span>
              <span className="text-violet-600">72%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-600 w-[72%]" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">제출 과제</span>
              <span className="text-sm font-black text-slate-900">12 / 15</span>
            </div>
            <button className="p-2 text-slate-300 hover:text-slate-600">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </Card>
      ))}
    </div>
  </div>
);
