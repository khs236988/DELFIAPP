import React from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { cn } from '../../lib/utils';

export const UserManagementPage = () => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-end justify-between">
      <div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">사용자 관리</h1>
        <p className="text-slate-400 font-bold mt-2">전체 사용자 계정 및 권한을 관리합니다.</p>
      </div>
      <button className="px-8 py-4 bg-violet-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-violet-600/20 flex items-center gap-2 hover:bg-violet-700 transition-all">
        <Plus size={20} /> 신규 사용자 추가
      </button>
    </div>

    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">사용자</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">역할</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">가입일</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">상태</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i}/100`} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">사용자 {i}</p>
                      <p className="text-xs text-slate-400 font-bold">user{i}@example.com</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest",
                    i % 3 === 0 ? "bg-violet-50 text-violet-600" : i % 3 === 1 ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'Coach' : 'Student'}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-slate-500 font-bold">2024-03-{10 + i}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-xs text-slate-600 font-bold">활성</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);
