import { useState } from "react";
import logoImg from "./assets/logo-new.png";

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = () => {
    if (!email || !password) { setError("이메일과 비밀번호를 입력해주세요."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  };

  const handleSignUp = () => {
    if (!name || !email || !password || !passwordConfirm) { setError("모든 필드를 입력해주세요."); return; }
    if (password !== passwordConfirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  };

  const switchMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setError("");
    setEmail(""); setPassword(""); setName(""); setCompany(""); setPasswordConfirm("");
  };

  return (
    <div className="login-shell">
      {/* Left panel — white login */}
      <div className="login-left">
        {/* Logo top-left */}
        <div style={{ marginBottom: "auto" }}>
          <img src={logoImg} alt="Continuum" style={{ height: 44, objectFit: "contain" }} />
        </div>

        {/* Centered form */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
          <div style={{ width: "100%", maxWidth: 340 }}>
            {!showEmailForm ? (
              <>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 6px", textAlign: "center" }}>Continuum에 로그인</h1>
                <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 28px", textAlign: "center" }}>계속하려면 로그인하세요</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={onLogin} style={{ width: "100%", padding: "12px 0", borderRadius: 9, fontSize: 13, fontWeight: 500, border: "1px solid #e5e7eb", cursor: "pointer", background: "#fff", color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                    Google로 계속하기
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                    <div style={{ flex: 1, height: 1, background: "#f0f0f5" }} />
                    <span style={{ fontSize: 12, color: "#d1d5db" }}>또는</span>
                    <div style={{ flex: 1, height: 1, background: "#f0f0f5" }} />
                  </div>

                  <button
                    onClick={() => setShowEmailForm(true)}
                    style={{ width: "100%", padding: "13px 0", borderRadius: 9, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
                  >
                    이메일로 계속하기
                  </button>

                  <button style={{ width: "100%", padding: "12px 0", borderRadius: 9, fontSize: 13, fontWeight: 500, border: "1px solid #e5e7eb", cursor: "pointer", background: "#fff", color: "#374151" }}>
                    문의하기
                  </button>
                </div>

                <div style={{ marginTop: 20, textAlign: "center" }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>
                    <span style={{ textDecoration: "underline", cursor: "pointer" }}>서비스 이용약관</span>
                    {" / "}
                    <span style={{ textDecoration: "underline", cursor: "pointer" }}>개인정보처리방침</span>
                  </span>
                </div>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 20px", textAlign: "center" }}>
                  {isSignUp ? "회원가입" : "이메일로 로그인"}
                </h1>

                <div style={{ display: "flex", background: "#f3f4f6", borderRadius: 9, padding: 3, marginBottom: 22 }}>
                  {([["로그인", false], ["회원가입", true]] as const).map(([label, val]) => (
                    <button key={label} onClick={() => switchMode(val)} style={{
                      flex: 1, padding: "8px 0", borderRadius: 7, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                      background: isSignUp === val ? "#fff" : "transparent",
                      color: isSignUp === val ? "#111827" : "#9ca3af",
                      boxShadow: isSignUp === val ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.15s",
                    }}>{label}</button>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {isSignUp && (
                    <>
                      <div>
                        <label style={{ fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 6 }}>이름 *</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동"
                          style={{ width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 9, padding: "11px 13px", fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 6 }}>회사명 <span style={{ color: "#9ca3af", fontWeight: 400 }}>(선택)</span></label>
                        <input value={company} onChange={e => setCompany(e.target.value)} placeholder="예: 스타트업 주식회사"
                          style={{ width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 9, padding: "11px 13px", fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }} />
                      </div>
                    </>
                  )}

                  <div>
                    <label style={{ fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 6 }}>이메일 *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (isSignUp ? handleSignUp() : handleLogin())}
                      placeholder="name@company.com"
                      style={{ width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 9, padding: "11px 13px", fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }} />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <label style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>비밀번호 *</label>
                      {!isSignUp && <span style={{ fontSize: 12, color: "#6366f1", cursor: "pointer", fontWeight: 500 }}>비밀번호 찾기</span>}
                    </div>
                    <div style={{ position: "relative" }}>
                      <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (isSignUp ? handleSignUp() : handleLogin())}
                        placeholder="••••••••"
                        style={{ width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 9, padding: "11px 38px 11px 13px", fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }} />
                      <button onClick={() => setShowPw(p => !p)} style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                        {showPw
                          ? <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#9ca3af" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="#9ca3af" strokeWidth="1.5"/><path d="M2 2l12 12" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          : <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#9ca3af" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="#9ca3af" strokeWidth="1.5"/></svg>}
                      </button>
                    </div>
                  </div>

                  {isSignUp && (
                    <div>
                      <label style={{ fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 6 }}>비밀번호 확인 *</label>
                      <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSignUp()}
                        placeholder="••••••••"
                        style={{ width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 9, padding: "11px 13px", fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }} />
                    </div>
                  )}

                  {error && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "9px 13px", fontSize: 12, color: "#dc2626" }}>{error}</div>
                  )}

                  <button
                    onClick={isSignUp ? handleSignUp : handleLogin}
                    style={{ marginTop: 4, width: "100%", padding: "13px 0", borderRadius: 9, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff", boxShadow: "0 4px 16px rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {loading
                      ? <><svg style={{ animation: "spin 0.8s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>{isSignUp ? "가입 중..." : "로그인 중..."}</>
                      : isSignUp ? "회원가입" : "로그인"}
                  </button>
                </div>

                <div style={{ marginTop: 20, textAlign: "center" }}>
                  <span onClick={() => { setShowEmailForm(false); setError(""); setIsSignUp(false); }} style={{ fontSize: 13, color: "#6b7280", cursor: "pointer", textDecoration: "underline" }}>다른 방법으로 로그인</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, justifyContent: "flex-start" }}>
          {["데모 신청하기", "Continuum 미리보기", "홈페이지"].map(l => (
            <span key={l} style={{ fontSize: 12, color: "#9ca3af", cursor: "pointer", textDecoration: "underline" }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Right panel — dark showcase */}
      <div className="login-right">
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #1a1a2e 0%, #0d0d18 60%)" }} />

        {/* 상단 배지 */}
        <div style={{ position: "absolute", top: "clamp(24px, 4vw, 40px)", left: "clamp(24px, 4vw, 40px)", zIndex: 10, display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "6px 14px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "pulse-orb 2s ease-in-out infinite" }} />
          <span style={{ fontSize: 11, color: "#d1d5db", fontWeight: 500 }}>실시간으로 150+ 팀의 오프보딩을 처리 중</span>
        </div>

        {/* 대시보드 목업 */}
        <div style={{ position: "absolute", top: "clamp(72px, 8vw, 96px)", left: "clamp(24px, 4vw, 40px)", right: "clamp(24px, 4vw, 40px)", bottom: 372, borderRadius: 16, background: "#fff", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.5)", opacity: 0.12 }} />
        <div style={{ position: "absolute", top: "clamp(80px, 8.5vw, 104px)", left: "clamp(32px, 4.5vw, 48px)", right: "clamp(32px, 4.5vw, 48px)", bottom: 380, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ height: "100%", background: "#f0f2f7", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 40, background: "#fff", borderBottom: "1px solid #e8eaf0", display: "flex", alignItems: "center", padding: "0 16px", gap: 8, flexShrink: 0 }}>
              <div style={{ width: 60, height: 10, borderRadius: 4, background: "#e5e7eb" }} />
              <div style={{ flex: 1 }} />
              {[1,2,3].map(i => <div key={i} style={{ width: 28, height: 10, borderRadius: 4, background: "#f3f4f6" }} />)}
            </div>
            <div style={{ display: "flex", flex: 1, gap: 0, minHeight: 0 }}>
              <div style={{ width: 48, background: "#fff", borderRight: "1px solid #f0f0f5", flexShrink: 0 }} />
              <div style={{ flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                  {["146", "5,614만원", "184", "170"].map(v => (
                    <div key={v} style={{ background: "#fff", borderRadius: 6, padding: "8px 10px", border: "1px solid #f0f0f5" }}>
                      <div style={{ fontSize: 6, color: "#9ca3af", marginBottom: 2 }}>지표</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#111827" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, background: "#fff", borderRadius: 6, border: "1px solid #f0f0f5", padding: 10, display: "flex", flexDirection: "column", gap: 6, minHeight: 0, overflow: "hidden" }}>
                  <div style={{ width: 50, height: 7, borderRadius: 3, background: "#e5e7eb", marginBottom: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 5, minHeight: 0 }}>
                    {[38, 62, 45, 80, 55, 70, 42, 90, 60].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0", background: i === 7 ? "#6366f1" : "#e0e3ff" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#eef2ff", flexShrink: 0 }} />
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#f3f4f6" }} />
                        <div style={{ width: 24, height: 6, borderRadius: 3, background: "#e5e7eb" }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 목업 위 떠있는 완료 토스트 */}
        <div style={{ position: "absolute", top: "clamp(88px, 9.5vw, 116px)", right: "clamp(44px, 6vw, 68px)", zIndex: 5, display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "8px 12px", boxShadow: "0 12px 28px rgba(0,0,0,0.35)" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#16a34a", fontWeight: 700 }}>✓</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#111827" }}>Slack 접근 회수 완료</div>
            <div style={{ fontSize: 9, color: "#9ca3af" }}>0.4초 소요</div>
          </div>
        </div>

        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0d0d18 40%, transparent 72%)" }} />

        <div style={{ position: "relative", zIndex: 10, padding: "0 clamp(24px, 4vw, 40px) 32px" }}>
          <h2 style={{ fontSize: "clamp(22px, 2.4vw, 28px)", fontWeight: 800, color: "#fff", margin: "0 0 10px", lineHeight: 1.3, letterSpacing: "-0.02em" }}>
            반복 업무 자동화의<br /><span style={{ color: "#818cf8" }}>새로운 표준</span>
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 18px", lineHeight: 1.7 }}>
            흩어진 업무를 AI가 하나로. 복잡한 오프보딩을 심플하게.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            {[
              { label: "1초 오프보딩", value: "즉시 권한 회수" },
              { label: "AI 인수인계", value: "맥락 그대로 전달" },
              { label: "감사 로그", value: "모든 처리 기록" },
            ].map(f => (
              <div key={f.label} style={{ flex: "1 1 140px", minWidth: 120, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{f.value}</div>
              </div>
            ))}
          </div>

          {/* 고객 인용구 */}
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "#e5e7eb", lineHeight: 1.6 }}>
              “퇴사자 계정 정리에 하루가 걸리던 일이 Continuum 덕분에 클릭 한 번으로 끝나요.”
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>JR</div>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>Jamie R. · IT 관리자, 스타트업 A사</span>
            </div>
          </div>

          {/* 신뢰 지표 */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {[["150+", "연동된 팀"], ["4.9/5", "평균 만족도"], ["12만+", "월간 처리 이벤트"]].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{v}</div>
                <div style={{ fontSize: 10.5, color: "#6b7280" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
