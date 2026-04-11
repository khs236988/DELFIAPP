import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Download,
  FileText,
  Home,
  Inbox,
  Loader2,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Upload,
  User,
  Users,
} from "lucide-react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type Role = "admin" | "student";
type AssignmentStatus = "assigned" | "submitted" | "feedback_done";
type StudentStatus = "active" | "paused" | "ended";

type Assignment = {
  id: string;
  title: string;
  assignedTo: string;
  assignedStudentName: string;
  assignedStudentGrade: "고1" | "고2" | "고3" | "N수";
  dueDate: string;
  createdAt: string;
  pdfName: string;
  status: AssignmentStatus;
};

type Submission = {
  id: string;
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  submittedAt: string;
  status: "submitted" | "feedback_done";
};

type FeedbackItem = {
  id: string;
  assignmentTitle: string;
  studentName: string;
  createdAt: string;
  status: "waiting" | "completed";
  isRead: boolean;
  summary: string;
};

type StudentRecord = {
  id: string;
  name: string;
  grade: "고1" | "고2" | "고3" | "N수";
  email: string;
  school?: string;
  phone?: string;
  status: StudentStatus;
  activeAssignments: number;
  submittedCount: number;
  feedbackDoneCount: number;
};

type NavItem = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const adminNav: NavItem[] = [
  { key: "dashboard", label: "대시보드", icon: Home },
  { key: "assignments", label: "과제 관리", icon: FileText },
  { key: "submissions", label: "제출 관리", icon: Inbox },
  { key: "feedback", label: "피드백 관리", icon: MessageSquare },
  { key: "students", label: "학생 관리", icon: Users },
];

const studentNav: NavItem[] = [
  { key: "assignments", label: "내 과제", icon: FileText },
  { key: "submissions", label: "제출 내역", icon: Inbox },
  { key: "feedback", label: "피드백", icon: MessageSquare },
  { key: "profile", label: "내 정보", icon: User },
];

const mockStudents: StudentRecord[] = [
  {
    id: "u1",
    name: "김민지",
    grade: "고3",
    email: "minji@example.com",
    school: "대원고",
    phone: "010-1111-2222",
    status: "active",
    activeAssignments: 2,
    submittedCount: 10,
    feedbackDoneCount: 8,
  },
  {
    id: "u2",
    name: "이준호",
    grade: "N수",
    email: "junho@example.com",
    school: "-",
    phone: "010-2222-3333",
    status: "active",
    activeAssignments: 1,
    submittedCount: 8,
    feedbackDoneCount: 7,
  },
  {
    id: "u3",
    name: "박서연",
    grade: "고2",
    email: "seoyeon@example.com",
    school: "세화고",
    phone: "010-3333-4444",
    status: "paused",
    activeAssignments: 3,
    submittedCount: 12,
    feedbackDoneCount: 11,
  },
];

const mockAssignments: Assignment[] = [
  {
    id: "a1",
    title: "4월 1주차 독서 과제",
    assignedTo: "minji@example.com",
    assignedStudentName: "김민지",
    assignedStudentGrade: "고3",
    dueDate: "2026-04-14",
    createdAt: "2026-04-11",
    pdfName: "4월_1주차_독서.pdf",
    status: "assigned",
  },
  {
    id: "a2",
    title: "비문학 Daily 07",
    assignedTo: "junho@example.com",
    assignedStudentName: "이준호",
    assignedStudentGrade: "N수",
    dueDate: "2026-04-13",
    createdAt: "2026-04-10",
    pdfName: "daily_07.pdf",
    status: "submitted",
  },
  {
    id: "a3",
    title: "문학 선지 판단 훈련",
    assignedTo: "seoyeon@example.com",
    assignedStudentName: "박서연",
    assignedStudentGrade: "고2",
    dueDate: "2026-04-12",
    createdAt: "2026-04-09",
    pdfName: "문학_선지_훈련.pdf",
    status: "feedback_done",
  },
];

const mockSubmissions: Submission[] = [
  {
    id: "s1",
    studentName: "김민지",
    studentEmail: "minji@example.com",
    assignmentTitle: "4월 1주차 독서 과제",
    submittedAt: "2026-04-11 21:10",
    status: "submitted",
  },
  {
    id: "s2",
    studentName: "이준호",
    studentEmail: "junho@example.com",
    assignmentTitle: "비문학 Daily 07",
    submittedAt: "2026-04-11 19:45",
    status: "feedback_done",
  },
];

const mockFeedback: FeedbackItem[] = [
  {
    id: "f1",
    assignmentTitle: "4월 1주차 독서 과제",
    studentName: "김민지",
    createdAt: "2026-04-11",
    status: "waiting",
    isRead: false,
    summary:
      "문단별 핵심 요약은 좋아졌지만, 선지 판단 근거를 더 명확히 적어야 합니다.",
  },
  {
    id: "f2",
    assignmentTitle: "문학 선지 판단 훈련",
    studentName: "박서연",
    createdAt: "2026-04-10",
    status: "completed",
    isRead: true,
    summary: "보기 해석은 좋아졌고, 오답 선지 제거 속도를 더 올리면 좋겠습니다.",
  },
];

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    assigned: "bg-slate-100 text-slate-700",
    submitted: "bg-blue-50 text-blue-700",
    feedback_done: "bg-violet-50 text-violet-700",
    waiting: "bg-amber-50 text-amber-700",
    completed: "bg-emerald-50 text-emerald-700",
    active: "bg-emerald-50 text-emerald-700",
    paused: "bg-amber-50 text-amber-700",
    ended: "bg-slate-100 text-slate-700",
  };

  const labelMap: Record<string, string> = {
    assigned: "미제출",
    submitted: "제출완료",
    feedback_done: "피드백완료",
    waiting: "피드백 대기",
    completed: "피드백 완료",
    active: "수강중",
    paused: "일시중지",
    ended: "종료",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        colorMap[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {labelMap[status] ?? status}
    </span>
  );
}

function InfoCard(props: { title: string; value: string; sub?: string }) {
  const { title, value, sub } = props;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
      {sub ? <div className="mt-2 text-sm text-slate-500">{sub}</div> : null}
    </div>
  );
}

function SectionCard(props: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { title, description, action, children } = props;
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function PrimaryButton(props: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  const { children, onClick, type = "button", className = "", disabled = false } = props;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton(props: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const { children, onClick, className = "" } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${className}`}
    >
      {children}
    </button>
  );
}

function Sidebar(props: {
  role: Role;
  current: string;
  onChange: (key: string) => void;
}) {
  const { role, current, onChange } = props;
  const items = role === "admin" ? adminNav : studentNav;

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
      <div className="flex h-full flex-col">
        <div>
          <div className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            DELFI
          </div>
          <div className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            {role === "admin" ? "관리자 센터" : "학생 포털"}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            과제, 제출, 피드백을 한 곳에서 관리하는 학습 운영 웹
          </p>
        </div>

        <nav className="mt-8 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = current === item.key;

            return (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">운영 메모</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            MVP 단계에서는 과제 배포 → PDF 제출 → 피드백 회신 흐름만 빠르게 검증합니다.
          </p>
        </div>
      </div>
    </aside>
  );
}

function TopHeader(props: {
  title: string;
  description: string;
  role: Role;
  unreadCount: number;
  userEmail: string;
  onLogout: () => void;
}) {
  const { title, description, role, unreadCount, userEmail, onLogout } = props;

  return (
    <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <div className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
          {role === "admin" ? "관리자 모드" : "학생 모드"}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 hover:bg-slate-50">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500" />
          ) : null}
        </button>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {userEmail}
        </div>

        <SecondaryButton onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          로그아웃
        </SecondaryButton>
      </div>
    </header>
  );
}

function LoginScreen(props: {
  email: string;
  password: string;
  loading: boolean;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const {
    email,
    password,
    loading,
    error,
    onEmailChange,
    onPasswordChange,
    onLogin,
  } = props;

  return (
    <div className="min-h-screen bg-[#F8F7FB] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto grid min-h-[88vh] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden lg:flex flex-col justify-center">
          <div className="inline-flex w-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            DELFI
          </div>

          <h1 className="mt-6 text-5xl font-semibold leading-[1.15] tracking-tight text-slate-900 xl:text-6xl">
            <span className="text-slate-500">매일의 반복이,</span>
            <br />
            <span className="text-slate-900">내일을 만듭니다.</span>
          </h1>

          <p className="mt-6 text-base leading-7 text-slate-500">매일 받는 피드백, DELFI</p>

          <div className="mt-10 grid max-w-xl gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">과제 배포</div>
              <div className="mt-1 text-sm text-slate-500">
                매일 과제를 빠르게 업로드하고 학생별로 배정합니다.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">제출 관리</div>
              <div className="mt-1 text-sm text-slate-500">
                제출 여부와 제출 파일을 한 곳에서 확인합니다.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">피드백 기록</div>
              <div className="mt-1 text-sm text-slate-500">
                누적되는 피드백으로 학생의 성장을 관리합니다.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            로그인
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            DELFI 시작하기
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            계정으로 로그인하여 과제와 피드백을 확인하세요.
          </p>

          <form onSubmit={onLogin} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            매일의 반복과 피드백이 결과를 만듭니다.
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="등록 과제" value="12" sub="이번 주 기준" />
        <InfoCard title="오늘 제출" value="7" sub="최근 24시간" />
        <InfoCard title="미제출" value="5" sub="현재 마감 전/후 포함" />
        <InfoCard title="피드백 대기" value="3" sub="바로 처리 필요" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="최근 제출" description="가장 최근 도착한 학생 제출물">
          <div className="space-y-3">
            {mockSubmissions.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">{item.assignmentTitle}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {item.studentName} · {item.studentEmail}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-500">{item.submittedAt}</div>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="빠른 작업" description="자주 쓰는 기능 바로 이동">
          <div className="grid gap-3">
            <button className="rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50">
              <div className="font-semibold text-slate-900">새 과제 등록</div>
              <div className="mt-1 text-sm text-slate-500">
                PDF 업로드 후 학생에게 배정합니다.
              </div>
            </button>
            <button className="rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50">
              <div className="font-semibold text-slate-900">피드백 대기 확인</div>
              <div className="mt-1 text-sm text-slate-500">
                미처리 제출물부터 바로 확인합니다.
              </div>
            </button>
            <button className="rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50">
              <div className="font-semibold text-slate-900">학생별 현황 보기</div>
              <div className="mt-1 text-sm text-slate-500">
                학생별 과제·제출·피드백 이력을 봅니다.
              </div>
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function AdminAssignments() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard
        title="새 과제 등록"
        description="PDF를 업로드하고 학생을 이름/학년 기준으로 배정하세요."
        action={
          <PrimaryButton>
            <Plus className="h-4 w-4" /> 저장
          </PrimaryButton>
        }
      >
        <div className="grid gap-4">
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            placeholder="과제 제목"
          />

          <textarea
            className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            placeholder="과제 설명"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400">
              <option>학생 선택</option>
              {mockStudents.map((student) => (
                <option key={student.id}>
                  {student.name} / {student.grade}
                </option>
              ))}
            </select>

            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
              placeholder="배정 학생 이메일"
              value={mockStudents[0]?.email ?? ""}
              readOnly
            />
          </div>

          <input
            type="date"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
          />

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-violet-200 bg-violet-50 px-4 py-4 text-sm text-violet-700">
            <span className="font-medium">과제 PDF 업로드</span>
            <Upload className="h-4 w-4" />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="등록된 과제" description="최근 등록된 과제와 배정 학생 정보를 확인합니다.">
        <div className="space-y-3">
          {mockAssignments.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {item.assignedStudentName} · {item.assignedStudentGrade} · {item.assignedTo}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {item.pdfName} · 마감 {item.dueDate}
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function AdminSubmissions() {
  return (
    <SectionCard title="제출 관리" description="학생 제출물과 제출 상태를 확인합니다.">
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500">
          과제 필터
        </div>
        <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500">
          학생 필터
        </div>
        <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500">
          상태 필터
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Search className="h-4 w-4" /> 검색
        </button>
      </div>

      <div className="space-y-3">
        {mockSubmissions.map((item) => (
          <div
            key={item.id}
            className="grid gap-4 rounded-2xl border border-slate-100 p-4 lg:grid-cols-[1.2fr_0.7fr_0.6fr] lg:items-center"
          >
            <div>
              <div className="font-semibold text-slate-900">{item.assignmentTitle}</div>
              <div className="mt-1 text-sm text-slate-500">
                {item.studentName} · {item.studentEmail}
              </div>
            </div>
            <div className="text-sm text-slate-500">제출 시각 {item.submittedAt}</div>
            <div className="flex items-center gap-2 justify-start lg:justify-end">
              <StatusBadge status={item.status} />
              <SecondaryButton>
                <Download className="h-4 w-4" /> 제출 PDF
              </SecondaryButton>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function AdminFeedback() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <SectionCard title="피드백 대기" description="먼저 처리할 제출물부터 확인하세요.">
        <div className="space-y-3">
          {mockFeedback.map((item) => (
            <button
              key={item.id}
              className="w-full rounded-2xl border border-slate-100 p-4 text-left transition hover:bg-slate-50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{item.assignmentTitle}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {item.studentName} · {item.createdAt}
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="피드백 작성"
        description="텍스트 피드백 또는 피드백 PDF를 회신합니다."
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            선택된 제출물 정보가 이 영역에 표시됩니다.
          </div>

          <textarea
            className="min-h-52 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            placeholder="학생에게 전달할 피드백을 작성하세요."
          />

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-violet-200 bg-violet-50 px-4 py-4 text-sm text-violet-700">
            <span className="font-medium">피드백 PDF 업로드</span>
            <Upload className="h-4 w-4" />
          </label>

          <div className="flex flex-wrap gap-3">
            <PrimaryButton>피드백 저장</PrimaryButton>
            <SecondaryButton>피드백 완료 처리</SecondaryButton>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function AdminStudents() {
  return (
    <SectionCard title="학생 관리" description="학생별 이름, 학년, 연락처와 진행 현황을 확인합니다.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockStudents.map((student) => (
          <div key={student.id} className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-900">{student.name}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {student.grade} · {student.email}
                </div>
              </div>
              <StatusBadge status={student.status} />
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-500">
              <div>학교: {student.school || "-"}</div>
              <div>연락처: {student.phone || "-"}</div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-lg font-semibold text-slate-900">
                  {student.activeAssignments}
                </div>
                <div className="mt-1 text-xs text-slate-500">진행 과제</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-lg font-semibold text-slate-900">
                  {student.submittedCount}
                </div>
                <div className="mt-1 text-xs text-slate-500">제출 수</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <div className="text-lg font-semibold text-slate-900">
                  {student.feedbackDoneCount}
                </div>
                <div className="mt-1 text-xs text-slate-500">피드백</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function StudentAssignments() {
  return (
    <SectionCard title="내 과제" description="배정된 과제를 다운로드하고 제출할 수 있습니다.">
      <div className="grid gap-4 lg:grid-cols-2">
        {mockAssignments.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-900">{item.title}</div>
                <div className="mt-1 text-sm text-slate-500">
                  담당 학생: {item.assignedStudentName} · {item.assignedStudentGrade}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  마감 {item.dueDate} · {item.pdfName}
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <SecondaryButton>
                <Download className="h-4 w-4" /> 과제 PDF
              </SecondaryButton>
              <PrimaryButton>
                <Upload className="h-4 w-4" /> 제출하기
              </PrimaryButton>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function StudentSubmissions() {
  return (
    <SectionCard title="제출 내역" description="내가 제출한 파일과 제출 시간을 확인합니다.">
      <div className="space-y-3">
        {mockSubmissions.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="font-semibold text-slate-900">{item.assignmentTitle}</div>
              <div className="mt-1 text-sm text-slate-500">제출 시각 {item.submittedAt}</div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={item.status} />
              <SecondaryButton>
                <Download className="h-4 w-4" /> 제출 파일
              </SecondaryButton>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function StudentFeedback(props: {
  items: FeedbackItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { items, selectedId, onSelect } = props;
  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <SectionCard title="피드백 목록" description="새 피드백은 NEW 뱃지로 표시됩니다.">
        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selected?.id === item.id
                  ? "border-violet-300 bg-violet-50/50"
                  : "border-slate-100 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{item.assignmentTitle}</div>
                  <div className="mt-1 text-sm text-slate-500">도착일 {item.createdAt}</div>
                </div>

                <div className="flex items-center gap-2">
                  {!item.isRead ? (
                    <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
                      NEW
                    </span>
                  ) : null}
                  <StatusBadge status={item.status} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="피드백 상세" description="과제별 코치 피드백을 확인합니다.">
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-500">과제명</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                {selected.assignmentTitle}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-medium text-slate-500">코치 피드백</div>
              <div className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                {selected.summary || "등록된 피드백이 없습니다."}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <SecondaryButton>
                <Download className="h-4 w-4" /> 피드백 PDF
              </SecondaryButton>
              <SecondaryButton>
                <Download className="h-4 w-4" /> 제출 PDF
              </SecondaryButton>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-500">
            아직 확인할 피드백이 없습니다.
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function StudentProfile(props: { email: string }) {
  const { email } = props;

  return (
    <SectionCard title="내 정보" description="기본 계정 정보를 확인합니다.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-sm text-slate-500">역할</div>
          <div className="mt-2 font-semibold text-slate-900">학생</div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-sm text-slate-500">이메일</div>
          <div className="mt-2 font-semibold text-slate-900">{email}</div>
        </div>
      </div>
    </SectionCard>
  );
}

function LoadingScreen(props: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7FB] px-4">
      <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-violet-600" />
        <div className="mt-4 text-sm font-medium text-slate-700">{props.label}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(mockFeedback);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    mockFeedback[0]?.id ?? null
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      setLoginError("");

      try {
        if (!user) {
          setCurrentUserEmail("");
          setRole(null);
          setCurrentPage("dashboard");
          setAuthLoading(false);
          return;
        }

        const email = user.email || "";
        setCurrentUserEmail(email);

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        const nextRole: Role =
          userSnap.exists() && userSnap.data()?.role === "admin" ? "admin" : "student";

        setRole(nextRole);
        setCurrentPage(nextRole === "admin" ? "dashboard" : "assignments");
      } catch (error: any) {
        setLoginError(error?.message || "인증 정보를 불러오지 못했습니다.");
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const unreadCount = feedbackItems.filter((item) => !item.isRead).length;

  const pageMeta = useMemo(() => {
    if (role === "admin") {
      const map: Record<string, { title: string; description: string }> = {
        dashboard: {
          title: "대시보드",
          description: "오늘의 운영 현황과 빠른 작업을 확인합니다.",
        },
        assignments: {
          title: "과제 관리",
          description: "과제 PDF를 등록하고 학생에게 배정합니다.",
        },
        submissions: {
          title: "제출 관리",
          description: "학생 제출물과 제출 상태를 확인합니다.",
        },
        feedback: {
          title: "피드백 관리",
          description: "제출물에 대한 피드백을 작성하고 회신합니다.",
        },
        students: {
          title: "학생 관리",
          description: "학생별 과제·제출·피드백 이력을 봅니다.",
        },
      };

      return map[currentPage] ?? map.dashboard;
    }

    const map: Record<string, { title: string; description: string }> = {
      assignments: {
        title: "내 과제",
        description: "배정된 과제를 확인하고 제출합니다.",
      },
      submissions: {
        title: "제출 내역",
        description: "내가 제출한 과제를 다시 확인합니다.",
      },
      feedback: {
        title: "피드백",
        description: "도착한 피드백을 과제별로 확인합니다.",
      },
      profile: {
        title: "내 정보",
        description: "계정 정보를 확인하고 관리합니다.",
      },
    };

    return map[currentPage] ?? map.assignments;
  }, [role, currentPage]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("이메일과 비밀번호를 모두 입력하세요.");
      return;
    }

    try {
      setLoginLoading(true);
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      setLoginPassword("");
    } catch (error: any) {
      setLoginError(error?.message || "로그인에 실패했습니다.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoginEmail("");
      setLoginPassword("");
      setFeedbackItems(mockFeedback);
      setSelectedFeedbackId(mockFeedback[0]?.id ?? null);
    } catch (error: any) {
      setLoginError(error?.message || "로그아웃에 실패했습니다.");
    }
  };

  const renderAdminPage = () => {
    switch (currentPage) {
      case "assignments":
        return <AdminAssignments />;
      case "submissions":
        return <AdminSubmissions />;
      case "feedback":
        return <AdminFeedback />;
      case "students":
        return <AdminStudents />;
      default:
        return <AdminDashboard />;
    }
  };

  const renderStudentPage = () => {
    switch (currentPage) {
      case "submissions":
        return <StudentSubmissions />;
      case "feedback":
        return (
          <StudentFeedback
            items={feedbackItems}
            selectedId={selectedFeedbackId}
            onSelect={(id) => {
              setSelectedFeedbackId(id);
              setFeedbackItems((prev) =>
                prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
              );
            }}
          />
        );
      case "profile":
        return <StudentProfile email={currentUserEmail} />;
      default:
        return <StudentAssignments />;
    }
  };

  if (authLoading) {
    return <LoadingScreen label="DELFI 인증 정보를 불러오는 중입니다..." />;
  }

  if (!role) {
    return (
      <LoginScreen
        email={loginEmail}
        password={loginPassword}
        loading={loginLoading}
        error={loginError}
        onEmailChange={setLoginEmail}
        onPasswordChange={setLoginPassword}
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FB] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar role={role} current={currentPage} onChange={setCurrentPage} />
        <main className="min-w-0 flex-1 p-4 md:p-6 xl:p-8">
          <TopHeader
            title={pageMeta.title}
            description={pageMeta.description}
            role={role}
            unreadCount={role === "student" ? unreadCount : 0}
            userEmail={currentUserEmail}
            onLogout={handleLogout}
          />
          {role === "admin" ? renderAdminPage() : renderStudentPage()}
        </main>
      </div>
    </div>
  );
}