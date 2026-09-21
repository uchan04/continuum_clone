import { useState, useRef, useEffect } from "react";
import logoImg from "./assets/logo-new.png";
import AXManualTab from "./ax-manual/AXManualTab";
// v2

// ─────────────────────────────────────────────────────────────────────────────
// ROOT — 탭 네비게이션으로 두 화면 전환
// ─────────────────────────────────────────────────────────────────────────────

export default function App({ onLogout }: { onLogout?: () => void }) {
  const [activeScreen, setActiveScreen] = useState<"offboarding" | "handover" | "axmanual">("offboarding");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", background: "#f0f2f7", fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden" }}>
      {/* 상단 글로벌 네비게이션 */}
      <div style={{ height: 56, background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", padding: "0 28px", gap: 0, flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {/* 로고 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 28 }}>
          <img src={logoImg} alt="Continuum" style={{ height: 44, objectFit: "contain" }} />
          <span style={{ fontSize: 10, color: "#9ca3af", background: "#f3f4f6", border: "1px solid #e5e7eb", padding: "2px 7px", borderRadius: 4, fontWeight: 500 }}>v2.4</span>
        </div>

        {/* 탭 버튼 */}
        <div style={{ display: "flex", gap: 2, flex: 1 }}>
          <TabButton
            active={activeScreen === "offboarding"}
            onClick={() => setActiveScreen("offboarding")}
            icon={<ShieldTabIcon active={activeScreen === "offboarding"} />}
            label="퇴사 처리 센터"
            badge="오프보딩"
          />
          <TabButton
            active={activeScreen === "handover"}
            onClick={() => setActiveScreen("handover")}
            icon={<ChatTabIcon active={activeScreen === "handover"} />}
            label="AI 업무 인수인계"
            badge="어시스턴트"
          />
          <TabButton
            active={activeScreen === "axmanual"}
            onClick={() => setActiveScreen("axmanual")}
            icon={<PocTabIcon active={activeScreen === "axmanual"} />}
            label="AX 매뉴얼 생성"
            badge="PoC"
          />
        </div>

        {/* 우측 상태 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>시스템 정상</span>
          </div>
          <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#6366f1", fontWeight: 700 }}>JR</div>
          <button
            onClick={onLogout}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "transparent", border: "1px solid #e5e7eb", borderRadius: 7, cursor: "pointer", fontSize: 12, color: "#6b7280" }}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 5l3 3-3 3M13 8H6" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            로그아웃
          </button>
        </div>
      </div>

      {/* 화면 콘텐츠 */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeScreen === "offboarding" && <OffboardingDashboard />}
        {activeScreen === "handover" && <HandoverChat />}
        {activeScreen === "axmanual" && <AXManualTab onLogout={onLogout} />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, badge }: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; badge: string;
}) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "0 18px", height: 56,
      background: "transparent",
      border: "none", borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
      cursor: "pointer", color: active ? "#6366f1" : "#6b7280",
      fontSize: 13, fontWeight: active ? 700 : 500,
      transition: "all 0.15s", position: "relative",
    }}>
      {icon}
      {label}
      <span style={{
        fontSize: 9, padding: "2px 6px", borderRadius: 4,
        background: active ? "#eef2ff" : "#f3f4f6",
        color: active ? "#6366f1" : "#9ca3af",
        border: `1px solid ${active ? "#c7d2fe" : "#e5e7eb"}`,
        fontWeight: 600, letterSpacing: "0.04em",
      }}>{badge}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 화면 1 — 퇴사 처리 센터 (오프보딩 대시보드)
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "대시보드", Icon: GridIcon },
  { id: "employees", label: "직원 목록", Icon: UsersIcon },
  { id: "offboard-center", label: "퇴사 처리 센터", Icon: OffboardIcon },
  { id: "saas", label: "연동된 SaaS", Icon: LinkIcon },
  { id: "audit", label: "보안 감사 로그", Icon: ShieldIcon },
  { id: "settings", label: "설정", Icon: SettingsIcon },
];

const INTEGRATIONS = [
  { id: "slack", name: "Slack", desc: "워크스페이스 메신저", Icon: SlackIcon, sessions: 3 },
  { id: "google", name: "Google Workspace", desc: "Gmail · Drive · 캘린더", Icon: GoogleIcon, sessions: 7 },
  { id: "jira", name: "Jira", desc: "프로젝트 관리", Icon: JiraIcon, sessions: 2 },
  { id: "erp", name: "사내 ERP", desc: "내부 전사 시스템", Icon: ErpIcon, sessions: 1 },
];

const OFFBOARDING_SEQUENCE = [
  { time: "10:00:00", message: "alex.smith@company.com 퇴사 처리 시퀀스 시작", type: "info" },
  { time: "10:00:00", message: "활성 OAuth 세션 및 액세스 토큰 스캔 중...", type: "info" },
  { time: "10:00:01", message: "Slack OAuth 세션 취소 완료 — 활성 세션 3개 종료 (0.4초)", type: "success" },
  { time: "10:00:01", message: "Google Workspace 접근 차단 완료 — 서비스 7개 정지 (0.3초)", type: "success" },
  { time: "10:00:02", message: "Jira 프로젝트 접근 권한 취소 — 보드 2개 보관 처리 (0.6초)", type: "success" },
  { time: "10:00:02", message: "사내 ERP 자격증명 무효화 — API 키 교체 완료 (0.2초)", type: "success" },
  { time: "10:00:03", message: "감사 추적 기록이 불변 로그 저장소에 커밋됨", type: "info" },
  { time: "10:00:03", message: "이메일 전달 규칙 설정 완료 → hr-offboarding@company.com", type: "info" },
  { time: "10:00:03", message: "▶ 전체 상태: 완료 — 4개 연동 서비스 모두 취소됨 (총 소요 시간: 1.5초)", type: "complete" },
] as const;

type LogLine = { id: number; time: string; message: string; type: "info" | "success" | "warning" | "complete" };
type IntegStatus = "active" | "revoking" | "revoked";

// ── 보안 감사 로그 탭 (OffboardingDashboard보다 앞에 정의) ──────────────────

const STATIC_AUDIT_LOGS = [
  { id: "A001", ts: "2026-08-25 10:00:03", actor: "Jamie R. (IT 관리자)", action: "OFFBOARD_COMPLETE", target: "Alex Smith (EMP-2847)", service: "전체", severity: "critical", detail: "원클릭 퇴사 처리 완료 — 4개 서비스 취소" },
  { id: "A002", ts: "2026-08-25 10:00:02", actor: "Continuum 시스템", action: "ERP_CREDENTIAL_REVOKE", target: "Alex Smith (EMP-2847)", service: "사내 ERP", severity: "high", detail: "API 키 교체 및 세션 1개 강제 종료" },
  { id: "A003", ts: "2026-08-25 10:00:02", actor: "Continuum 시스템", action: "JIRA_ACCESS_REVOKE", target: "Alex Smith (EMP-2847)", service: "Jira", severity: "high", detail: "프로젝트 보드 2개 보관, 세션 2개 종료" },
  { id: "A004", ts: "2026-08-25 10:00:01", actor: "Continuum 시스템", action: "GOOGLE_ACCESS_BLOCK", target: "Alex Smith (EMP-2847)", service: "Google Workspace", severity: "high", detail: "Gmail·Drive·캘린더 등 7개 서비스 정지" },
  { id: "A005", ts: "2026-08-25 10:00:01", actor: "Continuum 시스템", action: "SLACK_SESSION_REVOKE", target: "Alex Smith (EMP-2847)", service: "Slack", severity: "high", detail: "OAuth 세션 3개 강제 만료 처리" },
  { id: "A006", ts: "2026-08-25 10:00:00", actor: "Jamie R. (IT 관리자)", action: "OFFBOARD_INITIATE", target: "Alex Smith (EMP-2847)", service: "—", severity: "critical", detail: "퇴사 처리 시퀀스 수동 실행 — 티켓 HR-20847" },
  { id: "A007", ts: "2026-08-24 17:32:11", actor: "Mia Jung (HR 관리자)", action: "OFFBOARD_REQUEST", target: "Alex Smith (EMP-2847)", service: "—", severity: "medium", detail: "퇴사 처리 요청서 제출 및 관리자 승인 요청" },
  { id: "A008", ts: "2026-08-20 14:15:03", actor: "Continuum 시스템", action: "OFFBOARD_COMPLETE", target: "Daniel Lee (EMP-2798)", service: "전체", severity: "critical", detail: "원클릭 퇴사 처리 완료 — 3개 서비스 취소" },
  { id: "A009", ts: "2026-08-20 14:15:01", actor: "Continuum 시스템", action: "SLACK_SESSION_REVOKE", target: "Daniel Lee (EMP-2798)", service: "Slack", severity: "high", detail: "OAuth 세션 2개 강제 만료 처리" },
  { id: "A010", ts: "2026-08-18 09:04:52", actor: "Jamie R. (IT 관리자)", action: "SAAS_PERMISSION_CHANGE", target: "Sarah Kim (EMP-2831)", service: "GitHub", severity: "medium", detail: "저장소 쓰기 권한 → 읽기 전용으로 변경" },
  { id: "A011", ts: "2026-08-15 11:30:00", actor: "Continuum 시스템", action: "AUTO_SESSION_SCAN", target: "전체 직원", service: "전체", severity: "info", detail: "정기 세션 스캔 완료 — 비정상 접근 없음" },
  { id: "A012", ts: "2026-08-12 16:45:22", actor: "Emily Choi (CFO)", action: "ERP_BUDGET_APPROVE", target: "B2B 캠페인 예산", service: "사내 ERP", severity: "info", detail: "₩15,000,000 예산 최종 승인 — 승인 ID #2026-08-12" },
];

const ACTION_LABELS: Record<string, string> = {
  OFFBOARD_COMPLETE: "퇴사 완료",
  OFFBOARD_INITIATE: "퇴사 시작",
  OFFBOARD_REQUEST: "퇴사 요청",
  SLACK_SESSION_REVOKE: "Slack 세션 취소",
  GOOGLE_ACCESS_BLOCK: "Google 접근 차단",
  JIRA_ACCESS_REVOKE: "Jira 권한 취소",
  ERP_CREDENTIAL_REVOKE: "ERP 자격증명 취소",
  SAAS_PERMISSION_CHANGE: "권한 변경",
  AUTO_SESSION_SCAN: "자동 세션 스캔",
  ERP_BUDGET_APPROVE: "예산 승인",
  SYSTEM_ACTION: "시스템 처리",
};

function AuditLogView({ logs, executed, executing }: {
  logs: LogLine[];
  executed: boolean;
  executing: boolean;
}) {
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "info">("all");
  const [search, setSearch] = useState("");

  const runtimeLogs = logs.map((l, i) => ({
    id: `RT-${i}`,
    ts: `2026-08-25 ${l.time}`,
    actor: l.type === "info" ? "Jamie R. (IT 관리자)" : "Continuum 시스템",
    action: l.type === "complete" ? "OFFBOARD_COMPLETE" : l.type === "success" ? "SYSTEM_ACTION" : "OFFBOARD_INITIATE",
    target: "Alex Smith (EMP-2847)",
    service: l.message.includes("Slack") ? "Slack" : l.message.includes("Google") ? "Google Workspace" : l.message.includes("Jira") ? "Jira" : l.message.includes("ERP") ? "사내 ERP" : "—",
    severity: (l.type === "complete" ? "critical" : l.type === "success" ? "high" : "info") as "critical" | "high" | "medium" | "info",
    detail: l.message,
  }));

  const allLogs = [...[...runtimeLogs].reverse(), ...STATIC_AUDIT_LOGS];
  const severityCfg = {
    critical: { label: "긴급", color: "#dc2626", bg: "#fee2e2", border: "#fecaca" },
    high:     { label: "높음", color: "#ea580c", bg: "#ffedd5", border: "#fed7aa" },
    medium:   { label: "보통", color: "#d97706", bg: "#fef9c3", border: "#fde68a" },
    info:     { label: "정보", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  };
  const filtered = allLogs.filter(l => {
    const matchSev = filter === "all" || l.severity === filter;
    const matchSearch = !search || l.detail.includes(search) || l.target.includes(search) || l.actor.includes(search) || l.service.includes(search);
    return matchSev && matchSearch;
  });
  const counts = {
    critical: allLogs.filter(l => l.severity === "critical").length,
    high:     allLogs.filter(l => l.severity === "high").length,
    medium:   allLogs.filter(l => l.severity === "medium").length,
    info:     allLogs.filter(l => l.severity === "info").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>보안 감사</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>보안 감사 로그</h1>
            {executing && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef9c3", border: "1px solid #fde068", borderRadius: 7, padding: "4px 10px" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#d97706" }} />
                <span style={{ fontSize: 11, color: "#a16207", fontWeight: 600 }}>실시간 기록 중</span>
              </div>
            )}
            {executed && !executing && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#dcfce7", border: "1px solid #86efac", borderRadius: 7, padding: "4px 10px" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
                <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>최신 이벤트 반영됨</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 9, padding: "7px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#9ca3af" strokeWidth="1.5" /><path d="M10.5 10.5L14 14" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="직원, 담당자, 서비스 검색..." style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#111827", width: 200, fontFamily: "Inter, system-ui, sans-serif" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 14 }}>
        {([
          { key: "all",      label: "전체 이벤트", value: allLogs.length,  sub: "실시간 반영",                                                            subColor: "#6b7280" },
          { key: "critical", label: "긴급",         value: counts.critical, sub: `전체의 ${Math.round(counts.critical / allLogs.length * 100)}%`, subColor: "#dc2626" },
          { key: "high",     label: "높음",         value: counts.high,     sub: `전체의 ${Math.round(counts.high / allLogs.length * 100)}%`,     subColor: "#ea580c" },
          { key: "medium",   label: "보통",         value: counts.medium,   sub: `전체의 ${Math.round(counts.medium / allLogs.length * 100)}%`,   subColor: "#d97706" },
          { key: "info",     label: "정보",         value: counts.info,     sub: `전체의 ${Math.round(counts.info / allLogs.length * 100)}%`,     subColor: "#6366f1" },
        ] as const).map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)} style={{
            background: filter === s.key ? "#eef2ff" : "#fff",
            border: `1.5px solid ${filter === s.key ? "#6366f1" : "#f0f0f5"}`,
            borderRadius: 12, padding: "16px 18px", cursor: "pointer", textAlign: "left",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "all 0.15s",
          }}>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.02em" }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.subColor, fontWeight: 400 }}>{s.sub}</div>
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "160px 110px 1fr 130px 80px", padding: "10px 18px", borderBottom: "1px solid #f3f4f6", fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", flexShrink: 0 }}>
          <span>타임스탬프</span><span>서비스</span><span>이벤트 내용</span><span>수행자</span><span style={{ textAlign: "center" }}>심각도</span>
        </div>
        <div style={{ overflow: "auto", flex: 1 }}>
          {filtered.length === 0
            ? <div style={{ padding: "48px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>검색 결과가 없습니다.</div>
            : filtered.map((log, i) => {
              const sc = severityCfg[log.severity];
              const isNew = log.id.startsWith("RT-");
              return (
                <div key={log.id} style={{
                  display: "grid", gridTemplateColumns: "160px 110px 1fr 130px 80px",
                  padding: "11px 18px", borderBottom: i < filtered.length - 1 ? "1px solid #f9fafb" : "none",
                  alignItems: "center", background: isNew ? "#fafbff" : "transparent", transition: "background 0.1s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={e => (e.currentTarget.style.background = isNew ? "#fafbff" : "transparent")}
                >
                  <div style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 6, fontFamily: "JetBrains Mono, monospace" }}>
                    {isNew && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />}
                    {log.ts}
                  </div>
                  <div>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#6b7280", fontWeight: 500 }}>{log.service}</span>
                  </div>
                  <div style={{ paddingRight: 12 }}>
                    <div style={{ fontSize: 12, color: "#111827", fontWeight: 500, marginBottom: 2 }}>{ACTION_LABELS[log.action] ?? log.action}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.detail}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{log.target}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.actor}</div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontWeight: 600, whiteSpace: "nowrap" }}>{sc.label}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{filtered.length}개 이벤트 표시 중 (전체 {allLogs.length}개)</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb", color: "#6b7280", cursor: "pointer", fontWeight: 500 }}>CSV 내보내기</button>
          <button style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb", color: "#6b7280", cursor: "pointer", fontWeight: 500 }}>PDF 리포트</button>
        </div>
      </div>
    </div>
  );
}

const EMPLOYEE_LIST = [
  { id: "EMP-2847", name: "Alex Smith", role: "수석 개발자", dept: "엔지니어링", status: "active", lastActive: "오늘 09:47", avatar: "AS", risk: "high" },
  { id: "EMP-2831", name: "Sarah Kim", role: "마케팅 매니저", dept: "마케팅", status: "active", lastActive: "오늘 10:12", avatar: "SK", risk: "low" },
  { id: "EMP-2819", name: "James Park", role: "디자인 리드", dept: "디자인", status: "active", lastActive: "어제 17:03", avatar: "JP", risk: "low" },
  { id: "EMP-2804", name: "Emily Choi", role: "CFO", dept: "재무", status: "active", lastActive: "오늘 08:55", avatar: "EC", risk: "low" },
  { id: "EMP-2798", name: "Daniel Lee", role: "세일즈 매니저", dept: "영업", status: "offboarded", lastActive: "3일 전", avatar: "DL", risk: "none" },
  { id: "EMP-2783", name: "Mia Jung", role: "HR 매니저", dept: "인사", status: "active", lastActive: "오늘 09:30", avatar: "MJ", risk: "low" },
  { id: "EMP-2771", name: "Tom Yoon", role: "백엔드 엔지니어", dept: "엔지니어링", status: "offboarded", lastActive: "1주일 전", avatar: "TY", risk: "none" },
];

function NotionIcon({ size = 16, faded = false }: { size?: number; faded?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" opacity={faded ? 0.35 : 1}><rect x="2" y="1.5" width="12" height="13" rx="2" stroke="#8b8fa8" strokeWidth="1.4" /><path d="M5 5h6M5 8h4M5 11h3" stroke="#8b8fa8" strokeWidth="1.2" strokeLinecap="round" /></svg>;
}
function GithubIcon({ size = 16, faded = false }: { size?: number; faded?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" opacity={faded ? 0.35 : 1}><path d="M8 1.5a6.5 6.5 0 00-2.055 12.664c.325.06.445-.14.445-.312v-1.093c-1.806.393-2.188-.872-2.188-.872-.295-.75-.72-.95-.72-.95-.588-.402.045-.394.045-.394.65.046 1 .668 1 .668.58 1 1.524.71 1.894.543.059-.422.228-.71.414-.873-1.44-.164-2.954-.72-2.954-3.207 0-.708.253-1.288.668-1.742-.067-.164-.29-.824.063-1.718 0 0 .545-.175 1.784.665A6.22 6.22 0 018 6.08c.553 0 1.11.075 1.63.22 1.238-.84 1.783-.665 1.783-.665.354.894.13 1.554.064 1.718.416.454.668 1.034.668 1.742 0 2.494-1.517 3.04-2.962 3.2.233.2.44.598.44 1.204v1.785c0 .173.118.376.448.312A6.5 6.5 0 008 1.5z" fill="#8b8fa8" /></svg>;
}

// 150명 기준 단가: Slack ₩15,000·Google ₩17,000·Jira ₩8,000·ERP 정액·Notion ₩9,000·GitHub ₩28,000
const SAAS_LIST = [
  { id: "slack",  name: "Slack",             category: "메신저",      icon: SlackIcon,  users: 150, plan: "Business+",          cost: "₩2,250,000/월", status: "connected", risk: "high",   lastSync: "2분 전"  },
  { id: "google", name: "Google Workspace",  category: "협업 도구",   icon: GoogleIcon, users: 150, plan: "Business Standard",  cost: "₩2,550,000/월", status: "connected", risk: "high",   lastSync: "5분 전"  },
  { id: "jira",   name: "Jira",              category: "프로젝트 관리", icon: JiraIcon,  users:  63, plan: "Standard",           cost: "₩504,000/월",   status: "connected", risk: "medium", lastSync: "12분 전" },
  { id: "erp",    name: "사내 ERP",           category: "전사 시스템",  icon: ErpIcon,   users: 150, plan: "Enterprise",         cost: "₩4,500,000/월", status: "connected", risk: "high",   lastSync: "1분 전"  },
  { id: "notion", name: "Notion",            category: "문서 협업",   icon: NotionIcon, users:  89, plan: "Team",               cost: "₩801,000/월",   status: "connected", risk: "medium", lastSync: "8분 전"  },
  { id: "github", name: "GitHub",            category: "코드 저장소", icon: GithubIcon, users:  24, plan: "Enterprise",         cost: "₩672,000/월",   status: "connected", risk: "high",   lastSync: "3분 전"  },
];

// Heatmap data: hours (0,2,4,...22) × days (일~토), values 0–1
const HEATMAP_DATA = (() => {
  const days = 7;
  const slots = 12; // 0:00~22:00 in 2hr steps
  return Array.from({ length: slots }, (_, hi) =>
    Array.from({ length: days }, (_, di) => {
      const hour = hi * 2;
      const isWeekday = di >= 1 && di <= 5;
      const isPeak = hour >= 8 && hour <= 16;
      if (!isWeekday) return Math.random() * 0.15;
      if (isPeak) return 0.55 + Math.random() * 0.45;
      if (hour === 18 || hour === 20) return 0.1 + Math.random() * 0.2;
      return Math.random() * 0.25;
    })
  );
})();

const DAYS_KR = ["일", "월", "화", "수", "목", "금", "토"];
const HOUR_LABELS = ["0:00","2:00","4:00","6:00","8:00","10:00","12:00","14:00","16:00","18:00","20:00","22:00"];

const SAAS_OVERVIEW = [
  { name: "Slack",            cat: "커뮤니케이션", cost: "₩2,250,000", users: 150, avatar: "S", color: "#4A154B" },
  { name: "Google Workspace", cat: "협업 도구",    cost: "₩2,550,000", users: 150, avatar: "G", color: "#4285F4" },
  { name: "Jira",             cat: "프로젝트 관리", cost: "₩504,000",   users:  63, avatar: "J", color: "#0052CC" },
  { name: "사내 ERP",          cat: "전사 시스템",  cost: "₩4,500,000", users: 150, avatar: "E", color: "#374151" },
  { name: "Notion",           cat: "문서 협업",    cost: "₩801,000",   users:  89, avatar: "N", color: "#000000" },
  { name: "GitHub",           cat: "코드 저장소",  cost: "₩672,000",   users:  24, avatar: "Gh", color: "#24292e" },
];

function OverviewDashboard({ employees, empStatuses, logs, onGo }: {
  employees: typeof EMPLOYEE_LIST;
  empStatuses: Record<string, string>;
  logs: LogLine[];
  onGo: (nav: string) => void;
}) {
  const total = employees.length;
  const active = employees.filter(e => empStatuses[e.id] === "active").length;
  const offboarded = employees.filter(e => empStatuses[e.id] === "offboarded").length;
  const highRisk = employees.filter(e => e.risk === "high" && empStatuses[e.id] === "active").length;
  const monthlySaasCost = 11277000;
  const recentLogs = [...STATIC_AUDIT_LOGS].slice(0, 5);

  const sevMap = {
    critical: { color: "#dc2626", bg: "#fee2e2", label: "긴급" },
    high:     { color: "#ea580c", bg: "#ffedd5", label: "높음" },
    medium:   { color: "#d97706", bg: "#fef9c3", label: "보통" },
    info:     { color: "#6366f1", bg: "#eef2ff", label: "정보" },
  };

  return (
    <div>
      {/* 타이틀 */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>대시보드</div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>시작하기</h1>
      </div>

      {/* KPI 카드 4개 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "월간 SaaS 비용",  value: `₩${(monthlySaasCost/10000).toFixed(0)}만`,  trend: "전월 대비 8.5%",   trendUp: true },
          { label: "전체 직원",         value: `${total}명`,   trend: `재직 ${active}명 활성`,       trendUp: true },
          { label: "퇴사 처리 완료",    value: `${offboarded}명`, trend: "이번 달 2건 처리",         trendUp: false },
          { label: "보안 위험 직원",    value: `${highRisk}명`,   trend: "즉시 처리 필요",            trendUp: false },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.02em" }}>{kpi.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: kpi.trendUp ? "#16a34a" : "#dc2626", fontWeight: 400 }}>{kpi.trend}</div>
          </div>
        ))}
      </div>

      {/* 중단: SaaS 테이블 + 히트맵 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* 사용 중인 주요 SaaS */}
        <div style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>사용 중인 주요 SaaS</div>
            <button onClick={() => onGo("saas")} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>전체 앱 보기 →</button>
          </div>
          {/* 헤더 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 110px 50px", padding: "0 0 8px", borderBottom: "1px solid #f3f4f6", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
            <span>앱</span><span>카테고리</span><span style={{ textAlign: "right" }}>월간 비용</span><span style={{ textAlign: "right" }}>사용자</span>
          </div>
          {SAAS_OVERVIEW.map((app, i) => (
            <div key={app.name} style={{ display: "grid", gridTemplateColumns: "1fr 90px 110px 50px", padding: "11px 0", borderBottom: i < SAAS_OVERVIEW.length - 1 ? "1px solid #f9fafb" : "none", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: app.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{app.avatar}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{app.name}</span>
              </div>
              <span style={{ fontSize: 12, color: "#6b7280" }}>{app.cat}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#111827", textAlign: "right" }}>{app.cost}</span>
              <span style={{ fontSize: 13, color: "#6b7280", textAlign: "right" }}>{app.users}명</span>
            </div>
          ))}
        </div>

        {/* 사용량 히트맵 */}
        <div style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>사용량 히트맵</div>
            <button onClick={() => onGo("audit")} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>자세히 보기 →</button>
          </div>
          {/* Grid */}
          <div style={{ display: "flex", gap: 6 }}>
            {/* 요일 헤더 + 셀 */}
            <div style={{ flex: 1 }}>
              {/* 요일 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 4 }}>
                {DAYS_KR.map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>{d}</div>
                ))}
              </div>
              {/* 히트맵 셀 */}
              {HEATMAP_DATA.map((row, hi) => (
                <div key={hi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 3 }}>
                  {row.map((val, di) => (
                    <div key={di} title={`${DAYS_KR[di]} ${HOUR_LABELS[hi]}`} style={{
                      height: 12, borderRadius: 3,
                      background: val < 0.1 ? "#dbeafe"
                        : val < 0.3 ? "#93c5fd"
                        : val < 0.5 ? "#3b82f6"
                        : val < 0.75 ? "#1d4ed8"
                        : "#1e3a8a",
                      opacity: val < 0.05 ? 0.3 : 1,
                    }} />
                  ))}
                </div>
              ))}
              {/* 시간 레이블 — 일부만 */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {["0:00","8:00","16:00","22:00"].map(t => (
                  <span key={t} style={{ fontSize: 10, color: "#9ca3af" }}>{t}</span>
                ))}
              </div>
              {/* 범례 */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                <span style={{ fontSize: 10, color: "#9ca3af" }}>0%</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "linear-gradient(90deg, #dbeafe, #93c5fd, #3b82f6, #1d4ed8, #1e3a8a)" }} />
                <span style={{ fontSize: 10, color: "#9ca3af" }}>100%</span>
              </div>
            </div>
            {/* 오른쪽 시간 레이블 */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: 28 }}>
              {HOUR_LABELS.map(h => (
                <span key={h} style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1 }}>{h}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 감사 로그 + 위험 직원 + 빠른 이동 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 14 }}>
        {/* 최근 감사 이벤트 */}
        <div style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>최근 감사 이벤트</div>
            <button onClick={() => onGo("audit")} style={{ fontSize: 12, color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>전체 보기 →</button>
          </div>
          {recentLogs.map((log, i) => {
            const sev = sevMap[log.severity as keyof typeof sevMap] ?? sevMap.info;
            return (
              <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: i < recentLogs.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: sev.bg, color: sev.color, fontWeight: 600, whiteSpace: "nowrap", marginTop: 2 }}>{sev.label}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#111827", fontWeight: 500, lineHeight: 1.4 }}>{log.detail}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{log.ts} · {log.actor}</div>
                </div>
              </div>
            );
          })}
          {logs.length > 0 && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#eef2ff", borderRadius: 8, fontSize: 12, color: "#6366f1", fontWeight: 500 }}>
              + 실시간 이벤트 {logs.length}건 — <button onClick={() => onGo("audit")} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontWeight: 600, fontSize: 12, padding: 0 }}>감사 로그에서 확인</button>
            </div>
          )}
        </div>

        {/* 우측: 위험 직원 + 빠른 이동 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>보안 위험 직원</div>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "#fee2e2", color: "#dc2626", fontWeight: 600 }}>{highRisk}명</span>
            </div>
            {employees.filter(e => e.risk === "high" && empStatuses[e.id] === "active").map(emp => (
              <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f9fafb" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fee2e2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#dc2626", flexShrink: 0 }}>{emp.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{emp.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{emp.role}</div>
                </div>
                <button onClick={() => onGo("offboard-center")} style={{ fontSize: 11, padding: "4px 9px", borderRadius: 6, background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626", cursor: "pointer", fontWeight: 600 }}>처리</button>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 }}>빠른 이동</div>
            {[
              { label: "직원 목록", sub: "전체 직원 조회", nav: "employees" },
              { label: "퇴사 처리 센터", sub: "오프보딩 실행", nav: "offboard-center" },
              { label: "연동된 SaaS", sub: "서비스 연동 현황", nav: "saas" },
            ].map(item => (
              <button key={item.nav} onClick={() => onGo(item.nav)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "9px 0", background: "none", border: "none", borderBottom: "1px solid #f9fafb", cursor: "pointer", textAlign: "left" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.sub}</div>
                </div>
                <span style={{ color: "#9ca3af" }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OffboardingDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [integStatus, setIntegStatus] = useState<Record<string, IntegStatus>>({
    slack: "active", google: "active", jira: "active", erp: "active",
  });
  const [empStatuses, setEmpStatuses] = useState<Record<string, string>>(
    Object.fromEntries(EMPLOYEE_LIST.map(e => [e.id, e.status]))
  );
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const selectedEmp = selectedEmpId ? EMPLOYEE_LIST.find(e => e.id === selectedEmpId) ?? null : null;

  const startOffboard = (empId: string) => {
    setSelectedEmpId(empId);
    setActiveNav("offboard-center");
    setExecuting(false);
    setExecuted(false);
    setLogs([]);
    setIntegStatus({ slack: "active", google: "active", jira: "active", erp: "active" });
  };

  const handleExecute = () => {
    if (executing || executed || !selectedEmpId) return;
    setExecuting(true);
    setLogs([]);
    setEmpStatuses(p => ({ ...p, [selectedEmpId]: "offboarding" }));
    let lineId = 0;
    OFFBOARDING_SEQUENCE.forEach((entry, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev, { ...entry, id: lineId++, type: entry.type as LogLine["type"] }]);
        if (i === 2) setIntegStatus(p => ({ ...p, slack: "revoked" }));
        if (i === 3) setIntegStatus(p => ({ ...p, google: "revoked" }));
        if (i === 4) setIntegStatus(p => ({ ...p, jira: "revoked" }));
        if (i === 5) setIntegStatus(p => ({ ...p, erp: "revoked" }));
        if (i === OFFBOARDING_SEQUENCE.length - 1) {
          setExecuting(false);
          setExecuted(true);
          setEmpStatuses(p => ({ ...p, [selectedEmpId]: "offboarded" }));
        }
      }, i * 400 + 300);
    });
    setTimeout(() => setIntegStatus(p => ({ ...p, slack: "revoking" })), 100);
    setTimeout(() => setIntegStatus(p => ({ ...p, google: "revoking" })), 300);
    setTimeout(() => setIntegStatus(p => ({ ...p, jira: "revoking" })), 600);
    setTimeout(() => setIntegStatus(p => ({ ...p, erp: "revoking" })), 900);
  };

  const revokedCount = Object.values(integStatus).filter(s => s === "revoked").length;

  return (
    <div style={{ display: "flex", height: "100%", background: "#f0f2f7" }}>
      {/* 사이드바 */}
      <aside style={{ width: 208, flexShrink: 0, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
        <nav style={{ flex: 1, padding: "14px 10px" }}>
          <div style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.08em", padding: "2px 10px 10px", fontWeight: 600, textTransform: "uppercase" }}>메뉴</div>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: activeNav === item.id ? "#eef2ff" : "transparent",
              color: activeNav === item.id ? "#6366f1" : "#6b7280",
              fontSize: 13, fontWeight: activeNav === item.id ? 600 : 400,
              marginBottom: 2, textAlign: "left",
            }}>
              <item.Icon size={15} color={activeNav === item.id ? "#6366f1" : "#9ca3af"} />
              {item.label}
              {item.id === "audit" && logs.length > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 10, background: "#dcfce7", color: "#16a34a", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{logs.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding: "14px 16px", borderTop: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#eef2ff", border: "1px solid #c7d2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#6366f1", fontWeight: 700 }}>JR</div>
            <div>
              <div style={{ fontSize: 12, color: "#111827", fontWeight: 600 }}>Jamie R.</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>IT 관리자</div>
            </div>
            <div style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: "#16a34a" }} />
          </div>
        </div>
      </aside>

      {/* 메인 */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* 상단 바 */}
        <div style={{ padding: "0 24px", height: 46, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>CONTINUUM</span>
            <span style={{ color: "#d1d5db" }}>/</span>
            <span style={{ fontSize: 11, color: "#6b7280" }}>퇴사 처리 센터</span>
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>2026년 8월 25일 · 10:00</div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          {activeNav === "employees" && <EmployeeListView empStatuses={empStatuses} setEmpStatuses={setEmpStatuses} onStartOffboard={startOffboard} />}
          {activeNav === "saas" && <SaasView />}
          {activeNav === "audit" && <AuditLogView logs={logs} executed={executed} executing={executing} />}
          {activeNav === "settings" && <SettingsView />}
          {activeNav === "dashboard" && <OverviewDashboard employees={EMPLOYEE_LIST} empStatuses={empStatuses} logs={logs} onGo={(nav) => setActiveNav(nav)} />}
          {activeNav === "offboard-center" && <>
          {!selectedEmp ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, gap: 16, textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#f3f4f6", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 6 }}>퇴사 처리할 직원을 선택해주세요</div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>직원 목록에서 대상 직원을 선택하면 이 화면에서 처리할 수 있습니다.</div>
              </div>
              <button onClick={() => setActiveNav("employees")} style={{ padding: "10px 22px", borderRadius: 9, background: "#eef2ff", border: "1px solid #c7d2fe", color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                직원 목록으로 이동 →
              </button>
            </div>
          ) : (<>
          {/* 헤더 */}
          <div style={{ marginBottom: 18, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>퇴사 처리 센터</div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>퇴사 처리 센터</h1>
            </div>
            {/* 직원 카드 */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, minWidth: 290, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#eef2ff", border: "1px solid #c7d2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#6366f1", flexShrink: 0 }}>{selectedEmp.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 2 }}>{selectedEmp.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{selectedEmp.role} · {selectedEmp.dept}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 600,
                    background: empStatuses[selectedEmp.id] === "offboarded" ? "#dcfce7" : empStatuses[selectedEmp.id] === "offboarding" ? "#fef9c3" : "#f3f4f6",
                    color: empStatuses[selectedEmp.id] === "offboarded" ? "#16a34a" : empStatuses[selectedEmp.id] === "offboarding" ? "#a16207" : "#6b7280",
                    border: `1px solid ${empStatuses[selectedEmp.id] === "offboarded" ? "#86efac" : empStatuses[selectedEmp.id] === "offboarding" ? "#fde047" : "#e5e7eb"}` }}>
                    {empStatuses[selectedEmp.id] === "offboarded" ? "● 퇴사 완료" : empStatuses[selectedEmp.id] === "offboarding" ? "● 처리 중" : "● 재직 중"}
                  </span>
                  <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "JetBrains Mono, monospace" }}>ID: {selectedEmp.id}</span>
                </div>
              </div>
              <button onClick={() => setActiveNav("employees")} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, background: "#f9fafb", border: "1px solid #e5e7eb", color: "#6b7280", cursor: "pointer", fontWeight: 500 }}>변경</button>
            </div>
          </div>

          {/* 메인 그리드 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
            {/* 왼쪽 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* 실행 영역 */}
              <div style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 3 }}>퇴사 처리 실행</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>연동된 4개 서비스의 접근 권한을 즉시 일괄 취소합니다.</div>
                  </div>
                  {executed && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#dcfce7", border: "1px solid #86efac", borderRadius: 8, padding: "5px 10px", flexShrink: 0 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
                      <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>실행 완료</span>
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
                  {[
                    { label: "연동 서비스", value: "4", sub: "개 연결됨" },
                    { label: "활성 세션", value: "13", sub: "개 취소 대상" },
                    { label: "예상 소요", value: "~1.5초", sub: "완료까지" },
                    { label: "위험 수준", value: "낮음", sub: "검증 완료" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "11px 12px" }}>
                      <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, marginBottom: 4, letterSpacing: "0.04em" }}>{s.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", lineHeight: 1, marginBottom: 2 }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
                <button onClick={handleExecute} disabled={executing || executed} style={{
                  width: "100%", padding: "13px 20px", borderRadius: 10, border: "none",
                  cursor: executing || executed ? "not-allowed" : "pointer",
                  background: executed ? "#dcfce7" : executing ? "#fee2e2" : "#dc2626",
                  color: executed ? "#16a34a" : executing ? "#b91c1c" : "#fff",
                  fontSize: 14, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  boxShadow: executed || executing ? "none" : "0 4px 14px rgba(220,38,38,0.25)",
                  transition: "all 0.2s",
                }}>
                  {executing ? <><SpinIcon />퇴사 처리 시퀀스 실행 중...</>
                    : executed ? <><CheckIcon />퇴사 처리 완료</>
                    : <><BoltIcon />원클릭 퇴사 처리 실행</>}
                </button>
                {!executed && !executing && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>실행 전 HR 프로세스가 완료되었는지 확인하세요. 이 작업은 되돌릴 수 없습니다.</span>
                  </div>
                )}
              </div>

              {/* 실행 로그 */}
              <div style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 200, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #f0f0f5", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      {["#ef4444","#f59e0b","#22c55e"].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
                    </div>
                    <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "JetBrains Mono, monospace" }}>continuum — 감사-로그 — bash</span>
                  </div>
                  {executing && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b" }} />
                      <span style={{ fontSize: 10, color: "#f59e0b", fontFamily: "JetBrains Mono, monospace" }}>실시간</span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "14px 18px", fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>
                  {logs.length === 0 ? (
                    <div style={{ color: "#4b5563" }}>
                      <span>$ continuum offboard --employee {selectedEmp?.id} --mode interactive</span>
                      <span style={{ marginLeft: 1, color: "#6366f1" }}>▌</span>
                      <div style={{ marginTop: 8, color: "#374151" }}>// 실행 명령을 기다리는 중...</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ color: "#4b5563", marginBottom: 8 }}>$ continuum offboard --employee {selectedEmp?.id} --mode interactive</div>
                      {logs.map(log => (
                        <div key={log.id} style={{
                          display: "flex", gap: 12, marginBottom: 4, alignItems: "flex-start",
                          color: log.type === "complete" ? "#e8eaf0" : log.type === "success" ? "#4ade80" : "#9ca3af",
                          background: log.type === "complete" ? "rgba(99,102,241,0.1)" : "transparent",
                          padding: log.type === "complete" ? "4px 8px" : "0",
                          borderRadius: log.type === "complete" ? 4 : 0,
                          borderLeft: log.type === "complete" ? "2px solid #6366f1" : "none",
                          paddingLeft: log.type === "complete" ? 8 : 0,
                          fontWeight: log.type === "complete" ? 500 : 400,
                        }}>
                          <span style={{ color: "#6b7280", flexShrink: 0 }}>{log.time}</span>
                          <span style={{ color: log.type === "success" ? "#4ade80" : log.type === "complete" ? "#818cf8" : "#6b7280", flexShrink: 0 }}>
                            {log.type === "success" ? "✓" : log.type === "complete" ? "★" : "›"}
                          </span>
                          <span>{log.message}</span>
                        </div>
                      ))}
                      <div ref={logEndRef} />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽 — 연동 서비스 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>연동 SaaS 서비스</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{revokedCount}/{INTEGRATIONS.length}개 취소됨</div>
                  </div>
                  <div style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 600,
                    background: revokedCount === INTEGRATIONS.length ? "#dcfce7" : "#eef2ff",
                    color: revokedCount === INTEGRATIONS.length ? "#16a34a" : "#6366f1",
                    border: `1px solid ${revokedCount === INTEGRATIONS.length ? "#86efac" : "#c7d2fe"}` }}>
                    {revokedCount === INTEGRATIONS.length ? "전체 취소" : `${INTEGRATIONS.length - revokedCount}개 활성`}
                  </div>
                </div>
                {INTEGRATIONS.map((intg, i) => {
                  const status = integStatus[intg.id];
                  return (
                    <div key={intg.id} style={{ padding: "12px 18px", borderBottom: i < INTEGRATIONS.length - 1 ? "1px solid #f9fafb" : "none", display: "flex", alignItems: "center", gap: 12, background: status === "revoked" ? "#fef2f2" : "transparent", transition: "background 0.3s" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: status === "revoked" ? "#fee2e2" : "#f9fafb", border: `1px solid ${status === "revoked" ? "#fecaca" : "#e5e7eb"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <intg.Icon size={15} faded={status === "revoked"} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, color: status === "revoked" ? "#9ca3af" : "#111827", textDecoration: status === "revoked" ? "line-through" : "none" }}>{intg.name}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{intg.desc}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <StatusBadge status={status} />
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>{intg.sessions}개 세션</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 요약 */}
              <div style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>퇴사 처리 요약</div>
                {[
                  { label: "직원", value: selectedEmp?.name ?? "—" },
                  { label: "부서", value: selectedEmp?.dept ?? "—" },
                  { label: "마지막 접속", value: selectedEmp?.lastActive ?? "—" },
                  { label: "처리 담당자", value: "Jamie R." },
                  { label: "티켓 번호", value: `HR-${selectedEmp?.id.replace("EMP-", "") ?? "—"}` },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{r.label}</span>
                    <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* 진행률 */}
              {(executing || executed) && (
                <div style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>취소 진행률</span>
                    <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{revokedCount}/{INTEGRATIONS.length}</span>
                  </div>
                  <div style={{ background: "#f3f4f6", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 4, width: `${(revokedCount / INTEGRATIONS.length) * 100}%`, background: revokedCount === INTEGRATIONS.length ? "#16a34a" : "#dc2626", transition: "width 0.4s ease" }} />
                  </div>
                  {revokedCount === INTEGRATIONS.length && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "#16a34a", fontWeight: 600 }}>✓ 모든 연동 서비스 취소 완료</div>
                  )}
                </div>
              )}
            </div>
          </div>
          </>)}
          </>}
        </div>
      </main>
    </div>
  );
}

// ── 직원 목록 탭 ─────────────────────────────────────────────────────────────

function EmployeeListView({ empStatuses, setEmpStatuses, onStartOffboard }: {
  empStatuses: Record<string, string>;
  setEmpStatuses: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onStartOffboard: (empId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const employees = EMPLOYEE_LIST.map(e => ({ ...e, status: empStatuses[e.id] ?? e.status }));
  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.dept.includes(search) || e.role.includes(search)
  );
  const statusCfg: Record<string, { label: string; color: string; bg: string; border: string }> = {
    active:      { label: "재직 중",   color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
    offboarding: { label: "퇴사 처리", color: "#a16207", bg: "#fef9c3", border: "#fde047" },
    offboarded:  { label: "퇴사 완료", color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" },
  };
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>직원 관리</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>직원 목록</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 9, padding: "7px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#9ca3af" strokeWidth="1.5" /><path d="M10.5 10.5L14 14" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" /></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 부서, 직책 검색..." style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#111827", width: 190, fontFamily: "Inter, system-ui, sans-serif" }} />
            </div>
            <button style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 9, padding: "7px 16px", fontSize: 13, color: "#6366f1", cursor: "pointer", fontWeight: 600 }}>+ 직원 추가</button>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
        {(() => {
          const activeCount = employees.filter(e => e.status === "active").length;
          const offboardingCount = employees.filter(e => e.status === "offboarding").length;
          const offboardedCount = employees.filter(e => e.status === "offboarded").length;
          const deptCount = new Set(employees.map(e => e.dept)).size;
          return [
            { label: "전체 직원", value: `${employees.length}명`, sub: `부서 ${deptCount}곳`, color: "#111827", subColor: "#6b7280" },
            { label: "재직 중", value: `${activeCount}명`, sub: `전체의 ${Math.round(activeCount / employees.length * 100)}%`, color: "#16a34a", subColor: "#16a34a" },
            { label: "퇴사 처리 중", value: `${offboardingCount}명`, sub: offboardingCount > 0 ? "즉시 확인 필요" : "해당 없음", color: "#dc2626", subColor: offboardingCount > 0 ? "#dc2626" : "#9ca3af" },
            { label: "퇴사 완료", value: `${offboardedCount}명`, sub: `전체의 ${Math.round(offboardedCount / employees.length * 100)}%`, color: "#9ca3af", subColor: "#9ca3af" },
          ];
        })().map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.02em" }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.subColor, fontWeight: 400 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 130px", padding: "10px 18px", borderBottom: "1px solid #f3f4f6", fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          <span>직원</span><span>직책 / 부서</span><span>상태</span><span>마지막 접속</span><span>위험도</span><span style={{ textAlign: "right" }}>작업</span>
        </div>
        {filtered.map((emp, i) => {
          const sc = statusCfg[emp.status];
          const riskColor = emp.risk === "high" ? "#dc2626" : emp.risk === "medium" ? "#d97706" : "#16a34a";
          return (
            <div key={emp.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 130px", padding: "13px 18px", borderBottom: i < filtered.length - 1 ? "1px solid #f9fafb" : "none", alignItems: "center", transition: "background 0.1s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#eef2ff", border: "1px solid #c7d2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#6366f1", flexShrink: 0 }}>{emp.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: emp.status === "offboarded" ? "#9ca3af" : "#111827" }}>{emp.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{emp.id}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: "#374151" }}>{emp.role}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{emp.dept}</div>
              </div>
              <div>
                <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{sc.label}</span>
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{emp.lastActive}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {emp.risk !== "none" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: riskColor }} />}
                <span style={{ fontSize: 12, color: emp.risk === "none" ? "#9ca3af" : riskColor, fontWeight: emp.risk !== "none" ? 600 : 400 }}>{emp.risk === "high" ? "높음" : emp.risk === "medium" ? "보통" : emp.risk === "low" ? "낮음" : "—"}</span>
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button
                  disabled={emp.status !== "active"}
                  onClick={() => { if (emp.status === "active") onStartOffboard(emp.id); }}
                  style={{
                    fontSize: 12, padding: "4px 10px", borderRadius: 6, fontWeight: 600,
                    cursor: emp.status === "active" ? "pointer" : "not-allowed",
                    background: emp.status === "offboarded" ? "#f3f4f6" : emp.status === "offboarding" ? "#fef9c3" : "#fee2e2",
                    border: emp.status === "offboarded" ? "1px solid #e5e7eb" : emp.status === "offboarding" ? "1px solid #fde047" : "1px solid #fecaca",
                    color: emp.status === "offboarded" ? "#9ca3af" : emp.status === "offboarding" ? "#a16207" : "#dc2626",
                  }}>
                  {emp.status === "offboarding" ? "처리 중..." : emp.status === "offboarded" ? "처리 완료" : "퇴사 처리"}
                </button>
                <button style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: "#f9fafb", border: "1px solid #e5e7eb", color: "#6b7280", cursor: "pointer" }}>보기</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 연동된 SaaS 탭 ────────────────────────────────────────────────────────────

function SaasView() {
  const riskCfg: Record<string, { label: string; color: string; bg: string; border: string }> = {
    high:   { label: "높음", color: "#dc2626", bg: "#fee2e2", border: "#fecaca" },
    medium: { label: "보통", color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
    low:    { label: "낮음", color: "#16a34a", bg: "#dcfce7", border: "#86efac" },
  };
  const totalCost = "₩11,277,000";
  const totalUsers = 150;

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>SaaS 관리</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>연동된 SaaS</h1>
          <button style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 9, padding: "7px 16px", fontSize: 13, color: "#6366f1", cursor: "pointer", fontWeight: 600 }}>+ 서비스 추가</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
        {(() => {
          const highRiskCount = SAAS_LIST.filter(s => s.risk === "high").length;
          const catCount = new Set(SAAS_LIST.map(s => s.category)).size;
          return [
            { label: "연동 서비스", value: `${SAAS_LIST.length}개`, sub: "모두 연동 완료", subColor: "#16a34a" },
            { label: "총 사용자", value: `${totalUsers}명`, sub: `${catCount}개 카테고리`, subColor: "#6b7280" },
            { label: "월 총 비용", value: totalCost, sub: "전월 대비 8.5%", subColor: "#16a34a" },
            { label: "고위험 서비스", value: `${highRiskCount}개`, sub: highRiskCount > 0 ? "즉시 점검 필요" : "없음", subColor: highRiskCount > 0 ? "#dc2626" : "#9ca3af" },
          ];
        })().map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.02em" }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: 6, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.subColor, fontWeight: 400 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {SAAS_LIST.map(svc => {
          const rc = riskCfg[svc.risk];
          return (
            <div key={svc.id} style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, padding: "18px", transition: "box-shadow 0.15s", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)")}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f9fafb", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svc.icon size={18} faded={false} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{svc.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{svc.category}</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, fontWeight: 600, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                  위험 {rc.label}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "플랜", value: svc.plan },
                  { label: "사용자", value: `${svc.users}명` },
                  { label: "월 비용", value: svc.cost },
                  { label: "마지막 동기화", value: svc.lastSync },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{r.label}</span>
                    <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
                <button style={{ width: "100%", fontSize: 12, padding: "7px 0", borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb", color: "#6b7280", cursor: "pointer", fontWeight: 500 }}>설정</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 설정 탭
// ─────────────────────────────────────────────────────────────────────────────

function SettingsCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #f0f0f5", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: description ? 3 : 14 }}>{title}</div>
      {description && <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>{description}</div>}
      {children}
    </div>
  );
}

function SettingsField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 9,
  padding: "10px 13px", fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box",
  fontFamily: "Inter, sans-serif",
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 38, height: 22, borderRadius: 999, border: "none", cursor: "pointer", position: "relative",
        background: checked ? "#6366f1" : "#e5e7eb", transition: "background 0.15s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: checked ? 18 : 2, width: 18, height: 18, borderRadius: "50%",
        background: "#fff", transition: "left 0.15s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

function SettingsRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #f9fafb" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

const SETTINGS_ADMINS = [
  { id: 1, name: "Jamie R.", email: "jamie@company.com", role: "IT 관리자" },
  { id: 2, name: "Mia Jung", email: "mia@company.com", role: "HR 관리자" },
  { id: 3, name: "Emily Choi", email: "emily@company.com", role: "뷰어" },
];

const RETENTION_OPTIONS = ["즉시 삭제", "24시간 보관 후 삭제", "7일 보관 후 삭제"];

function SettingsView() {
  const [companyName, setCompanyName] = useState("포엔 주식회사");
  const [domain, setDomain] = useState("company.com");
  const [timezone, setTimezone] = useState("Asia/Seoul (GMT+9)");

  const [requireApproval, setRequireApproval] = useState(true);
  const [autoTrigger, setAutoTrigger] = useState(false);

  const [requireSourceLink, setRequireSourceLink] = useState(true);
  const [retention, setRetention] = useState(RETENTION_OPTIONS[0]);

  const [webhookCopied, setWebhookCopied] = useState(false);
  const webhookUrl = "https://api.continuum.app/webhooks/hr-offboard/9f2a1c";

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>설정</div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>워크스페이스 설정</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <SettingsCard title="조직 정보" description="퇴사 처리 알림과 리포트에 표시되는 회사 정보입니다.">
            <SettingsField label="회사명">
              <input style={inputStyle} value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </SettingsField>
            <SettingsField label="도메인">
              <input style={inputStyle} value={domain} onChange={e => setDomain(e.target.value)} />
            </SettingsField>
            <SettingsField label="시간대">
              <select style={{ ...inputStyle, cursor: "pointer" }} value={timezone} onChange={e => setTimezone(e.target.value)}>
                <option>Asia/Seoul (GMT+9)</option>
                <option>UTC</option>
              </select>
            </SettingsField>
          </SettingsCard>

          <SettingsCard title="관리자 권한" description="워크스페이스에 접근할 수 있는 관리자를 관리합니다.">
            {SETTINGS_ADMINS.map(a => (
              <SettingsRow key={a.id} label={a.name} sub={a.email}>
                <select style={{ fontSize: 12, padding: "5px 10px", borderRadius: 8, border: "1px solid #e5e7eb", color: "#374151", background: "#f9fafb", cursor: "pointer" }} defaultValue={a.role}>
                  <option>IT 관리자</option>
                  <option>HR 관리자</option>
                  <option>뷰어</option>
                </select>
              </SettingsRow>
            ))}
            <button style={{ marginTop: 12, width: "100%", fontSize: 12, padding: "9px 0", borderRadius: 8, background: "#eef2ff", border: "1px solid #c7d2fe", color: "#6366f1", cursor: "pointer", fontWeight: 600 }}>
              + 관리자 초대
            </button>
          </SettingsCard>

          <SettingsCard title="구독 플랜" description="스탠다드 플랜 · 50인 기준 기본 연동 + 권한 차단">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>₩90,000<span style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af" }}> /월</span></div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>오프보딩 처리 건당 ₩15,000 추가 과금</div>
              </div>
              <button style={{ fontSize: 12, padding: "8px 16px", borderRadius: 8, background: "#f9fafb", border: "1px solid #e5e7eb", color: "#6b7280", cursor: "pointer", fontWeight: 600 }}>플랜 변경</button>
            </div>
          </SettingsCard>
        </div>

        <div>
          <SettingsCard title="오프보딩 정책" description="원클릭 권한 회수가 실행되는 방식을 설정합니다.">
            <SettingsRow label="실행 전 관리자 승인 필요" sub="퇴사 처리 시작 시 2차 승인자 확인 요청">
              <Toggle checked={requireApproval} onChange={setRequireApproval} />
            </SettingsRow>
            <SettingsRow label="HR 이벤트 수신 시 자동 실행" sub="웹훅으로 퇴사 이벤트 수신 즉시 권한 회수 시작">
              <Toggle checked={autoTrigger} onChange={setAutoTrigger} />
            </SettingsRow>
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 12, color: "#374151", fontWeight: 600, marginBottom: 8 }}>권한 회수 처리 순서</div>
              {["Slack", "Google Workspace", "Jira", "사내 ERP"].map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b7280", padding: "4px 0" }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#f3f4f6", color: "#9ca3af", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                  {s}
                </div>
              ))}
            </div>
          </SettingsCard>

          <SettingsCard title="AI 인수인계 설정" description="권한 인식(Permission-Aware) RAG 및 데이터 보존 정책입니다.">
            <SettingsRow label="원본 출처 링크 태깅 필수" sub="AI 환각 방지를 위해 모든 항목에 출처 표기 강제">
              <Toggle checked={requireSourceLink} onChange={setRequireSourceLink} />
            </SettingsRow>
            <SettingsField label="Zero-Retention 보존 기간">
              <select style={{ ...inputStyle, cursor: "pointer" }} value={retention} onChange={e => setRetention(e.target.value)}>
                {RETENTION_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </SettingsField>
          </SettingsCard>

          <SettingsCard title="Webhook" description="HR/ERP 시스템에서 퇴사 이벤트를 전달받는 엔드포인트입니다.">
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 12px" }}>
              <code style={{ flex: 1, fontSize: 11, color: "#374151", fontFamily: "JetBrains Mono, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{webhookUrl}</code>
              <button
                onClick={() => { navigator.clipboard.writeText(webhookUrl).catch(() => {}); setWebhookCopied(true); setTimeout(() => setWebhookCopied(false), 1800); }}
                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, fontWeight: 600, cursor: "pointer", flexShrink: 0,
                  background: webhookCopied ? "#dcfce7" : "#fff", border: webhookCopied ? "1px solid #86efac" : "1px solid #e5e7eb",
                  color: webhookCopied ? "#16a34a" : "#6b7280" }}
              >
                {webhookCopied ? "✓ 복사됨" : "복사"}
              </button>
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 화면 2 — AI 업무 인수인계 어시스턴트
// ─────────────────────────────────────────────────────────────────────────────

const CHANNELS_LIST = [
  { id: "continuum", name: "continuum-ai-어시스턴트", unread: 0 },
  { id: "offboarding", name: "오프보딩-운영", unread: 3 },
  { id: "it-handover", name: "IT-인수인계-싱크", unread: 0 },
  { id: "hr-general", name: "HR-일반", unread: 1 },
];

const PINNED_FILES = [
  { id: "f1", name: "B2B_캠페인_예산_최종.xlsx", type: "xlsx", size: "48 KB", date: "8월 12일" },
  { id: "f2", name: "마케팅_회의록_7월15일.pdf", type: "pdf", size: "112 KB", date: "7월 15일" },
  { id: "f3", name: "Q3_벤더_계약서.docx", type: "docx", size: "230 KB", date: "8월 1일" },
  { id: "f4", name: "ERP_승인로그_2026.csv", type: "csv", size: "18 KB", date: "8월 12일" },
];

interface InfoRow { label: string; value: string; }
interface Source { id: string; label: string; icon: "erp" | "slack" | "doc"; }
interface ChatMessage {
  id: number; role: "user" | "ai"; author: string; avatar: string;
  timestamp: string; text: string;
  infoCard?: { title: string; rows: InfoRow[] };
  sources?: Source[];
}

const AI_BUDGET_REPLY: ChatMessage = {
  id: 3, role: "ai", author: "Continuum AI", avatar: "CA", timestamp: "오전 9:14",
  text: "찾았습니다. B2B 마케팅 캠페인 예산은 **2026년 8월 12일** CFO에 의해 **₩15,000,000**으로 최종 승인되었습니다. 최종 예산은 초기 제안 대비 200만 원 증액된 금액으로, 7월 15일 싱크 미팅에서 팀이 인플루언서 지출 확대와 LinkedIn 유료 광고 집행에 합의한 후 승인되었습니다.\n\n회의록에 따르면 세 가지 주요 결정 사항이 있습니다: (1) LinkedIn 광고에 600만 원 배정, (2) 인플루언서 파트너십 450만 원 상한, (3) 나머지 450만 원은 콘텐츠 제작비로 확보. 이후 추가 수정 내역은 없습니다.",
  infoCard: {
    title: "ERP 승인 기록",
    rows: [
      { label: "ERP 승인 ID", value: "#2026-08-12" },
      { label: "캠페인명", value: "B2B 마케팅 캠페인 Q3" },
      { label: "승인 금액", value: "₩15,000,000" },
      { label: "승인자", value: "CFO — 박민정" },
      { label: "승인일", value: "2026년 8월 12일" },
      { label: "상태", value: "승인 완료" },
    ],
  },
  sources: [
    { id: "s1", label: "ERP 재무 DB #8821", icon: "erp" },
    { id: "s2", label: "Slack #마케팅-싱크 대화록 (2026-07-15)", icon: "slack" },
    { id: "s3", label: "B2B_캠페인_예산_최종.xlsx", icon: "doc" },
  ],
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1, role: "ai", author: "Continuum AI", avatar: "CA", timestamp: "오전 9:01",
    text: "안녕하세요! 저는 Continuum AI 업무 인수인계 어시스턴트입니다. 회사의 ERP 기록, Slack 채팅 내역, 공유 드라이브, 회의록에 접근할 수 있습니다.\n\n아래 예시 질문을 클릭하거나, 직접 궁금한 내용을 입력해 보세요.",
  },
];

const SUGGESTION_REPLIES: Record<string, ChatMessage> = {
  "캠페인 담당자는 누구였나요?": {
    id: 0, role: "ai", author: "Continuum AI", avatar: "CA", timestamp: "",
    text: "B2B 마케팅 캠페인 Q3의 공식 담당자는 **김도연 마케팅 팀장**입니다. 캠페인 기획부터 예산 집행까지 전반을 총괄했으며, 현재는 **이수진 시니어 마케터**가 후임으로 인수인계를 완료한 상태입니다.\n\n비상 연락 및 캠페인 관련 문의는 이수진 시니어 마케터(sujin.lee@company.com)에게 하시면 됩니다.",
    infoCard: {
      title: "담당자 인수인계 기록",
      rows: [
        { label: "전임 담당자", value: "김도연 (마케팅 팀장)" },
        { label: "퇴사일", value: "2026년 8월 20일" },
        { label: "후임 담당자", value: "이수진 (시니어 마케터)" },
        { label: "인수인계 완료일", value: "2026년 8월 18일" },
        { label: "상태", value: "인수인계 완료" },
      ],
    },
    sources: [
      { id: "r1", label: "HR 인수인계 문서 #HR-20847", icon: "doc" },
      { id: "r2", label: "Slack #마케팅-팀 공지 (2026-08-15)", icon: "slack" },
    ],
  },
  "Q3 벤더 계약서 보여줘": {
    id: 0, role: "ai", author: "Continuum AI", avatar: "CA", timestamp: "",
    text: "Q3 벤더 계약서 3건을 확인했습니다. 모두 법무팀 검토 완료 상태이며 **2026년 9월 30일**까지 유효합니다.\n\n주요 벤더는 콘텐츠 제작사 **스튜디오블랭크**, 광고 대행사 **미디어웍스**, 인플루언서 플랫폼 **크리에이터허브**입니다. 계약 갱신 여부는 Q4 예산 확정 후 10월 초에 결정될 예정입니다.",
    infoCard: {
      title: "Q3 벤더 계약 현황",
      rows: [
        { label: "스튜디오블랭크", value: "₩4,500,000 · 콘텐츠 제작" },
        { label: "미디어웍스", value: "₩6,000,000 · 광고 집행" },
        { label: "크리에이터허브", value: "₩4,500,000 · 인플루언서" },
        { label: "계약 만료일", value: "2026년 9월 30일" },
        { label: "상태", value: "승인 완료" },
      ],
    },
    sources: [
      { id: "v1", label: "Q3_벤더_계약서.docx", icon: "doc" },
      { id: "v2", label: "ERP 구매 승인 DB #9034", icon: "erp" },
    ],
  },
  "LinkedIn 광고 세부 예산": {
    id: 0, role: "ai", author: "Continuum AI", avatar: "CA", timestamp: "",
    text: "LinkedIn 광고 예산 **₩6,000,000** 중 현재까지 **₩4,820,000**이 집행되었습니다. 잔여 예산은 **₩1,180,000**으로, 9월 캠페인 마감 전까지 스폰서드 콘텐츠 추가 집행에 사용될 예정입니다.\n\n집행 성과는 노출 수 **142만 회**, 클릭률 **3.2%**, MQL 전환 **47건**으로 목표 대비 112% 달성 중입니다.",
    infoCard: {
      title: "LinkedIn 광고 예산 집행 현황",
      rows: [
        { label: "총 배정 예산", value: "₩6,000,000" },
        { label: "집행 금액", value: "₩4,820,000" },
        { label: "잔여 예산", value: "₩1,180,000" },
        { label: "집행률", value: "80.3%" },
        { label: "MQL 전환 수", value: "47건 (목표 42건)" },
        { label: "상태", value: "승인 완료" },
      ],
    },
    sources: [
      { id: "l1", label: "ERP 재무 DB #8821 — LinkedIn 항목", icon: "erp" },
      { id: "l2", label: "LinkedIn Ads 리포트 (2026-08-24)", icon: "doc" },
    ],
  },
  "7월 15일 회의 요약": {
    id: 0, role: "ai", author: "Continuum AI", avatar: "CA", timestamp: "",
    text: "2026년 7월 15일 마케팅 싱크 미팅은 오후 2시에 화상으로 진행되었으며 총 **52분** 소요되었습니다. 참석자는 김도연 팀장, 박민정 CFO, 이수진 시니어 마케터, 최준혁 디자이너 4명입니다.\n\n핵심 결정 사항 3가지: (1) 예산 200만 원 증액 승인 — CFO 구두 승인 후 ERP 반영, (2) LinkedIn 광고 집행 우선순위 격상 — 초기 SNS 중심에서 B2B 타겟 채널로 전환, (3) 콘텐츠 제작 일정 2주 단축 — 스튜디오블랭크와 협의 완료. 다음 싱크는 8월 1일로 확정되었습니다.",
    infoCard: {
      title: "회의록 요약 — 2026-07-15",
      rows: [
        { label: "회의 유형", value: "마케팅 Q3 싱크" },
        { label: "일시", value: "2026년 7월 15일 14:00" },
        { label: "참석자", value: "4명 (전원 참석)" },
        { label: "주요 결정", value: "예산 증액 · 채널 전환 · 일정 단축" },
        { label: "다음 회의", value: "2026년 8월 1일" },
        { label: "상태", value: "승인 완료" },
      ],
    },
    sources: [
      { id: "m1", label: "마케팅_회의록_7월15일.pdf", icon: "doc" },
      { id: "m2", label: "Slack #마케팅-싱크 대화록 (2026-07-15)", icon: "slack" },
    ],
  },
};

const SUGGESTIONS = ["캠페인 담당자는 누구였나요?", "Q3 벤더 계약서 보여줘", "LinkedIn 광고 세부 예산", "7월 15일 회의 요약"];

function HandoverChat() {
  const [activeChannel, setActiveChannel] = useState("continuum");
  const [sideTab, setSideTab] = useState<"files" | "channels">("files");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const sendMsg = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || isTyping) return;
    setInput("");
    const ts = new Date().toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: Date.now(), role: "user", author: "이지은 (신규 입사자)", avatar: "이지",
      timestamp: ts, text: t,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const preset = SUGGESTION_REPLIES[t];
      if (preset) {
        setMessages(prev => [...prev, { ...preset, id: Date.now(), timestamp: ts }]);
        setUsedSuggestions(prev => new Set([...prev, t]));
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(), role: "ai", author: "Continuum AI", avatar: "CA", timestamp: ts,
          text: "회사의 인수인계 기록, ERP 로그, Slack 대화 내역을 검색 중입니다. 관련 문서를 곧 안내해 드리겠습니다. 사이드바의 고정 파일에서 주요 문서를 바로 확인하실 수도 있습니다.",
        }]);
      }
    }, 1600);
  };

  return (
    <div style={{ display: "flex", height: "100%", background: "#f0f2f7" }}>
      {/* 좌측 패널 */}
      <div style={{ width: 228, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>Continuum 워크스페이스</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ fontSize: 11, color: "#9ca3af" }}>이지은 · 현재 접속 중</span>
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          {(["files", "channels"] as const).map(tab => (
            <button key={tab} onClick={() => setSideTab(tab)} style={{
              flex: 1, padding: "9px 0", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
              background: "transparent",
              color: sideTab === tab ? "#6366f1" : "#9ca3af",
              borderBottom: sideTab === tab ? "2px solid #6366f1" : "2px solid transparent",
            }}>{tab === "files" ? "파일" : "채널"}</button>
          ))}
        </div>
        {sideTab === "files" ? (
          <div style={{ flex: 1, overflow: "auto", padding: "10px 0" }}>
            <div style={{ padding: "4px 16px 8px", fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>고정된 인수인계 파일</div>
            {PINNED_FILES.map(f => (
              <div key={f.id} style={{ padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderRadius: 8, margin: "0 8px 2px", transition: "background 0.1s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ width: 28, height: 32, borderRadius: 5, background: "#f9fafb", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileTypeIcon type={f.type} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "#374151", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{f.size} · {f.date}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ flex: 1, overflow: "auto", padding: "10px 0" }}>
            <div style={{ padding: "4px 16px 8px", fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>채널 목록</div>
            {CHANNELS_LIST.map(ch => (
              <button key={ch.id} onClick={() => setActiveChannel(ch.id)} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "8px 12px",
                background: activeChannel === ch.id ? "#eef2ff" : "transparent",
                color: activeChannel === ch.id ? "#6366f1" : "#6b7280",
                border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeChannel === ch.id ? 600 : 400,
                borderRadius: 8, margin: "0 8px 2px", width: "calc(100% - 16px)", textAlign: "left",
              }}>
                <span style={{ color: activeChannel === ch.id ? "#6366f1" : "#d1d5db", fontSize: 14 }}>#</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.name}</span>
                {ch.unread > 0 && (
                  <span style={{ background: "#6366f1", color: "#fff", fontSize: 10, padding: "1px 6px", borderRadius: 8, fontWeight: 700, flexShrink: 0 }}>{ch.unread}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 채팅 영역 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* 채팅 헤더 */}
        <div style={{ padding: "0 22px", height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 17, color: "#d1d5db" }}>#</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>continuum-ai-어시스턴트</span>
            <div style={{ width: 1, height: 14, background: "#e5e7eb", margin: "0 4px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a" }} />
              <span style={{ fontSize: 12, color: "#9ca3af" }}>Continuum AI · 온라인</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>메시지 {messages.length}개</span>
            <button style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 7, padding: "5px 12px", fontSize: 12, color: "#6366f1", cursor: "pointer", fontWeight: 600 }}>기록 보기</button>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div style={{ flex: 1, overflow: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", background: "#fafbff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>오늘 — 2026년 8월 25일</span>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          </div>

          {messages.map((msg, i) => (
            <ChatBubble key={msg.id} msg={msg} prev={messages[i - 1]} activeSource={activeSource} onSourceClick={setActiveSource} />
          ))}

          {isTyping && <TypingDots />}

          {!isTyping && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14, paddingLeft: 44 }}>
              {SUGGESTIONS.filter(s => !usedSuggestions.has(s)).map(s => (
                <button key={s} onClick={() => sendMsg(s)} style={{
                  background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20,
                  padding: "6px 14px", fontSize: 12, color: "#6b7280", cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
                >{s}</button>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* 입력창 */}
        <div style={{ padding: "12px 22px 16px", borderTop: "1px solid #e5e7eb", background: "#fff", flexShrink: 0 }}>
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#dbeafe", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#2563eb", fontWeight: 700, flexShrink: 0 }}>이지</div>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              placeholder="Continuum에게 업무 인수인계 기록에 대해 무엇이든 물어보세요..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#111827", padding: "13px 0", fontFamily: "Inter, system-ui, sans-serif" }}
            />
            <button onClick={() => sendMsg()} disabled={!input.trim() || isTyping} style={{
              width: 30, height: 30, borderRadius: 8, border: "none", cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
              background: input.trim() && !isTyping ? "#6366f1" : "#e5e7eb",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              transition: "background 0.15s",
            }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M14 2L2 7l5 3 3 5 4-13z" fill={input.trim() && !isTyping ? "#fff" : "#9ca3af"} /></svg>
            </button>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: "#d1d5db", textAlign: "center" }}>
            CONTINUUM AI · ERP · Slack · 드라이브 · 회의록 검색
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 공유 서브 컴포넌트
// ─────────────────────────────────────────────────────────────────────────────

function ChatBubble({ msg, prev, activeSource, onSourceClick }: {
  msg: ChatMessage; prev?: ChatMessage; activeSource: string | null; onSourceClick: (id: string | null) => void;
}) {
  const isAI = msg.role === "ai";
  const showHeader = !prev || prev.role !== msg.role || prev.author !== msg.author;

  const renderText = (text: string) => {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return parts.map((p, i) =>
      i % 2 === 1
        ? <strong key={i} style={{ color: "#111827", fontWeight: 700 }}>{p}</strong>
        : p.split("\n").map((line, j, arr) => <span key={`${i}-${j}`}>{line}{j < arr.length - 1 ? <br /> : null}</span>)
    );
  };

  return (
    <div style={{ display: "flex", gap: 12, padding: `${showHeader ? "12px" : "2px"} 0 2px`, alignItems: "flex-start" }}>
      <div style={{ width: 36, flexShrink: 0 }}>
        {showHeader ? (
          <div style={{
            width: 36, height: 36, borderRadius: isAI ? 10 : "50%",
            background: isAI ? "#eef2ff" : "#dbeafe",
            border: `1px solid ${isAI ? "#c7d2fe" : "#bfdbfe"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: isAI ? "#6366f1" : "#2563eb",
          }}>
            {isAI
              ? <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#6366f1" strokeWidth="1.5" /><circle cx="7" cy="7" r="2" fill="#6366f1" /></svg>
              : msg.avatar}
          </div>
        ) : <div style={{ width: 36 }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {showHeader && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: isAI ? "#6366f1" : "#111827" }}>{msg.author}</span>
            {isAI && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "#eef2ff", color: "#6366f1", border: "1px solid #c7d2fe", fontWeight: 600, letterSpacing: "0.04em" }}>AI 에이전트</span>}
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{msg.timestamp}</span>
          </div>
        )}
        <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{renderText(msg.text)}</div>

        {msg.infoCard && (
          <div style={{ marginTop: 14, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", maxWidth: 460, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ padding: "10px 16px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke="#6366f1" strokeWidth="1.5" /><path d="M3.5 4.5h5M3.5 6.5h5M3.5 8.5h3" stroke="#6366f1" strokeWidth="1" strokeLinecap="round" /></svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1" }}>{msg.infoCard.title}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>ERP 기록</span>
            </div>
            {msg.infoCard.rows.map((row, i) => (
              <div key={i} style={{ display: "flex", padding: "8px 16px", borderBottom: i < msg.infoCard!.rows.length - 1 ? "1px solid #f9fafb" : "none", background: row.label === "상태" ? "#f0fdf4" : "transparent" }}>
                <span style={{ fontSize: 12, color: "#9ca3af", width: 120, flexShrink: 0 }}>{row.label}</span>
                <span style={{
                  fontSize: 12,
                  color: row.label === "상태" ? "#16a34a" : row.label === "승인 금액" ? "#111827" : "#374151",
                  fontWeight: row.label === "승인 금액" || row.label === "상태" ? 700 : 400,
                }}>
                  {row.label === "상태"
                    ? <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />{row.value}</span>
                    : row.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {msg.sources && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.04em", marginBottom: 7 }}>출처 및 참고 자료</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {msg.sources.map((src, i) => (
                <button key={src.id} onClick={() => onSourceClick(activeSource === src.id ? null : src.id)} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${activeSource === src.id ? "#6366f1" : "#e5e7eb"}`,
                  background: activeSource === src.id ? "#eef2ff" : "#fff",
                  fontSize: 12, color: activeSource === src.id ? "#6366f1" : "#6b7280",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { if (activeSource !== src.id) { e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.color = "#6366f1"; } }}
                  onMouseLeave={e => { if (activeSource !== src.id) { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; } }}
                >
                  <SourceIconComp type={src.icon} />
                  <span style={{ fontSize: 11 }}>[출처 {i + 1}] {src.label}</span>
                </button>
              ))}
            </div>
            {activeSource && (
              <div style={{ marginTop: 8, padding: "9px 14px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, color: "#6b7280" }}>
                미리보기: {msg.sources.find(s => s.id === activeSource)?.label} — 클릭하면 ERP 뷰어에서 전체 기록을 확인할 수 있습니다
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", alignItems: "flex-start" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eef2ff", border: "1px solid #c7d2fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#6366f1" strokeWidth="1.5" /><circle cx="7" cy="7" r="2" fill="#6366f1" /></svg>
      </div>
      <div style={{ paddingTop: 6 }}>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 7 }}><span style={{ color: "#6366f1", fontWeight: 600 }}>Continuum AI</span>가 기록을 검색하고 있습니다...</div>
        <div style={{ display: "flex", gap: 5, alignItems: "center", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", animation: `chatbounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes chatbounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 아이콘
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: IntegStatus }) {
  const cfg = {
    active:   { bg: "#dcfce7", color: "#16a34a", border: "#86efac", label: "활성" },
    revoking: { bg: "#fef9c3", color: "#a16207", border: "#fde047", label: "취소 중" },
    revoked:  { bg: "#fee2e2", color: "#dc2626", border: "#fecaca", label: "취소됨" },
  }[status];
  return (
    <div style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color }} />
      {cfg.label}
    </div>
  );
}

function FileTypeIcon({ type }: { type: string }) {
  const colors: Record<string, string> = { xlsx: "#22c55e", pdf: "#ef4444", docx: "#3b82f6", csv: "#eab308" };
  return <span style={{ fontSize: 7, fontWeight: 700, color: colors[type] || "#8b8fa8", fontFamily: "JetBrains Mono, monospace" }}>{type.toUpperCase()}</span>;
}

function SourceIconComp({ type }: { type: "erp" | "slack" | "doc" }) {
  if (type === "slack") return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="3.5" cy="7" r="1.5" fill="#36C5F0" /><circle cx="7" cy="3.5" r="1.5" fill="#E01E5A" /><circle cx="7" cy="7" r="1.5" fill="#2EB67D" /><circle cx="3.5" cy="3.5" r="1.5" fill="#ECB22E" /></svg>;
  if (type === "erp") return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1" y="1" width="9" height="9" rx="2" stroke="#6366f1" strokeWidth="1.2" /><path d="M3 4.5h5M3 6.5h3.5" stroke="#6366f1" strokeWidth="1" strokeLinecap="round" /></svg>;
  return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 1h5l3 3v6H2V1z" stroke="#8b8fa8" strokeWidth="1.2" strokeLinejoin="round" /><path d="M7 1v3h3M4 6h3M4 7.5h3" stroke="#8b8fa8" strokeWidth="1" strokeLinecap="round" /></svg>;
}

function GridIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.5" /><rect x="9" y="1" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.5" /><rect x="1" y="9" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.5" /><rect x="9" y="9" width="6" height="6" rx="1.5" stroke={color} strokeWidth="1.5" /></svg>;
}
function UsersIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke={color} strokeWidth="1.5" /><path d="M1 13.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><path d="M11 4a2.5 2.5 0 010 5M14.5 13.5c0-2.485-1.57-4.5-3.5-4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function LinkIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5L9.5 6.5M7 4.5l1.5-1.5a3.536 3.536 0 115 5L12 9.5M9 11.5l-1.5 1.5a3.536 3.536 0 11-5-5L4 6.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function ShieldIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2.5 3.5V8c0 3.134 2.5 5.5 5.5 5.5s5.5-2.366 5.5-5.5V3.5L8 1.5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><path d="M5.5 8l1.5 1.5L10.5 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function SettingsIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke={color} strokeWidth="1.5" /><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function OffboardIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke={color} strokeWidth="1.5" /><path d="M1 13.5c0-2.485 2.239-4.5 5-4.5 1.2 0 2.3.4 3.2 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><path d="M10 10h5M12.5 7.5L15 10l-2.5 2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function SlackIcon({ size = 16, faded = false }: { size?: number; faded?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" opacity={faded ? 0.35 : 1}><path d="M4.5 9.5a1.5 1.5 0 01-1.5 1.5H1.5a1.5 1.5 0 010-3H3A1.5 1.5 0 014.5 9.5z" fill="#36C5F0" /><path d="M9.5 9.5A1.5 1.5 0 018 11V14.5a1.5 1.5 0 003 0V11A1.5 1.5 0 009.5 9.5z" fill="#2EB67D" /><path d="M9.5 6.5a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 010 3H11A1.5 1.5 0 019.5 6.5z" fill="#ECB22E" /><path d="M6.5 6.5A1.5 1.5 0 018 5V1.5a1.5 1.5 0 00-3 0V5A1.5 1.5 0 006.5 6.5z" fill="#E01E5A" /></svg>;
}
function GoogleIcon({ size = 16, faded = false }: { size?: number; faded?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" opacity={faded ? 0.35 : 1}><path d="M14.5 8.167c0-.467-.04-.917-.113-1.334H8v2.52h3.647a3.118 3.118 0 01-1.353 2.047v1.7h2.19c1.28-1.18 2.016-2.92 2.016-4.933z" fill="#4285F4" /><path d="M8 15c1.827 0 3.36-.607 4.48-1.64l-2.19-1.7c-.607.407-1.38.647-2.29.647-1.76 0-3.253-1.187-3.787-2.78H1.94v1.753A6.667 6.667 0 008 15z" fill="#34A853" /><path d="M4.213 9.527A3.993 3.993 0 014 8c0-.527.093-1.04.213-1.527V4.72H1.94A6.667 6.667 0 001.333 8c0 1.08.26 2.1.607 3.053l2.273-1.526z" fill="#FBBC05" /><path d="M8 4.333c.993 0 1.88.34 2.58 1.007l1.933-1.933C11.36 2.273 9.827 1.667 8 1.667A6.667 6.667 0 001.94 4.72l2.273 1.753C4.747 5.52 6.24 4.333 8 4.333z" fill="#EA4335" /></svg>;
}
function JiraIcon({ size = 16, faded = false }: { size?: number; faded?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" opacity={faded ? 0.35 : 1}><path d="M8 1.5L1.5 8 8 14.5l2.5-2.5L6 8l4.5-4L8 1.5z" fill="#2684FF" /><path d="M8 1.5l6.5 6.5-6.5 6.5-2.5-2.5L10 8 5.5 4 8 1.5z" fill="#0052CC" /></svg>;
}
function ErpIcon({ size = 16, faded = false }: { size?: number; faded?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" opacity={faded ? 0.35 : 1}><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" stroke="#8b8fa8" strokeWidth="1.5" /><rect x="9" y="1.5" width="5.5" height="5.5" rx="1" stroke="#8b8fa8" strokeWidth="1.5" /><rect x="1.5" y="9" width="5.5" height="5.5" rx="1" stroke="#8b8fa8" strokeWidth="1.5" /><rect x="9" y="9" width="5.5" height="5.5" rx="1" stroke="#6366f1" strokeWidth="1.5" /></svg>;
}
function SpinIcon() {
  return <svg style={{ animation: "spin 0.8s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>;
}
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>;
}
function BoltIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
}
function ShieldTabIcon({ active }: { active: boolean }) {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2.5 3.5V8c0 3.134 2.5 5.5 5.5 5.5s5.5-2.366 5.5-5.5V3.5L8 1.5z" stroke={active ? "#818cf8" : "#555870"} strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}
function ChatTabIcon({ active }: { active: boolean }) {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 2h12a1 1 0 011 1v8a1 1 0 01-1 1H5l-3 2V3a1 1 0 011-1z" stroke={active ? "#818cf8" : "#555870"} strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}
function PocTabIcon({ active }: { active: boolean }) {
  return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke={active ? "#818cf8" : "#555870"} strokeWidth="1.5" /><path d="M5 6h6M5 9h4" stroke={active ? "#818cf8" : "#555870"} strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
