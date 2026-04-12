import React, { useEffect, useMemo, useState } from "react";
import {
  Home,
  FileText,
  Inbox,
  MessageSquare,
  Users,
  User,
  LogOut,
  Download,
  Upload,
  Plus,
  Search,
  Bell,
  Loader2,
} from "lucide-react";
import { auth, db, storage } from "./firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

// DELFI Web MVP Shell + Firebase Auth
// - 관리자/학생 페이지 분리
// - 웹 알림 UI
// - 실제 로그인/로그아웃/역할 분기 연결
// - 과제/제출/피드백 데이터는 아직 목업 기반

type Role = "admin" | "student";
type AssignmentStatus = "assigned" | "submitted" | "feedback_done";

type Assignment = {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedStudentName?: string;
  assignedStudentGrade?: string;
  dueDate: string;
  createdAt: string;
  pdfName: string;
  pdfUrl: string;
  status: AssignmentStatus;
};

type Submission = {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentEmail: string;
  studentName: string;
  submittedAt: string;
  pdfName: string;
  pdfUrl: string;
  status: "submitted" | "feedback_done";
};

type FeedbackItem = {
  id: string;
  assignmentTitle: string;
  studentName?: string;
  createdAt: string;
  status: "waiting" | "completed";
  isRead?: boolean;
  summary?: string;
};

type StudentRecord = {
  id: string;
  name: string;
  grade: "고1" | "고2" | "고3" | "N수";
  email: string;
  school?: string;
  phone?: string;
  status?: "active" | "paused" | "ended";
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
    pdfUrl: "",
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
    pdfUrl: "",
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
    pdfUrl: "",
    status: "feedback_done",
  },
];

const mockSubmissions: Submission[] = [];

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
    summary:
      "보기 해석은 좋아졌고, 오답 선지 제거 속도를 더 올리면 좋겠습니다.",
  },
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    assigned: "bg-slate-100 text-slate-700",
    submitted: "bg-blue-50 text-blue-700",
    feedback_done: "bg-violet-50 text-violet-700",
    waiting: "bg-amber-50 text-amber-700",
    completed: "bg-emerald-50 text-emerald-700",
  };

  const labelMap: Record<string, string> = {
    assigned: "미제출",
    submitted: "제출완료",
    feedback_done: "피드백완료",
    waiting: "피드백 대기",
    completed: "피드백 완료",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${map[status] || "bg-slate-100 text-slate-700"}`}
    >
      {labelMap[status] || status}
    </span>
  );
}

function InfoCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
      {sub ? <div className="mt-2 text-sm text-slate-500">{sub}</div> : null}
    </div>
  );
}

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function PrimaryButton({
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
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

function SecondaryButton({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
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

function Sidebar({
  role,
  current,
  onChange,
}: {
  role: Role;
  current: string;
  onChange: (key: string) => void;
}) {
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

function TopHeader({
  title,
  description,
  role,
  unreadCount,
  userEmail,
  onLogout,
}: {
  title: string;
  description: string;
  role: Role;
  unreadCount: number;
  userEmail: string;
  onLogout: () => void;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <div className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
          {role === "admin" ? "관리자 모드" : "학생 모드"}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
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

function LoginScreen({
  email,
  password,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onLogin,
}: {
  email: string;
  password: string;
  loading: boolean;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: (e: React.FormEvent) => void;
}) {
  return (
    <div className="min-h-screen bg-[#F8F7FB] px-4 py-10">
      <div className="mx-auto grid min-h-[88vh] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* LEFT BRAND AREA */}
        <div className="hidden lg:flex flex-col justify-center">
          <div className="inline-flex w-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            DELFI
          </div>

          <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight text-slate-900">
            <span className="text-slate-500">반복하는 매일이,</span>
            <br />
            <span className="text-slate-900">내일을 만든다.</span>
          </h1>

          <p className="mt-6 text-base leading-7 text-slate-500">
            매일 받는 피드백, DELFI
          </p>

          <div className="mt-10 grid max-w-xl gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">과제 배포</div>
              <div className="mt-1 text-sm text-slate-500">PDF 기반으로 빠르게 전달</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">제출 관리</div>
              <div className="mt-1 text-sm text-slate-500">학생별 상태 한눈에 확인</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">피드백</div>
              <div className="mt-1 text-sm text-slate-500">누적되는 성장 데이터</div>
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN CARD */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            로그인
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            DELFI 시작하기
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            계정으로 로그인하여 과제와 피드백을 확인하세요.
          </p>

          <form onSubmit={onLogin} className="mt-8 space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="이메일"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="비밀번호"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <PrimaryButton type="submit" className="w-full" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </PrimaryButton>
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

function AdminAssignments({
  assignments,
  students,
  onSave,
  saving,
  saveError,
  saveSuccess,
}: {
  assignments: Assignment[];
  students: StudentRecord[];
  onSave: (payload: {
    title: string;
    description: string;
    studentEmail: string;
    dueDate: string;
    pdfFile: File | null;
  }) => Promise<void>;
  saving: boolean;
  saveError: string;
  saveSuccess: string;
}) {
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [selectedStudentEmail, setSelectedStudentEmail] = useState("");
  const [dueDate, setDueDate] = useState("2026-04-12");
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);

  const selectedStudent =
  students.find((student) => student.email === selectedStudentEmail) ?? null;

  const handleStudentChange = (value: string) => {
    setSelectedStudentEmail(value);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedPdfFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSave({
      title: assignmentTitle,
      description: assignmentDescription,
      studentEmail: selectedStudentEmail,
      dueDate,
      pdfFile: selectedPdfFile,
    });

    if (
      assignmentTitle.trim() &&
      selectedStudentEmail &&
      dueDate &&
      selectedPdfFile
    ) {
      setAssignmentTitle("");
      setAssignmentDescription("");
      setDueDate("2026-04-12");
      setSelectedPdfFile(null);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard
        title="새 과제 등록"
        description="PDF를 업로드하고 학생을 이름/학년 기준으로 배정하세요."
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            placeholder="과제 제목"
          />

          <textarea
            value={assignmentDescription}
            onChange={(e) => setAssignmentDescription(e.target.value)}
            className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            placeholder="과제 설명"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={selectedStudentEmail}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400"
            >
              <option value="">학생 선택</option>
{students.map((student) => (
  <option key={student.id} value={student.email}>
    {student.name} / {student.grade}
  </option>
))}
            </select>

            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
              placeholder="배정 학생 이메일"
              value={selectedStudentEmail}
              readOnly
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">과제 마감일</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-violet-200 bg-violet-50 px-4 py-4 text-sm text-violet-700 transition hover:bg-violet-100">
            <span className="font-medium">
              {selectedPdfFile ? selectedPdfFile.name : "과제 PDF 업로드"}
            </span>
            <Upload className="h-4 w-4" />
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handlePdfChange}
            />
          </label>

          {saveError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {saveError}
            </div>
          ) : null}

          {saveSuccess ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {saveSuccess}
            </div>
          ) : null}

          <PrimaryButton type="submit" className="w-full" disabled={saving}>
            <Plus className="h-4 w-4" /> {saving ? "저장 중..." : "저장"}
          </PrimaryButton>
        </form>
      </SectionCard>

      <SectionCard
        title="등록된 과제"
        description="최근 등록된 과제와 배정 학생 정보를 확인합니다."
      >
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              아직 등록된 과제가 없습니다.
            </div>
          ) : (
            assignments.map((item) => (
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
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4" /> PDF
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function AdminSubmissions({
  submissions,
}: {
  submissions: Submission[];
}) {
  return (
    <SectionCard
      title="제출 관리"
      description="학생들이 제출한 과제를 확인합니다."
    >
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-500">
            아직 제출된 과제가 없습니다.
          </div>
        ) : (
          submissions.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div>
                <div className="font-semibold text-slate-900">
                  {item.assignmentTitle}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {item.studentName} · {item.studentEmail}
                </div>
                <div className="text-xs text-slate-400">
                  제출일 {item.submittedAt}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={item.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-violet-600 hover:underline"
                >
                  PDF 보기
                </a>
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))
        )}
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

      <SectionCard title="피드백 작성" description="텍스트 피드백 또는 피드백 PDF를 회신합니다.">
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

function StudentDetail({
  student,
  assignments,
  submissions,
  onBack,
}: {
  student: StudentRecord;
  assignments: Assignment[];
  submissions: Submission[];
  onBack: () => void;
}) {
  const studentAssignments = assignments.filter(
    (item) => item.assignedTo === student.email
  );

  const studentSubmissions = submissions.filter(
    (item) => item.studentEmail === student.email
  );

  const getSubmissionForAssignment = (assignmentId: string) => {
    return (
      studentSubmissions.find((item) => item.assignmentId === assignmentId) ?? null
    );
  };

  return (
    <SectionCard
      title={`${student.name} 상세`}
      description="학생별 과제, 제출 현황을 한눈에 확인합니다."
      action={
        <SecondaryButton onClick={onBack}>
          돌아가기
        </SecondaryButton>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard title="이름" value={student.name} sub={student.grade} />
          <InfoCard title="이메일" value={student.email} />
          <InfoCard title="제출 수" value={String(studentSubmissions.length)} />
          <InfoCard
            title="피드백 완료"
            value={String(
              studentSubmissions.filter((item) => item.status === "feedback_done").length
            )}
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-lg font-semibold text-slate-900">배정 과제</div>

          <div className="mt-4 space-y-3">
            {studentAssignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                아직 배정된 과제가 없습니다.
              </div>
            ) : (
              studentAssignments.map((assignment) => {
                const submission = getSubmissionForAssignment(assignment.id);

                return (
                  <div
                    key={assignment.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {assignment.title}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          마감 {assignment.dueDate} · {assignment.pdfName}
                        </div>
                      </div>

                      <StatusBadge status={submission ? submission.status : "assigned"} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={assignment.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Download className="h-4 w-4" /> 과제 PDF
                      </a>

                      {submission ? (
                        <a
                          href={submission.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Download className="h-4 w-4" /> 제출 PDF
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function AdminStudents({
  students,
  submissions,
  assignments,
  selectedStudentEmail,
  onSelectStudent,
  onBack,
}: {
  students: StudentRecord[];
  submissions: Submission[];
  assignments: Assignment[];
  selectedStudentEmail: string | null;
  onSelectStudent: (email: string) => void;
  onBack: () => void;
}) {
  const selectedStudent =
  students.find((student) => student.email === selectedStudentEmail) ?? null;

if (selectedStudent) {
  return (
    <StudentDetail
      student={selectedStudent}
      assignments={assignments}
      submissions={submissions}
      onBack={onBack}
    />
  );
}
  const getStudentStats = (studentEmail: string) => {
    const studentSubs = submissions.filter(
      (item) => item.studentEmail === studentEmail
    );

    return {
      total: studentSubs.length,
      submitted: studentSubs.filter((s) => s.status === "submitted").length,
      feedbackDone: studentSubs.filter((s) => s.status === "feedback_done").length,
    };
  };

  return (
    <SectionCard title="학생 관리" description="학생별 학습 현황을 확인하고 관리합니다.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {students.map((student) => {
          const stats = getStudentStats(student.email);

          return (
            <button
  key={student.id}
  onClick={() => onSelectStudent(student.email)}
  className="rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-md transition cursor-pointer text-left"
>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">
                    {student.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {student.grade} · {student.email}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-sm text-slate-500">제출</div>
                  <div className="font-semibold">{stats.submitted}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">피드백</div>
                  <div className="font-semibold">{stats.feedbackDone}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">총 제출</div>
                  <div className="font-semibold">{stats.total}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function StudentAssignments({
  assignments,
  currentUserEmail,
  onSubmitAssignment,
  submissionSaveLoading,
  submissionSaveError,
  submissionSaveSuccess,
}: {
  assignments: Assignment[];
  currentUserEmail: string;
  onSubmitAssignment: (payload: {
    assignment: Assignment;
    pdfFile: File | null;
  }) => Promise<void>;
  submissionSaveLoading: boolean;
  submissionSaveError: string;
  submissionSaveSuccess: string;
}) {
  const myAssignments = assignments.filter(
    (item) => item.assignedTo === currentUserEmail
  );

  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});

  const handleFileChange = (assignmentId: string, file: File | null) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [assignmentId]: file,
    }));
  };

  return (
    <SectionCard title="내 과제" description="배정된 과제를 다운로드하고 제출할 수 있습니다.">
      <div className="grid gap-4 lg:grid-cols-2">
        {myAssignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-500">
            아직 배정된 과제가 없습니다.
          </div>
        ) : (
          myAssignments.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    마감 {item.dueDate} · {item.pdfName}
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={item.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" /> 과제 PDF
                </a>
              </div>

              <div className="mt-4 grid gap-3">
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-violet-200 bg-violet-50 px-4 py-4 text-sm text-violet-700 transition hover:bg-violet-100">
                  <span className="font-medium">
                    {selectedFiles[item.id]?.name ?? "완료한 PDF 선택"}
                  </span>
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(item.id, e.target.files?.[0] ?? null)}
                  />
                </label>

                <PrimaryButton
                  onClick={() =>
                    onSubmitAssignment({
                      assignment: item,
                      pdfFile: selectedFiles[item.id] ?? null,
                    })
                  }
                  disabled={submissionSaveLoading}
                >
                  <Upload className="h-4 w-4" />
                  {submissionSaveLoading ? "제출 중..." : "제출하기"}
                </PrimaryButton>

                {submissionSaveError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {submissionSaveError}
                  </div>
                ) : null}

                {submissionSaveSuccess ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {submissionSaveSuccess}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}

function StudentSubmissions({
  submissions,
  currentUserEmail,
}: {
  submissions: Submission[];
  currentUserEmail: string;
}) {
  const mySubmissions = submissions.filter(
    (item) => item.studentEmail === currentUserEmail
  );

  return (
    <SectionCard title="제출 내역" description="내가 제출한 과제를 확인합니다.">
      <div className="space-y-4">
        {mySubmissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-sm text-slate-500">
            아직 제출한 과제가 없습니다.
          </div>
        ) : (
          mySubmissions.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div>
                <div className="font-semibold text-slate-900">
                  {item.assignmentTitle}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  제출일 {item.submittedAt}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={item.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-violet-600 hover:underline"
                >
                  PDF 보기
                </a>
                <StatusBadge status={item.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}

function StudentFeedback({
  items,
  selectedId,
  onSelect,
}: {
  items: FeedbackItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
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

function StudentProfile({ email }: { email: string }) {
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

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7FB] px-4">
      <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-violet-600" />
        <div className="mt-4 text-sm font-medium text-slate-700">{label}</div>
      </div>
    </div>
  );
}

export default function DelfiWebMvpShell() {
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [currentPage, setCurrentPage] = useState<string>("dashboard");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
const [submissionsLoading, setSubmissionsLoading] = useState(false);
const [submissionSaveLoading, setSubmissionSaveLoading] = useState(false);
const [submissionSaveError, setSubmissionSaveError] = useState("");
const [submissionSaveSuccess, setSubmissionSaveSuccess] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
const [assignmentsLoading, setAssignmentsLoading] = useState(false);
const [assignmentSaveLoading, setAssignmentSaveLoading] = useState(false);
const [assignmentSaveError, setAssignmentSaveError] = useState("");
const [assignmentSaveSuccess, setAssignmentSaveSuccess] = useState("");
const [selectedStudentEmail, setSelectedStudentEmail] = useState<string | null>(null);

  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(mockFeedback);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    mockFeedback[0]?.id ?? null
  );

  const loadStudents = async () => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const snapshot = await getDocs(q);

    const list: StudentRecord[] = snapshot.docs.map((docItem) => {
      const data = docItem.data() as Partial<StudentRecord>;

      return {
        id: docItem.id,
        name: data.name || "이름 없음",
        grade: (data.grade as StudentRecord["grade"]) || "고3",
        email: data.email || "",
        school: data.school || "-",
        phone: data.phone || "-",
        status: data.status || "active",
        activeAssignments: data.activeAssignments || 0,
        submittedCount: data.submittedCount || 0,
        feedbackDoneCount: data.feedbackDoneCount || 0,
      };
    });

    setStudents(list);
  } catch (error) {
    console.error("학생 불러오기 실패:", error);
  }
};

  const loadAssignments = async () => {
    setAssignmentsLoading(true);
    try {
      const q = query(collection(db, "assignments"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const list: Assignment[] = snapshot.docs.map((docItem) => {
        const data = docItem.data() as Omit<Assignment, "id">;
        return {
          id: docItem.id,
          ...data,
        };
      });

      setAssignments(list);
    } catch (error) {
      console.error("과제 불러오기 실패:", error);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const loadSubmissions = async () => {
  setSubmissionsLoading(true);
  try {
    const q = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
    const snapshot = await getDocs(q);

    const list: Submission[] = snapshot.docs.map((docItem) => {
      const data = docItem.data() as Omit<Submission, "id">;
      return {
        id: docItem.id,
        ...data,
      };
    });

    setSubmissions(list);
  } catch (error) {
    console.error("제출 불러오기 실패:", error);
  } finally {
    setSubmissionsLoading(false);
  }
};

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

        const nextRole: Role = userSnap.exists() && userSnap.data()?.role === "admin"
          ? "admin"
          : "student";

        setRole(nextRole);
        setCurrentPage(nextRole === "admin" ? "dashboard" : "assignments");
        await Promise.all([loadStudents(), loadAssignments(), loadSubmissions()]);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
    setLoginError("아이디 또는 비밀번호를 확인하세요.");
    return;
  }

    try {
      setLoginLoading(true);
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      setLoginPassword("");
    } catch (error: any) {
  setLoginError("아이디 또는 비밀번호를 확인하세요.");
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
  setLoginError("아이디 또는 비밀번호를 확인하세요.");
}
  };

  const handleSaveAssignment = async ({
  title,
  description,
  studentEmail,
  dueDate,
  pdfFile,
}: {
  title: string;
  description: string;
  studentEmail: string;
  dueDate: string;
  pdfFile: File | null;
}) => {
  setAssignmentSaveError("");
  setAssignmentSaveSuccess("");

  if (!title.trim()) {
    setAssignmentSaveError("과제 제목을 입력하세요.");
    return;
  }

  if (!studentEmail) {
    setAssignmentSaveError("학생을 선택하세요.");
    return;
  }

  if (!dueDate) {
    setAssignmentSaveError("과제 마감일을 선택하세요.");
    return;
  }

  if (!pdfFile) {
    setAssignmentSaveError("PDF 파일을 선택하세요.");
    return;
  }

  try {
    setAssignmentSaveLoading(true);

    const student =
  students.find((item) => item.email === studentEmail) ?? null;

    const safeFileName = `${Date.now()}_${pdfFile.name.replace(/\s+/g, "_")}`;
    const storageRef = ref(storage, `assignments/${studentEmail}/${safeFileName}`);

    await uploadBytes(storageRef, pdfFile);
    const pdfUrl = await getDownloadURL(storageRef);

    await addDoc(collection(db, "assignments"), {
      title: title.trim(),
      description: description.trim(),
      assignedTo: studentEmail,
      assignedStudentName: student?.name ?? "",
      assignedStudentGrade: student?.grade ?? "",
      dueDate,
      createdAt: new Date().toISOString(),
      pdfName: pdfFile.name,
      pdfUrl,
      status: "assigned",
    });

    setAssignmentSaveSuccess("과제가 저장되었습니다.");
    await loadAssignments();
  } catch (error: any) {
    setAssignmentSaveError(error?.message || "과제 저장 중 오류가 발생했습니다.");
  } finally {
    setAssignmentSaveLoading(false);
  }
};

const handleSubmitAssignment = async ({
  assignment,
  pdfFile,
}: {
  assignment: Assignment;
  pdfFile: File | null;
}) => {
  setSubmissionSaveError("");
  setSubmissionSaveSuccess("");

  if (!pdfFile) {
    setSubmissionSaveError("제출할 PDF 파일을 선택하세요.");
    return;
  }

  try {
    setSubmissionSaveLoading(true);

    const safeFileName = `${Date.now()}_${pdfFile.name.replace(/\s+/g, "_")}`;
    const storageRef = ref(
      storage,
      `submissions/${currentUserEmail}/${assignment.id}/${safeFileName}`
    );

    await uploadBytes(storageRef, pdfFile);
    const pdfUrl = await getDownloadURL(storageRef);

    const student =
      students.find((item) => item.email === currentUserEmail) ?? null;

    await addDoc(collection(db, "submissions"), {
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      studentEmail: currentUserEmail,
      studentName: student?.name ?? currentUserEmail,
      submittedAt: new Date().toISOString(),
      pdfName: pdfFile.name,
      pdfUrl,
      status: "submitted",
    });

    setSubmissionSaveSuccess("과제가 제출되었습니다.");
    await loadSubmissions();
    await loadAssignments();
  } catch (error: any) {
    setSubmissionSaveError(error?.message || "과제 제출 중 오류가 발생했습니다.");
  } finally {
    setSubmissionSaveLoading(false);
  }
};

  const renderPage = () => {
    if (role === "admin") {
      switch (currentPage) {
        case "assignments":
          return (
  <AdminAssignments
  assignments={assignments}
  students={students}
  onSave={handleSaveAssignment}
  saving={assignmentSaveLoading}
  saveError={assignmentSaveError}
  saveSuccess={assignmentSaveSuccess}
/>
);
        case "submissions":
  return (
    <AdminSubmissions
      submissions={submissions}
    />
  );
        case "feedback":
          return <AdminFeedback />;
        case "students":
  return (
    <AdminStudents
      students={students}
      submissions={submissions}
      assignments={assignments}
      selectedStudentEmail={selectedStudentEmail}
      onSelectStudent={setSelectedStudentEmail}
      onBack={() => setSelectedStudentEmail(null)}
    />
  );
        default:
          return <AdminDashboard />;
      }
    }

    switch (currentPage) {
      case "submissions":
  return (
    <StudentSubmissions
      submissions={submissions}
      currentUserEmail={currentUserEmail}
    />
  );
      case "feedback":
        return (
          <StudentFeedback
            items={feedbackItems}
            selectedId={selectedFeedbackId}
            onSelect={(id) => {
              setSelectedFeedbackId(id);
              setFeedbackItems((prev) =>
                prev.map((item) =>
                  item.id === id ? { ...item, isRead: true } : item
                )
              );
            }}
          />
        );
      case "profile":
        return <StudentProfile email={currentUserEmail} />;
      default:
        return (
  <StudentAssignments
    assignments={assignments}
    currentUserEmail={currentUserEmail}
    onSubmitAssignment={handleSubmitAssignment}
    submissionSaveLoading={submissionSaveLoading}
    submissionSaveError={submissionSaveError}
    submissionSaveSuccess={submissionSaveSuccess}
  />
);
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
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
