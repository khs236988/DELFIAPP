import React from 'react';

export const SectionTitle = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex items-end justify-between mb-6 px-2">
    <div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
      {subtitle && <p className="text-slate-400 text-sm font-medium mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);
