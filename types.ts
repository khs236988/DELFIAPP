export type Role = 'student' | 'coach' | 'admin';
export type Tab = 'home' | 'assignments' | 'feedback' | 'community' | 'review' | 'students' | 'management' | 'settings';
export type AssignmentStatus = 'unsubmitted' | 'submitted' | 'feedback_complete';
export type Subject = 'reading' | 'literature' | 'grammar' | 'mock_exam';

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: AssignmentStatus;
  subject: string;
  description: string;
}

export interface Feedback {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  date: string;
  points: string[];
  nextGoal: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  author: string;
  date: string;
  comments: number;
  likes: number;
  isNotice?: boolean;
}

export interface ReviewNote {
  id: string;
  title: string;
  subject: Subject;
  weakness: string;
  comment: string;
  date: string;
}
