import React from 'react';
import { 
  Home, 
  BookOpen, 
  RotateCcw, 
  MessageSquare, 
  FileText, 
  LayoutDashboard, 
  User, 
  BarChart3, 
  Calendar, 
  Bell 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Role, Tab } from '../../types';
import { siteConfig } from '../../constants';

interface NavbarProps {
  role: Role;
  setRole: (role: Role) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  setSelectedAssignment: (assignment: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  role, 
  setRole, 
  activeTab, 
  setActiveTab, 
  setSelectedAssignment 
}) => (
  <nav className="fixed top-0 left-0 right-0 h-24 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-50 px-6 lg:px-10 flex items-center justify-between">
    <div className="flex items-center gap-8 lg:gap-16">
      <div className="flex items-center gap-3 lg:gap-4 cursor-pointer group" onClick={() => setActiveTab('home')}>
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-violet-600/30 group-hover:rotate-6 transition-transform">
          D
        </div>
        <span className="text-2xl lg:text-4xl font-black tracking-tighter text-slate-900">{siteConfig.logoText}</span>
      </div>
      
      <div className="hidden md:flex items-center gap-1 lg:gap-3 bg-slate-50 p-1.5 lg:p-2 rounded-[2rem] border border-slate-100">
        {role === 'student' && [
          { id: 'home', label: '홈', icon: Home },
          { id: 'assignments', label: '과제', icon: BookOpen },
          { id: 'feedback', label: '피드백', icon: RotateCcw },
          { id: 'community', label: '커뮤니티', icon: MessageSquare },
          { id: 'review', label: '복습노트', icon: FileText },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id as Tab); setSelectedAssignment(null); }}
            className={cn(
              "px-3 py-3 lg:px-8 lg:py-4 rounded-[1.5rem] text-sm lg:text-base font-black transition-all flex items-center gap-2 lg:gap-3",
              activeTab === item.id 
                ? 'bg-white text-violet-600 shadow-xl shadow-slate-200/50 scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <item.icon size={18} className="lg:w-5 lg:h-5" />
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        ))}

        {role === 'coach' && [
          { id: 'home', label: '대시보드', icon: LayoutDashboard },
          { id: 'students', label: '학생 관리', icon: User },
          { id: 'assignments', label: '과제 검토', icon: BookOpen },
          { id: 'community', label: '커뮤니티', icon: MessageSquare },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id as Tab); }}
            className={cn(
              "px-3 py-3 lg:px-8 lg:py-4 rounded-[1.5rem] text-sm lg:text-base font-black transition-all flex items-center gap-2 lg:gap-3",
              activeTab === item.id 
                ? 'bg-white text-violet-600 shadow-xl shadow-slate-200/50 scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <item.icon size={18} className="lg:w-5 lg:h-5" />
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        ))}

        {role === 'admin' && [
          { id: 'home', label: '시스템 현황', icon: BarChart3 },
          { id: 'management', label: '사용자 관리', icon: User },
          { id: 'settings', label: '설정', icon: Calendar },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id as Tab); }}
            className={cn(
              "px-3 py-3 lg:px-8 lg:py-4 rounded-[1.5rem] text-sm lg:text-base font-black transition-all flex items-center gap-2 lg:gap-3",
              activeTab === item.id 
                ? 'bg-white text-violet-600 shadow-xl shadow-slate-200/50 scale-[1.02]' 
                : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <item.icon size={18} className="lg:w-5 lg:h-5" />
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        ))}
      </div>
    </div>

    <div className="flex items-center gap-4 lg:gap-8">
      <div className="hidden sm:flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
        {[
          { id: 'student', label: '학습자' },
          { id: 'coach', label: '코치' },
          { id: 'admin', label: '관리자' },
        ].map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id as Role)}
            className={cn(
              "px-3 py-2 lg:px-4 lg:py-2 rounded-xl text-[10px] lg:text-xs font-black transition-all",
              role === r.id ? "bg-white text-violet-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <button className="p-3 lg:p-4 text-slate-400 hover:text-violet-600 transition-colors relative bg-slate-50 rounded-[1.2rem] lg:rounded-[1.5rem]">
        <Bell size={20} className="lg:w-6 lg:h-6" />
        <span className="absolute top-3 right-3 lg:top-4 lg:right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      <div className="w-10 h-10 lg:w-14 lg:h-14 bg-slate-100 rounded-[1.2rem] lg:rounded-[1.5rem] flex items-center justify-center text-slate-400 border-2 border-white shadow-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform">
        <img src={`https://picsum.photos/seed/${role}/100`} alt="profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
    </div>
  </nav>
);
