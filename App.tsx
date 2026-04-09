import { useEffect, useMemo, useState } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";

type Passage = {
  id: string;
  title: string;
  text: string;
};

type Question = {
  id: string;
  passageId: string;
  questionText: string;
  choices: string[];
  correctAnswer: number; // 0~4
};

type Assignment = {
  id: string;
  title: string;
  pdfName: string;
  createdBy: string;
  createdByEmail: string;
  assignedTo: string;
  createdAt: string;
  passages: Passage[];
  questions: Question[];
};

type Submission = {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentEmail: string;
  answers: Record<string, number>;
  submittedAt: string;
  score: number;
  totalQuestions: number;
  feedback: string;
  percentage: number;
  resultDetails: {
    questionId: string;
    questionText: string;
    studentAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    passageId: string;
  }[];
};

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserUid, setCurrentUserUid] = useState("");
  const [userRole, setUserRole] = useState("");

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});

  // 관리자 - 과제 생성
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignedEmail, setAssignedEmail] = useState("");
  const [pdfName, setPdfName] = useState("");

  // 관리자 - 지문 등록
  const [passageTitle, setPassageTitle] = useState("");
  const [passageText, setPassageText] = useState("");
  const [draftPassages, setDraftPassages] = useState<Passage[]>([]);

  // 관리자 - 문제 등록
  const [selectedPassageId, setSelectedPassageId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [choice1, setChoice1] = useState("");
  const [choice2, setChoice2] = useState("");
  const [choice3, setChoice3] = useState("");
  const [choice4, setChoice4] = useState("");
  const [choice5, setChoice5] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("1");
  const [draftQuestions, setDraftQuestions] = useState<Question[]>([]);

  // 학생 풀이
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, number>>({});
  const [lastSubmissionResult, setLastSubmissionResult] = useState<Submission | null>(null);

  const loadAssignments = async () => {
    const snapshot = await getDocs(collection(db, "assignments"));
    const list: Assignment[] = [];

    snapshot.forEach((docItem) => {
      const data = docItem.data() as Omit<Assignment, "id">;
      list.push({
        id: docItem.id,
        ...data,
      });
    });

    setAssignments(list);
  };

  const loadSubmissions = async () => {
    const snapshot = await getDocs(collection(db, "submissions"));
    const list: Submission[] = [];

    snapshot.forEach((docItem) => {
      const data = docItem.data() as Omit<Submission, "id">;
      list.push({
        id: docItem.id,
        ...data,
      });
    });

    setSubmissions(list);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUserEmail(user.email || "");
          setCurrentUserUid(user.uid);

          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserRole(userData.role || "student");
          } else {
            setUserRole("student");
          }

          await loadAssignments();
          await loadSubmissions();
        } else {
          setCurrentUserEmail("");
          setCurrentUserUid("");
          setUserRole("");
          setAssignments([]);
          setSubmissions([]);
          setSelectedAssignment(null);
          setStudentAnswers({});
          setLastSubmissionResult(null);
        }
      } catch (error: any) {
        setMessage("초기 로딩 실패: " + error.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        role: "student",
        createdAt: new Date().toISOString(),
      });

      setMessage(`회원가입 성공: ${userCredential.user.email}`);
    } catch (error: any) {
      setMessage(`회원가입 실패: ${error.message}`);
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setMessage(`로그인 성공: ${userCredential.user.email}`);
    } catch (error: any) {
      setMessage(`로그인 실패: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMessage("로그아웃 성공");
    } catch (error: any) {
      setMessage(`로그아웃 실패: ${error.message}`);
    }
  };

  const handlePdfPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfName(file.name);
      setMessage(`PDF 선택됨: ${file.name}`);
    }
  };

  const handleAddPassage = () => {
    if (!passageTitle.trim()) {
      setMessage("지문 제목을 입력하세요.");
      return;
    }

    if (!passageText.trim()) {
      setMessage("지문 내용을 입력하세요.");
      return;
    }

    const newPassage: Passage = {
      id: Date.now().toString(),
      title: passageTitle,
      text: passageText,
    };

    setDraftPassages((prev) => [...prev, newPassage]);

    if (!selectedPassageId) {
      setSelectedPassageId(newPassage.id);
    }

    setPassageTitle("");
    setPassageText("");
    setMessage("지문 추가 완료");
  };

  const handleAddQuestion = () => {
    if (draftPassages.length === 0) {
      setMessage("지문을 하나 이상 추가해야 합니다.");
      return;
    }

    if (!selectedPassageId) {
      setMessage("문제를 연결할 지문을 선택하세요.");
      return;
    }

    if (!questionText.trim()) {
      setMessage("문제 내용을 입력하세요.");
      return;
    }

    if (
      !choice1.trim() ||
      !choice2.trim() ||
      !choice3.trim() ||
      !choice4.trim() ||
      !choice5.trim()
    ) {
      setMessage("선지 5개를 모두 입력하세요.");
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      passageId: selectedPassageId,
      questionText,
      choices: [choice1, choice2, choice3, choice4, choice5],
      correctAnswer: Number(correctAnswer) - 1,
    };

    setDraftQuestions((prev) => [...prev, newQuestion]);

    setQuestionText("");
    setChoice1("");
    setChoice2("");
    setChoice3("");
    setChoice4("");
    setChoice5("");
    setCorrectAnswer("1");
    setMessage("문제 추가 완료");
  };

  const handleCreateAssignment = async () => {
    if (!assignmentTitle.trim()) {
      setMessage("과제 제목을 입력하세요.");
      return;
    }

    if (draftPassages.length === 0) {
      setMessage("최소 1개 이상의 지문이 필요합니다.");
      return;
    }

    if (draftQuestions.length === 0) {
      setMessage("최소 1개 이상의 문제가 필요합니다.");
      return;
    }

    try {
      await addDoc(collection(db, "assignments"), {
        title: assignmentTitle,
        pdfName,
        assignedTo: assignedEmail,
        createdBy: currentUserUid,
        createdByEmail: currentUserEmail,
        createdAt: new Date().toISOString(),
        passages: draftPassages,
        questions: draftQuestions,
      });

      setAssignmentTitle("");
      setPdfName("");
      setDraftPassages([]);
      setDraftQuestions([]);
      setSelectedPassageId("");
      setMessage("과제 저장 성공");
      await loadAssignments();
    } catch (error: any) {
      setMessage(`과제 저장 실패: ${error.message}`);
    }
  };

  const handleSelectAnswer = (questionId: string, choiceIndex: number) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [questionId]: choiceIndex,
    }));
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;

    if (selectedAssignment.questions.length === 0) {
      setMessage("문제가 없는 과제입니다.");
      return;
    }

    for (const q of selectedAssignment.questions) {
      if (studentAnswers[q.id] === undefined) {
        setMessage("모든 문제에 답해야 제출할 수 있습니다.");
        return;
      }
    }

    try {
      let score = 0;

      const resultDetails = selectedAssignment.questions.map((q) => {
        const studentAnswer = studentAnswers[q.id];
        const isCorrect = studentAnswer === q.correctAnswer;
        if (isCorrect) score += 1;

        return {
          questionId: q.id,
          questionText: q.questionText,
          studentAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          passageId: q.passageId,
        };
      });

      const totalQuestions = selectedAssignment.questions.length;
      const percentage = Math.round((score / totalQuestions) * 100);

      const submissionData = {
        assignmentId: selectedAssignment.id,
        assignmentTitle: selectedAssignment.title,
        studentId: currentUserUid,
        studentEmail: currentUserEmail,
        answers: studentAnswers,
        submittedAt: new Date().toISOString(),
        feedback: "",
        score,
        totalQuestions,
        percentage,
        resultDetails,
      };

      const docRef = await addDoc(collection(db, "submissions"), submissionData);

      const resultWithId: Submission = {
        id: docRef.id,
        ...submissionData,
      };

      setLastSubmissionResult(resultWithId);
      setMessage("제출 완료");
      setSelectedAssignment(null);
      setStudentAnswers({});
      await loadSubmissions();
    } catch (error: any) {
      setMessage(`제출 실패: ${error.message}`);
    }
  };

  const stats = useMemo(() => {
    const totalAssignments = assignments.length;
    const totalSubmissions = submissions.length;
    const avgScore =
      submissions.length > 0
        ? Math.round(
            submissions.reduce((sum, item) => sum + item.percentage, 0) / submissions.length
          )
        : 0;

    return { totalAssignments, totalSubmissions, avgScore };
  }, [assignments, submissions]);

  const getPassageTitle = (assignment: Assignment, passageId: string) => {
    return assignment.passages.find((p) => p.id === passageId)?.title || "지문";
  };

  if (loading) {
    return (
      <div style={styles.appShell}>
        <div style={styles.centerCard}>
          <h2 style={styles.centerTitle}>불러오는 중...</h2>
          <p style={styles.muted}>데이터를 가져오고 있습니다.</p>
        </div>
      </div>
    );
  }

  if (currentUserEmail && userRole === "admin") {
    return (
      <div style={styles.appShell}>
        <div style={styles.dashboardWrap}>
          <div style={styles.topBar}>
            <div>
              <div style={styles.badgeBlue}>관리자 모드</div>
              <h1 style={styles.pageTitle}>DELFI 콘텐츠 등록</h1>
              <p style={styles.subText}>
                {currentUserEmail} · 지문/문항 등록
              </p>
            </div>
            <button style={styles.ghostButton} onClick={handleLogout}>
              로그아웃
            </button>
          </div>

          {!!message && <div style={styles.notice}>{message}</div>}

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>등록된 과제</div>
              <div style={styles.statValue}>{stats.totalAssignments}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>총 제출 수</div>
              <div style={styles.statValue}>{stats.totalSubmissions}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>평균 정답률</div>
              <div style={styles.statValue}>{stats.avgScore}%</div>
            </div>
          </div>

          <div style={styles.twoCol}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>1. 과제 기본 정보</h2>
              <p style={styles.cardDesc}>PDF를 참고해서 과제 세트 만들기.</p>

              <input
                type="text"
                placeholder="예: 2025 6월 모의고사 독서 1세트"
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
                style={styles.input}
              />

              <input
  type="text"
  placeholder="배정할 학생 이메일"
  value={assignedEmail}
  onChange={(e) => setAssignedEmail(e.target.value)}
  style={styles.input}
/>
              
              <div style={styles.pdfBox}>
                <div style={styles.pdfLabel}>PDF 참고 파일</div>
                <input type="file" accept="application/pdf" onChange={handlePdfPick} />
                <div style={styles.pdfFileName}>
                  {pdfName ? `선택된 PDF: ${pdfName}` : "아직 선택된 PDF 없음"}
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>2. 지문 등록</h2>
              <p style={styles.cardDesc}>PDF를 보면서 지문 제목과 내용을 추가하세요.</p>

              <input
                type="text"
                placeholder="지문 제목 (예: [지문 1] 데이터 경제)"
                value={passageTitle}
                onChange={(e) => setPassageTitle(e.target.value)}
                style={styles.input}
              />

              <textarea
                placeholder="지문 내용을 붙여넣기"
                value={passageText}
                onChange={(e) => setPassageText(e.target.value)}
                style={styles.largeTextarea}
              />

              <button style={styles.secondaryButton} onClick={handleAddPassage}>
                지문 추가
              </button>
            </div>
          </div>

          <div style={styles.twoCol}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>3. 문제 등록</h2>
              <p style={styles.cardDesc}>어느 지문에 달린 문제인지 연결해서 입력하세요.</p>

              <div style={styles.inlineFieldColumn}>
                <span style={styles.inlineLabel}>연결할 지문 선택</span>
                <select
                  value={selectedPassageId}
                  onChange={(e) => setSelectedPassageId(e.target.value)}
                  style={styles.selectWide}
                >
                  <option value="">지문 선택</option>
                  {draftPassages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                placeholder="문제 내용을 입력하세요"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                style={styles.textarea}
              />

              <div style={styles.choiceGrid}>
                <input
                  type="text"
                  placeholder="선지 1"
                  value={choice1}
                  onChange={(e) => setChoice1(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="선지 2"
                  value={choice2}
                  onChange={(e) => setChoice2(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="선지 3"
                  value={choice3}
                  onChange={(e) => setChoice3(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="선지 4"
                  value={choice4}
                  onChange={(e) => setChoice4(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="선지 5"
                  value={choice5}
                  onChange={(e) => setChoice5(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.rowBetween}>
                <div style={styles.inlineField}>
                  <span style={styles.inlineLabel}>정답</span>
                  <select
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    style={styles.select}
                  >
                    <option value="1">1번</option>
                    <option value="2">2번</option>
                    <option value="3">3번</option>
                    <option value="4">4번</option>
                    <option value="5">5번</option>
                  </select>
                </div>

                <button style={styles.secondaryButton} onClick={handleAddQuestion}>
                  문제 추가
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>4. 저장 전 미리보기</h2>
              <p style={styles.cardDesc}>지문과 문항 구조가 잘 잡혔는지 확인하세요.</p>

              <div style={styles.previewSection}>
                <h3 style={styles.sectionTitle}>등록된 지문</h3>
                {draftPassages.length === 0 ? (
                  <div style={styles.emptyBox}>아직 추가된 지문이 없습니다.</div>
                ) : (
                  <div style={styles.listStack}>
                    {draftPassages.map((p, index) => (
                      <div key={p.id} style={styles.passagePreviewCard}>
                        <div style={styles.questionIndex}>지문 {index + 1}</div>
                        <div style={styles.assignmentTitle}>{p.title}</div>
                        <div style={styles.passageTextPreview}>{p.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.previewSection}>
                <h3 style={styles.sectionTitle}>등록된 문제</h3>
                {draftQuestions.length === 0 ? (
                  <div style={styles.emptyBox}>아직 추가된 문제가 없음</div>
                ) : (
                  <div style={styles.listStack}>
                    {draftQuestions.map((q, index) => (
                      <div key={q.id} style={styles.questionPreviewCard}>
                        <div style={styles.questionIndex}>문제 {index + 1}</div>
                        <div style={styles.assignmentMeta}>
                          연결 지문: {getPassageTitle({ id: "", title: "", pdfName: "", createdAt: "", createdBy: "", createdByEmail: "", passages: draftPassages, questions: draftQuestions }, q.passageId)}
                        </div>
                        <div style={styles.questionText}>{q.questionText}</div>
                        <div style={styles.choiceList}>
                          {q.choices.map((choice, i) => (
                            <div key={i} style={styles.choiceItem}>
                              {i + 1}번. {choice}
                            </div>
                          ))}
                        </div>
                        <div style={styles.answerChip}>정답 {q.correctAnswer + 1}번</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button style={styles.primaryButton} onClick={handleCreateAssignment}>
                과제 최종 저장
              </button>
            </div>
          </div>

          <div style={styles.twoCol}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>등록된 과제 목록</h2>
              <p style={styles.cardDesc}>실제 학생에게 보이는 문제 세트 목록.</p>

              {assignments.length === 0 ? (
                <div style={styles.emptyBox}>아직 등록된 과제가 없음</div>
              ) : (
                <div style={styles.listStack}>
                  {assignments
  .filter((item) => item.assignedTo === currentUserEmail)
  .map((item) => (
                    <div key={item.id} style={styles.assignmentCard}>
                      <div>
                        <div style={styles.assignmentTitle}>{item.title}</div>
                        <div style={styles.assignmentMeta}>
                          PDF: {item.pdfName || "없음"} · 지문 {item.passages?.length || 0}개 · 문제 {item.questions?.length || 0}개
                        </div>
                      </div>
                      <div style={styles.badgeLight}>{item.questions?.length || 0}문항</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>학생 제출 결과</h2>
              <p style={styles.cardDesc}>제출 학생 목록과 점수입니다.</p>

              {submissions.length === 0 ? (
                <div style={styles.emptyBox}>아직 제출된 답안이 없음</div>
              ) : (
                <div style={styles.listStack}>
                  {submissions.map((submission) => (
                    <div key={submission.id} style={styles.resultCard}>
                      <div style={styles.resultHeader}>
                        <div>
                          <div style={styles.assignmentTitle}>{submission.assignmentTitle}</div>
                          <div style={styles.assignmentMeta}>{submission.studentEmail}</div>
                        </div>
                        <div style={styles.scoreBadge}>{submission.percentage}%</div>
                      </div>

                      <div style={styles.resultMetaRow}>
                        <span>점수 {submission.score}/{submission.totalQuestions}</span>
                        <span>{formatDate(submission.submittedAt)}</span>
                      </div>
                      <div style={{ marginTop: 14 }}>
  <textarea
    placeholder="피드백 입력"
    value={feedbackInputs[submission.id] ?? submission.feedback ?? ""}
    onChange={(e) =>
      setFeedbackInputs({
        ...feedbackInputs,
        [submission.id]: e.target.value,
      })
    }
    style={styles.feedbackTextarea}
  />

  <button
    style={{ ...styles.primaryButton, marginTop: 10 }}
    onClick={async () => {
      const feedbackValue = feedbackInputs[submission.id] ?? "";

      await updateDoc(doc(db, "submissions", submission.id), {
        feedback: feedbackValue,
      });

      setMessage("피드백 저장 완료");
      await loadSubmissions();
    }}
  >
    피드백 저장
  </button>
</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentUserEmail && userRole === "student" && lastSubmissionResult) {
    return (
      <div style={styles.appShell}>
        <div style={styles.studentWrap}>
          <div style={styles.topBar}>
            <div>
              <div style={styles.badgeBlue}>제출 결과</div>
              <h1 style={styles.pageTitle}>{lastSubmissionResult.assignmentTitle}</h1>
              <p style={styles.subText}>채점 완료.</p>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>점수</div>
              <div style={styles.statValue}>
                {lastSubmissionResult.score}/{lastSubmissionResult.totalQuestions}
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>정답률</div>
              <div style={styles.statValue}>{lastSubmissionResult.percentage}%</div>
            </div>
          </div>

          {lastSubmissionResult.feedback && (
  <div style={styles.card}>
    <h2 style={styles.cardTitle}>선생님 피드백</h2>
    <div style={styles.feedbackBox}>
      {lastSubmissionResult.feedback}
    </div>
  </div>
)}

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>문제별 결과</h2>
            <div style={styles.listStack}>
              {lastSubmissionResult.resultDetails.map((result, index) => (
                <div key={result.questionId} style={styles.solveCard}>
                  <div style={styles.questionIndex}>문제 {index + 1}</div>
                  <div style={styles.questionText}>{result.questionText}</div>
                  <div style={styles.resultPillRow}>
                    <span style={result.isCorrect ? styles.greenPill : styles.redPill}>
                      {result.isCorrect ? "정답" : "오답"}
                    </span>
                    <span style={styles.grayPill}>내 답 {result.studentAnswer + 1}번</span>
                    <span style={styles.grayPill}>정답 {result.correctAnswer + 1}번</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            style={styles.primaryButton}
            onClick={() => {
              setLastSubmissionResult(null);
              setMessage("");
            }}
          >
            과제 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (currentUserEmail && userRole === "student" && selectedAssignment) {
    return (
      <div style={styles.appShell}>
        <div style={styles.studentWrap}>
          <div style={styles.topBar}>
            <div>
              <div style={styles.badgeBlue}>과제 풀이</div>
              <h1 style={styles.pageTitle}>{selectedAssignment.title}</h1>
              <p style={styles.subText}>
                PDF 참고: {selectedAssignment.pdfName || "없음"}
              </p>
            </div>
            <button style={styles.ghostButton} onClick={() => setSelectedAssignment(null)}>
              목록으로
            </button>
          </div>

          {!!message && <div style={styles.notice}>{message}</div>}

          <div style={styles.listStack}>
            {(selectedAssignment.passages || []).map((passage, passageIndex) => {
              const linkedQuestions = (selectedAssignment.questions || []).filter(
                (q) => q.passageId === passage.id
              );

              return (
                <div key={passage.id} style={styles.solvePassageWrap}>
                  <div style={styles.passageBlock}>
                    <div style={styles.questionIndex}>지문 {passageIndex + 1}</div>
                    <div style={styles.assignmentTitle}>{passage.title}</div>
                    <div style={styles.fullPassageText}>{passage.text}</div>
                  </div>

                  <div style={styles.listStack}>
                    {linkedQuestions.map((q, qIndex) => (
                      <div key={q.id} style={styles.solveCard}>
                        <div style={styles.questionIndex}>
                          문항 {qIndex + 1}
                        </div>
                        <div style={styles.questionText}>{q.questionText}</div>

                        <div style={styles.choiceButtonWrap}>
                          {q.choices.map((choice, choiceIndex) => {
                            const selected = studentAnswers[q.id] === choiceIndex;
                            return (
                              <button
                                key={choiceIndex}
                                onClick={() => handleSelectAnswer(q.id, choiceIndex)}
                                style={selected ? styles.choiceButtonActive : styles.choiceButton}
                              >
                                <span style={styles.choiceNumber}>{choiceIndex + 1}</span>
                                <span>{choice}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={styles.bottomActionBar}>
            <button style={styles.ghostButton} onClick={() => setSelectedAssignment(null)}>
              목록으로 돌아가기
            </button>
            <button style={styles.primaryButton} onClick={handleSubmitAssignment}>
              제출하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentUserEmail && userRole === "student") {
    return (
      <div style={styles.appShell}>
        <div style={styles.studentWrap}>
          <div style={styles.topBar}>
            <div>
              <div style={styles.badgeBlue}>학생 모드</div>
              <h1 style={styles.pageTitle}>내 과제</h1>
              <p style={styles.subText}>
                {currentUserEmail} · 지문과 문항을 바로 풀이할 수 있어.
              </p>
            </div>
            <button style={styles.ghostButton} onClick={handleLogout}>
              로그아웃
            </button>
          </div>

          {!!message && <div style={styles.notice}>{message}</div>}

          {assignments.length === 0 ? (
            <div style={styles.emptyBigCard}>
              <h3 style={styles.cardTitle}>등록된 과제가 아직 없음</h3>
              <p style={styles.cardDesc}>관리자가 PDF 기반 과제를 등록하면 여기서 바로 풀 수 있습니다.</p>
            </div>
          ) : (
            <div style={styles.assignmentGrid}>
              {assignments.map((item) => (
                <div key={item.id} style={styles.assignmentStudentCard}>
                  <div style={styles.assignmentCardTop}>
                    <div style={styles.badgeLight}>{item.questions?.length || 0}문항</div>
                  </div>
                  <div style={styles.assignmentTitle}>{item.title}</div>
                  <div style={styles.assignmentMeta}>
                    PDF: {item.pdfName || "없음"}
                  </div>
                  <div style={styles.assignmentMeta}>
                    지문 {item.passages?.length || 0}개 · 문제 {item.questions?.length || 0}개
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAssignment(item);
                      setStudentAnswers({});
                      setMessage("");
                      setLastSubmissionResult(null);
                    }}
                    style={{ ...styles.primaryButton, width: "100%", marginTop: 18 }}
                  >
                    과제 풀기
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.loginPage}>
      <div style={styles.loginCard}>
        <div style={styles.loginBadge}>DELFI</div>
        <h1 style={styles.loginTitle}>수강생 학습 플랫폼</h1>
        <p style={styles.loginDesc}>
          로그인하여 과제를 등록하거나 문제를 풀어보세요.
        </p>

        {!!message && <div style={styles.notice}>{message}</div>}

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <div style={styles.loginButtonWrap}>
          <button onClick={handleSignup} style={styles.secondaryButton}>
            회원가입
          </button>
          <button onClick={handleLogin} style={styles.primaryButton}>
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

const styles: Record<string, React.CSSProperties> = {
  appShell: {
    minHeight: "100vh",
    background: "#f7f4ff",
    padding: "32px 20px",
    fontFamily:
      "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
    color: "#0f172a",
  },
  dashboardWrap: {
    maxWidth: 1280,
    margin: "0 auto",
  },
  studentWrap: {
    maxWidth: 1080,
    margin: "0 auto",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  pageTitle: {
    margin: "8px 0 6px",
    fontSize: 34,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  subText: {
    margin: 0,
    color: "#64748b",
    fontSize: 15,
  },
 badgeBlue: {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 12px",
  borderRadius: 999,
  background: "#efe7ff",
  color: "#6d28d9",
  fontWeight: 700,
  fontSize: 13,
},
  badgeLight: {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#f3e8ff",
  color: "#7c3aed",
  fontWeight: 700,
  fontSize: 12,
},
  scoreBadge: {
    minWidth: 72,
    textAlign: "center",
    padding: "10px 14px",
    borderRadius: 14,
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: 800,
    fontSize: 22,
  },
  notice: {
  marginBottom: 20,
  background: "#f5f3ff",
  color: "#6d28d9",
  border: "1px solid #ddd6fe",
  padding: "14px 16px",
  borderRadius: 16,
  fontWeight: 600,
},
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "#ffffff",
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e2e8f0",
  },
  statLabel: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 600,
  },
  statValue: {
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
    gap: 18,
    marginBottom: 18,
  },
  card: {
    background: "#ffffff",
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e2e8f0",
  },
  cardTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  cardDesc: {
    marginTop: 8,
    marginBottom: 20,
    color: "#64748b",
    fontSize: 14,
  },
  sectionTitle: {
    margin: "0 0 12px",
    fontSize: 18,
    fontWeight: 700,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid #dbe2ea",
    outline: "none",
    fontSize: 15,
    background: "#fff",
    boxSizing: "border-box",
    marginBottom: 12,
  },
  textarea: {
    width: "100%",
    minHeight: 110,
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid #dbe2ea",
    outline: "none",
    fontSize: 15,
    resize: "vertical",
    background: "#fff",
    boxSizing: "border-box",
    marginBottom: 14,
  },
  largeTextarea: {
    width: "100%",
    minHeight: 180,
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid #dbe2ea",
    outline: "none",
    fontSize: 15,
    resize: "vertical",
    background: "#fff",
    boxSizing: "border-box",
    marginBottom: 14,
    lineHeight: 1.6,
  },
  choiceGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 0,
  },
  select: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #dbe2ea",
    fontSize: 15,
    background: "#fff",
  },
  selectWide: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #dbe2ea",
    fontSize: 15,
    background: "#fff",
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 10,
  },
  inlineField: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  inlineFieldColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 14,
  },
  inlineLabel: {
    fontWeight: 700,
    color: "#334155",
  },
  primaryButton: {
  border: "none",
  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
  color: "#fff",
  fontWeight: 700,
  padding: "14px 18px",
  borderRadius: 14,
  cursor: "pointer",
  fontSize: 15,
  boxShadow: "0 10px 20px rgba(124, 58, 237, 0.18)",
},
  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 700,
    padding: "14px 18px",
    borderRadius: 14,
    cursor: "pointer",
    fontSize: 15,
  },
  ghostButton: {
    border: "1px solid #dbe2ea",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 700,
    padding: "12px 16px",
    borderRadius: 14,
    cursor: "pointer",
    fontSize: 14,
  },
  divider: {
    height: 1,
    background: "#e2e8f0",
    margin: "18px 0",
  },
  emptyBox: {
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: 18,
    padding: 20,
    color: "#64748b",
  },
  emptyBigCard: {
    background: "#ffffff",
    borderRadius: 28,
    padding: 32,
    textAlign: "center",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  },
  listStack: {
    display: "grid",
    gap: 14,
  },
  questionPreviewCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 18,
  },
  passagePreviewCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 18,
  },
  questionIndex: {
    display: "inline-block",
    marginBottom: 12,
    background: "#e0f2fe",
    color: "#0369a1",
    fontSize: 12,
    fontWeight: 800,
    padding: "6px 10px",
    borderRadius: 999,
  },
  questionText: {
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.5,
    marginBottom: 14,
  },
  passageTextPreview: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.7,
    color: "#334155",
    maxHeight: 180,
    overflow: "auto",
  },
  fullPassageText: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.9,
    color: "#1e293b",
    fontSize: 15,
  },
  choiceList: {
    display: "grid",
    gap: 8,
    marginBottom: 12,
  },
  choiceItem: {
    padding: "10px 12px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    color: "#334155",
  },
  answerChip: {
    answerChip: {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#ede9fe",
  color: "#6d28d9",
  fontWeight: 700,
  fontSize: 12,
},
  assignmentCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 18,
    background: "#fff",
  },
  assignmentCardTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: 6,
  },
  assignmentMeta: {
    color: "#64748b",
    fontSize: 13,
  },
  resultCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 18,
    background: "#fff",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  resultMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "#64748b",
    fontSize: 13,
    marginTop: 10,
    flexWrap: "wrap",
  },
  solveCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  },
  solvePassageWrap: {
    display: "grid",
    gap: 18,
  },
  passageBlock: {
    background: "#ffffff",
    border: "1px solid #dbeafe",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 8px 24px rgba(37, 99, 235, 0.05)",
  },
  choiceButtonWrap: {
    display: "grid",
    gap: 12,
  },
  choiceButton: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #dbe2ea",
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
    fontSize: 15,
    color: "#0f172a",
  },
  choiceButtonActive: {
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "100%",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid #c4b5fd",
  background: "#f5f3ff",
  cursor: "pointer",
  textAlign: "left",
  fontSize: 15,
  color: "#6d28d9",
  boxShadow: "0 8px 20px rgba(168, 85, 247, 0.12)",
},
  choiceNumber: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#e2e8f0",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 800,
    fontSize: 13,
    flexShrink: 0,
  },
  bottomActionBar: {
    marginTop: 24,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  resultPillRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  greenPill: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#15803d",
    fontWeight: 700,
    fontSize: 13,
  },
  redPill: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: 999,
    background: "#fee2e2",
    color: "#dc2626",
    fontWeight: 700,
    fontSize: 13,
  },
  grayPill: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#334155",
    fontWeight: 700,
    fontSize: 13,
  },
  loginPage: {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background:
    "linear-gradient(180deg, #f5f3ff 0%, #faf5ff 45%, #f7f4ff 100%)",
  padding: 20,
  fontFamily:
    "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
},
  loginCard: {
    width: "100%",
    maxWidth: 460,
    background: "#ffffff",
    padding: 32,
    borderRadius: 30,
    boxShadow: "0 24px 50px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e2e8f0",
  },
  loginBadge: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: 999,
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: 800,
    marginBottom: 16,
  },
  loginTitle: {
    margin: 0,
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  loginDesc: {
    marginTop: 10,
    marginBottom: 24,
    color: "#64748b",
    lineHeight: 1.6,
  },
  loginButtonWrap: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 8,
  },
  centerCard: {
    maxWidth: 420,
    margin: "120px auto",
    background: "#fff",
    borderRadius: 26,
    padding: 30,
    textAlign: "center",
    border: "1px solid #e2e8f0",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
  },
  centerTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
  },
  muted: {
    color: "#64748b",
    marginTop: 10,
  },
  assignmentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
  },
  assignmentStudentCard: {
    background: "#ffffff",
    borderRadius: 24,
    padding: 20,
    border: "1px solid #e2e8f0",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  },
  padding: 16,
    borderRadius: 16,
    background: "#faf5ff",
    border: "1px solid #e9d5ff",
  },
  pdfLabel: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
  },
  pdfFileName: {
    marginTop: 10,
    color: "#475569",
    fontSize: 14,
  },
  previewSection: {
    marginBottom: 20,
  }
};

export default App;