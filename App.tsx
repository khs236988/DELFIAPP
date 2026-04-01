import { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);
      setMessage("회원가입 성공: " + user.user.email);
    } catch (e: any) {
      setMessage("회원가입 실패: " + e.message);
    }
  };

  const handleLogin = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      setMessage("로그인 성공: " + user.user.email);
    } catch (e: any) {
      setMessage("로그인 실패: " + e.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMessage("로그아웃 성공");
    } catch (e: any) {
      setMessage("로그아웃 실패: " + e.message);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>DELFI 로그인 테스트</h1>

      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <br />

      <button onClick={handleSignup}>회원가입</button>
      <button onClick={handleLogin}>로그인</button>
      <button onClick={handleLogout}>로그아웃</button>

      <p>{message}</p>
    </div>
  );
}

export default App;