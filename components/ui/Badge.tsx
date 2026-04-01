import React from 'react';
import { cn } from '../../lib/utils';
import { AssignmentStatus } from '../../types';

export const Badge = ({ status }: { status: AssignmentStatus }) => {
  const styles = {
    unsubmitted: 'bg-slate-100 text-slate-500',
    submitted: 'bg-blue-50 text-blue-500',
    feedback_complete: 'bg-violet-50 text-violet-600',
  };
  const labels = {
    unsubmitted: '미제출',
    submitted: '제출완료',
    feedback_complete: '피드백완료',
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", styles[status])}>
      {labels[status]}
    </span>
  );
};
