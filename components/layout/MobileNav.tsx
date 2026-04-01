import React, { useMemo } from 'react';
import { 
  Home, 
  BookOpen, 
  RotateCcw, 
  MessageSquare, 
  FileText, 
  LayoutDashboard, 
  User, 
  BarChart3, 
  Calendar 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Role, Tab } from '../../types';

interface MobileNavProps {
  role: Role;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  setSelectedAssignment: (assignment: any) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ 
  role, 
  activeTab, 
  setActiveTab, 
  setSelectedAssignment 
}) => {
  const items = useMemo(() => {
    if (role === 'student') return [
      { id: 'home', icon: Home },
      { id: 'assignments', icon: BookOpen },
      { id: 'feedback', icon: RotateCcw },
      { id: 'community', icon: MessageSquare },
      { id: 'review', icon: FileText },
    ];
    if (role === 'coach') return [
      { id: 'home', icon: LayoutDashboard },
      { id: 'students', icon: User },
      { id: 'assignments', icon: BookOpen },
      { id: 'community', icon: MessageSquare },
    ];
    if (role === 'admin') return [
      { id: 'home', icon: BarChart3 },
      { id: 'management', icon: User },
      { id: 'settings', icon: Calendar },
    ];
    return [];
  }, [role]);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50 px-10 py-6 flex justify-between items-center">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => { setActiveTab(item.id as Tab); setSelectedAssignment(null); }}
          className={cn(
            "p-5 rounded-[2rem] transition-all",
            activeTab === item.id ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/20' : 'text-slate-300'
          )}
        >
          <item.icon size={28} />
        </button>
      ))}
    </nav>
  );
};
