import React from 'react';

export const Footer = () => (
  <footer className="mt-40 pt-20 pb-20 border-t border-slate-100 w-full max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-10 text-slate-400 font-bold text-sm">
    <div className="flex items-center gap-3 grayscale opacity-30">
      <div className="w-8 h-8 bg-slate-400 rounded-xl flex items-center justify-center text-white font-black text-xs">D</div>
      <span className="text-xl tracking-tighter font-black">DELFI</span>
    </div>
    <div className="flex gap-10">
      <a href="#" className="hover:text-violet-600 transition-colors">이용약관</a>
      <a href="#" className="hover:text-violet-600 transition-colors">개인정보처리방침</a>
      <a href="#" className="hover:text-violet-600 transition-colors">고객센터</a>
    </div>
    <p className="font-medium">© 2026 DELFI. All rights reserved.</p>
  </footer>
);
