import { Assignment, Feedback, CommunityPost, ReviewNote } from './types';

export const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: '1', title: '2024학년도 6월 모의평가 독서 지문 분석', dueDate: '2024-04-05', status: 'unsubmitted', subject: '독서', description: '지문 구조도 그리기 및 핵심 문장 요약' },
  { id: '2', title: '고전 시가 10선 핵심 정리', dueDate: '2024-04-03', status: 'submitted', subject: '문학', description: '주요 작품의 주제 및 표현상 특징 정리' },
  { id: '3', title: '중세 국어 문법 실전 문제풀이', dueDate: '2024-04-01', status: 'feedback_complete', subject: '문법', description: '기출 문제 20문항 풀이 및 오답 정리' },
  { id: '4', title: '현대 소설 기법 분석 - 광장', dueDate: '2024-04-07', status: 'unsubmitted', subject: '문학', description: '최인훈의 광장에 나타난 서사 기법 분석' },
];

export const MOCK_FEEDBACKS: Feedback[] = [
  { 
    id: '1', 
    assignmentId: '3', 
    assignmentTitle: '중세 국어 문법 실전 문제풀이', 
    date: '2024-04-02', 
    points: ['주격 조사 사용의 시대별 차이 완벽 이해', '객체 높임 선어말 어미 활용 주의 필요'], 
    nextGoal: '근대 국어 문법과의 차이점 비교 학습' 
  },
  { 
    id: '2', 
    assignmentId: '2', 
    assignmentTitle: '고전 시가 10선 핵심 정리', 
    date: '2024-04-04', 
    points: ['작품별 화자의 정서 파악이 정확함', '시어의 상징적 의미를 더 깊게 분석할 것'], 
    nextGoal: '연계 교재 외 낯선 작품 분석 연습' 
  },
];

export const MOCK_POSTS: CommunityPost[] = [
  { id: '1', title: '[공지] 4월 모의고사 대비 특강 안내', author: '관리자', date: '2024-03-30', comments: 12, likes: 45, isNotice: true },
  { id: '2', title: '독서 과학 지문 배경지식 쌓는 법 추천해주세요!', author: '김철수', date: '2024-03-31', comments: 5, likes: 8 },
  { id: '3', title: '문법 형태소 분석 너무 어려워요 ㅠㅠ', author: '이영희', date: '2024-03-31', comments: 3, likes: 2 },
];

export const MOCK_REVIEWS: ReviewNote[] = [
  { id: '1', title: '법 지문 - 비례의 원칙', subject: 'reading', weakness: '조건문 나열 시 정보 누락', comment: '조건이 3개 이상일 때는 번호를 매겨서 정리할 것', date: '2024-03-28' },
  { id: '2', title: '관동별곡 - 여정 정리', subject: 'literature', weakness: '공간의 이동에 따른 심리 변화 혼동', comment: '지도를 그려서 시각화하면 훨씬 잘 외워짐', date: '2024-03-25' },
];

export const siteConfig = {
  logoText: 'DELFI',
  primaryColor: '#7C3AED',
};
