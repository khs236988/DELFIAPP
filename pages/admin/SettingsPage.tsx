import React from 'react';
import { Card } from '../../components/ui/Card';

export const SettingsPage = () => (
  <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div>
      <h1 className="text-5xl font-black text-slate-900 tracking-tighter">시스템 설정</h1>
      <p className="text-slate-400 font-bold mt-2">서비스 운영에 필요한 기본 설정을 관리합니다.</p>
    </div>

    <div className="space-y-8">
      <Card className="p-10">
        <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-50 pb-6">일반 설정</h3>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-black text-slate-500 uppercase tracking-widest">사이트 이름</label>
            <div className="md:col-span-2">
              <input type="text" defaultValue="DELFI" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600/20" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <label className="text-sm font-black text-slate-500 uppercase tracking-widest">대표 이메일</label>
            <div className="md:col-span-2">
              <input type="email" defaultValue="contact@delfi.edu" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600/20" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-10">
        <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-50 pb-6">보안 및 권한</h3>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-slate-900">신규 가입 승인제</p>
              <p className="text-xs text-slate-400 font-bold">관리자가 승인한 사용자만 서비스를 이용할 수 있습니다.</p>
            </div>
            <div className="w-14 h-8 bg-violet-600 rounded-full p-1 cursor-pointer">
              <div className="w-6 h-6 bg-white rounded-full ml-auto" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-8 border-t border-slate-50">
            <div>
              <p className="font-black text-slate-900">자동 피드백 알림</p>
              <p className="text-xs text-slate-400 font-bold">피드백이 등록되면 학생에게 즉시 알림을 발송합니다.</p>
            </div>
            <div className="w-14 h-8 bg-slate-200 rounded-full p-1 cursor-pointer">
              <div className="w-6 h-6 bg-white rounded-full" />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <button className="px-10 py-5 bg-slate-100 text-slate-400 rounded-[2rem] font-black hover:bg-slate-200 transition-all">
          취소
        </button>
        <button className="px-10 py-5 bg-violet-600 text-white rounded-[2rem] font-black shadow-xl shadow-violet-600/20 hover:bg-violet-700 transition-all">
          설정 저장하기
        </button>
      </div>
    </div>
  </div>
);
