import { useState } from "react";
import logoImg from "./assets/logo-new.png";
import { login } from "./api";

const FONT_STACK =
  "'Pretendard Variable', -apple-system, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";

const PARTNER_LOGOS = Array.from(
  { length: 18 },
  (_, i) => `/partners/logo-${String(i + 1).padStart(2, "0")}.svg`
);
// 아래 줄은 순서를 섞어서 두 줄이 단조롭게 겹치지 않도록 함
const PARTNER_LOGOS_ROW2 = [...PARTNER_LOGOS.slice(9), ...PARTNER_LOGOS.slice(0, 9)];

function LogoMarquee({ logos, direction }: { logos: string[]; direction: "left" | "right" }) {
  const doubled = [...logos, ...logos];
  return (
    <div className="relative w-full overflow-hidden marquee-mask">
      <div
        className={`flex items-center gap-12 w-max ${direction === "left" ? "marquee-left" : "marquee-right"}`}
      >
        {doubled.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            className="h-6 w-auto object-contain opacity-40 brightness-0 invert"
          />
        ))}
      </div>
    </div>
  );
}

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // TODO: 실제 OAuth/문의 연동 붙이기 — 지금은 구조만 잡아둔 빈 핸들러
  const handleGoogleLogin = () => { onLogin(); };
  const handleContact = () => {};

  const handleEmailLogin = async () => {
    if (!email || !password) { setError("이메일과 비밀번호를 입력해주세요."); return; }
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      onLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-2" style={{ fontFamily: FONT_STACK, color: "oklch(0.145 0 0)" }}>
      {/* 왼쪽 패널 — 흰 배경 로그인 폼 */}
      <div className="flex flex-col bg-white p-10">
        {/* 로고 */}
        <div>
          <img src={logoImg} alt="Continuum" className="h-12 w-auto object-contain" />
        </div>

        {/* 중앙 폼 */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-80">
            {!showEmailForm ? (
              <>
                <h1 className="mb-1.5 text-center text-2xl font-bold">Continuum에 로그인</h1>
                <p className="mb-7 text-center text-base text-neutral-500">계속하려면 로그인하세요</p>

                <div className="flex flex-col gap-5">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex h-9 w-full items-center justify-center gap-2.5 rounded-lg border border-[oklch(0.922_0_0)] bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Google로 계속하기
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[oklch(0.922_0_0)]" />
                    <span className="text-xs text-neutral-400">또는</span>
                    <div className="h-px flex-1 bg-[oklch(0.922_0_0)]" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowEmailForm(true)}
                    className="h-9 w-full rounded-lg bg-[oklch(0.53_0.22_260)] text-sm font-medium text-white hover:opacity-90"
                  >
                    이메일로 계속하기
                  </button>

                  <button
                    type="button"
                    onClick={handleContact}
                    className="h-9 w-full rounded-lg border border-[oklch(0.922_0_0)] bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    문의하기
                  </button>
                </div>

                <div className="mt-5 text-center text-sm">
                  <span className="cursor-pointer underline">서비스 이용약관</span>
                  {" / "}
                  <span className="cursor-pointer underline">개인정보처리방침</span>
                </div>
              </>
            ) : (
              <>
                <h1 className="mb-5 text-center text-2xl font-bold">이메일로 로그인</h1>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-neutral-700">이메일 *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleEmailLogin()}
                      placeholder="name@company.com"
                      className="w-full rounded-lg border border-[oklch(0.922_0_0)] bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-900 outline-none"
                    />
                  </div>

                  <div>
                    <div className="mb-1.5 flex justify-between">
                      <label className="text-xs font-semibold text-neutral-700">비밀번호 *</label>
                      <span className="cursor-pointer text-xs font-medium" style={{ color: "oklch(0.53 0.22 260)" }}>비밀번호 찾기</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleEmailLogin()}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-[oklch(0.922_0_0)] bg-neutral-50 px-3.5 py-2.5 pr-10 text-sm text-neutral-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(p => !p)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400"
                      >
                        {showPw
                          ? <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          : <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs text-red-600">{error}</div>
                  )}

                  <button
                    type="button"
                    onClick={handleEmailLogin}
                    className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-white hover:opacity-90"
                    style={{ background: "oklch(0.53 0.22 260)" }}
                  >
                    {loading
                      ? <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>로그인 중...</>
                      : "로그인"}
                  </button>
                </div>

                <div className="mt-5 text-center">
                  <span
                    onClick={() => { setShowEmailForm(false); setError(""); }}
                    className="cursor-pointer text-sm text-neutral-500 underline"
                  >
                    다른 방법으로 로그인
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 좌측 하단 링크 */}
        <div className="flex gap-6">
          {["데모 신청하기", "미리보기", "홈페이지"].map(l => (
            <span key={l} className="cursor-pointer text-sm font-medium underline">{l}</span>
          ))}
        </div>
      </div>

      {/* 오른쪽 패널 — 다크 쇼케이스 */}
      <div className="relative hidden overflow-hidden bg-neutral-950 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #0d0d18 60%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.6) 100%)" }} />

        <div className="relative z-10 flex flex-col items-center px-10 text-center">
          <h2 className="mb-4 text-3xl leading-tight font-bold text-white">
            반복 업무 자동화의<br />새로운 표준
          </h2>
          <p className="mb-12 text-base" style={{ color: "oklch(0.708 0 0)" }}>
            흩어진 업무를 AI가 하나로, 복잡한 오프보딩을 심플하게
          </p>

          <div className="flex w-full max-w-xl flex-col gap-4">
            <LogoMarquee logos={PARTNER_LOGOS} direction="left" />
            <LogoMarquee logos={PARTNER_LOGOS_ROW2} direction="right" />
          </div>
        </div>
      </div>
    </div>
  );
}
