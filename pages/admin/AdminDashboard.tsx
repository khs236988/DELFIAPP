import React from 'react';
import { User, BookOpen, FileText, Clock, MoreHorizontal } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { cn } from '../../lib/utils';

export const AdminDashboard = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">시스템 관리</h1>
        <p className="text-slate-400 font-bold mt-2">전체 서비스 현황 및 사용자 관리</p>
      </div>
      <div className="flex gap-4">
        <button className="px-8 py-4 bg-white border border-slate-100 rounded-2xl font-black text-sm text-slate-600 hover:bg-slate-50 transition-all">
          로그 다운로드
        </button>
        <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-black transition-all">
          시스템 설정
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        { label: '전체 사용자', value: '1,284', change: '+12%', icon: User, color: 'bg-blue-50 text-blue-600' },
        { label: '활성 코치', value: '42', change: '+2', icon: BookOpen, color: 'bg-violet-50 text-violet-600' },
        { label: '오늘의 제출', value: '156', change: '+24%', icon: FileText, color: 'bg-emerald-50 text-emerald-600' },
        { label: '평균 피드백 시간', value: '4.2h', change: '-15%', icon: Clock, color: 'bg-orange-50 text-orange-600' },
      ].map((stat, i) => (
        <Card key={i} className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.color)}>
              <stat.icon size={24} />
            </div>
            <span className={cn("text-xs font-black", stat.change.startsWith('+') ? 'text-emerald-500' : 'text-blue-500')}>
              {stat.change}
            </span>
          </div>
          <span className="text-slate-400 font-black text-xs uppercase tracking-widest block mb-1">{stat.label}</span>
          <span className="text-3xl font-black text-slate-900">{stat.value}</span>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2">
        <Card className="p-0 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">최근 가입 사용자</h3>
            <button className="text-violet-600 font-black text-sm">전체 보기</button>
          </div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100`} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900">사용자 {i}</p>
                    <p className="text-xs text-slate-400 font-bold">user{i}@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-black rounded-lg uppercase">Student</span>
                  <button className="p-2 text-slate-300 hover:text-slate-600">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="space-y-10">
        <SectionTitle title="서버 상태" />
        <Card className="p-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-black text-slate-900">모든 시스템 정상</span>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black">
                <span className="text-slate-400">CPU Usage</span>
                <span className="text-slate-900">24%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[24%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black">
                <span className="text-slate-400">Memory</span>
                <span className="text-slate-900">62%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-600 w-[62%]" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
);
