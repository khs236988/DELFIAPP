import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, FileText, RotateCcw, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { MOCK_ASSIGNMENTS, MOCK_FEEDBACKS } from '../../constants';
import { Tab, Assignment } from '../../types';

interface HomePageProps {
  setActiveTab: (tab: Tab) => void;
  setSelectedAssignment: (assignment: Assignment) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActiveTab, setSelectedAssignment }) => (
  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    {/* Progress Section */}
    <section className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-violet-600 rounded-full animate-pulse"></span>
          <span className="text-xs font-black text-violet-600 uppercase tracking-[0.2em]">Learning Progress</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
            오늘의 성장은 <span className="text-violet-600 italic">85%</span>
          </h1>
          <p className="text-slate-400 font-bold mb-2">목표까지 단 15% 남았습니다!</p>
        </div>
        <div className="mt-10 w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '85%' }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-violet-600 rounded-full"
          />
        </div>
      </div>
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-violet-600/5 rounded-full blur-[100px]"></div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Left Column: Assignments */}
      <div className="lg:col-span-2 space-y-10">
        <SectionTitle 
          title="오늘의 과제" 
          subtitle="마감 기한이 임박한 과제입니다."
          action={
            <button onClick={() => setActiveTab('assignments')} className="text-slate-400 hover:text-violet-600 transition-colors flex items-center gap-1 text-sm font-black">
              전체보기 <ChevronRight size={16} />
            </button>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MOCK_ASSIGNMENTS.filter(a => a.status === 'unsubmitted').slice(0, 2).map((item) => (
            <Card key={item.id} onClick={() => { setSelectedAssignment(item); setActiveTab('assignments'); }}>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-violet-600 transition-all">
                  <FileText size={24} />
                </div>
                <Badge status={item.status} />
              </div>
              <span className="text-[10px] font-black text-violet-600/50 uppercase tracking-widest mb-2 block">{item.subject}</span>
              <h4 className="text-xl font-black text-slate-900 mb-6 leading-tight">{item.title}</h4>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold pt-6 border-t border-slate-50">
                <Clock size={14} />
                <span>마감: {item.dueDate}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Column: Feedback & Q&A */}
      <div className="space-y-10">
        <div>
          <SectionTitle title="최근 피드백" />
          <Card className="bg-violet-600 border-none text-white shadow-violet-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white">
                <RotateCcw size={24} />
              </div>
              <div>
                <h4 className="font-black text-sm leading-tight">{MOCK_FEEDBACKS[0].assignmentTitle}</h4>
                <span className="text-[10px] text-white/60 font-bold">{MOCK_FEEDBACKS[0].date}</span>
              </div>
            </div>
            <p className="text-sm text-white/80 font-medium leading-relaxed italic mb-6">
              "{MOCK_FEEDBACKS[0].points[0]}..."
            </p>
            <button onClick={() => setActiveTab('feedback')} className="w-full py-4 bg-white text-violet-600 text-xs font-black rounded-2xl shadow-lg hover:scale-[1.02] transition-all">
              피드백 자세히 보기
            </button>
          </Card>
        </div>

        <div>
          <SectionTitle title="학습 현황" />
          <Card className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-sm font-bold text-slate-600">미제출 과제</span>
                </div>
                <span className="text-lg font-black text-slate-900">2건</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-violet-600 rounded-full"></div>
                  <span className="text-sm font-bold text-slate-600">답변 대기 질문</span>
                </div>
                <span className="text-lg font-black text-slate-900">1건</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
);
