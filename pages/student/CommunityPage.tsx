import React from 'react';
import { Plus, ThumbsUp, MessageCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { MOCK_POSTS } from '../../constants';
import { cn } from '../../lib/utils';

export const CommunityPage = () => (
  <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">커뮤니티</h1>
        <p className="text-slate-400 font-bold mt-2">함께 공부하고 질문을 나누는 공간입니다.</p>
      </div>
      <button className="px-10 py-5 bg-violet-600 text-white rounded-[2rem] font-black shadow-xl shadow-violet-600/20 flex items-center gap-2 hover:bg-violet-700 transition-all">
        <Plus size={24} /> 질문 작성하기
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
      <div className="lg:col-span-1">
        <Card className="p-6 sticky top-32">
          <nav className="space-y-2">
            {['전체보기', '공지사항', '질문답변', '자유게시판'].map((item, i) => (
              <button key={i} className={cn(
                "w-full text-left px-8 py-5 rounded-2xl text-base font-black transition-all",
                i === 0 ? "bg-violet-50 text-violet-600" : "text-slate-400 hover:bg-slate-50"
              )}>
                {item}
              </button>
            ))}
          </nav>
        </Card>
      </div>

      <div className="lg:col-span-3 space-y-8">
        {MOCK_POSTS.map((post) => (
          <Card key={post.id} className={cn("p-8 group", post.isNotice && "bg-slate-900 border-none text-white shadow-slate-900/20")}>
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {post.isNotice && <span className="px-3 py-1 bg-violet-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Notice</span>}
                  <span className={cn("text-xs font-bold", post.isNotice ? "text-white/40" : "text-slate-400")}>{post.author} · {post.date}</span>
                </div>
                <h4 className={cn("text-2xl font-black tracking-tight mb-6 group-hover:text-violet-600 transition-colors", post.isNotice && "group-hover:text-violet-400")}>{post.title}</h4>
                <div className={cn("flex items-center gap-6 text-xs font-black", post.isNotice ? "text-white/30" : "text-slate-300")}>
                  <div className="flex items-center gap-1.5">
                    <ThumbsUp size={16} /> {post.likes}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle size={16} /> {post.comments}
                  </div>
                </div>
              </div>
              {!post.isNotice && (
                <div className="w-24 h-24 bg-slate-100 rounded-[2rem] overflow-hidden hidden sm:block shrink-0">
                  <img src={`https://picsum.photos/seed/${post.id}/200`} alt="post" className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);
