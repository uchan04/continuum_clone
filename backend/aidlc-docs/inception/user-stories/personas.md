# User Personas - Continuum

## Overview
This document defines the primary user personas for the Continuum B2B offboarding middleware platform. Each persona represents a distinct user type with specific goals, pain points, and technical proficiency levels.

---

## Persona 1: HR Manager (김민수)

### Profile
- **Name**: 김민수 (Min-su Kim)
- **Role**: HR Manager / 인사팀장
- **Organization Size**: 10-50 employees
- **Age**: 35-45
- **Technical Proficiency**: **Medium** - Comfortable with web applications, basic IT concepts, but not a developer

### Goals
1. **Primary Goal**: 퇴사자의 시스템 접근 권한을 빠르고 안전하게 차단
2. **Secondary Goals**:
   - 오프보딩 프로세스의 완료 여부를 실시간으로 확인
   - 과거 오프보딩 이력을 추적하여 컴플라이언스 감사 대응
   - 오프보딩 실패 시 즉각적으로 알림을 받아 대응

### Pain Points
- **현재 문제**: 퇴사자 발생 시 Slack, Google Workspace, ERP 등 각 시스템에 일일이 접속하여 수동으로 권한을 제거해야 함
- **시간 낭비**: 한 명의 퇴사자 처리에 평균 30분~1시간 소요
- **누락 위험**: 바쁜 업무 중 특정 시스템의 권한 차단을 잊어버려 보안 사고 발생 우려
- **컴플라이언스**: 감사 시 "누가, 언제, 어떤 시스템에서 권한이 제거되었는지" 증명하기 어려움

### Typical Day
- 아침: 출근 후 퇴사 예정자 리스트 확인
- 오전: 퇴사자 발생 시 ERP 시스템에서 퇴사 처리
- 오전 중: 각 협업툴에 접속하여 권한 수동 제거 (30분~1시간)
- 오후: 기타 인사 업무 (채용, 평가, 복리후생)
- 월말: 감사 자료 준비 (오프보딩 로그 수집)

### User Journey with Continuum
1. ERP 시스템에서 퇴사자 "홍길동"의 퇴사 처리 버튼 클릭
2. Continuum이 자동으로 모든 연동 시스템(Slack, Google Workspace)의 권한 즉시 차단
3. 이메일로 "홍길동 오프보딩 완료" 알림 수신 (처리 시간: 0.8초)
4. Continuum 대시보드에 접속하여 처리 결과 확인
5. 월말 감사 시 Continuum에서 감사 로그 CSV 다운로드

### Success Metrics
- 퇴사자 1명당 오프보딩 처리 시간: **30분 → 1분 이내**
- 권한 차단 누락률: **10% → 0%**
- 감사 자료 준비 시간: **하루 → 10분**

---

## Persona 2: IT Administrator (이지은)

### Profile
- **Name**: 이지은 (Ji-eun Lee)
- **Role**: IT Administrator / IT 관리자
- **Organization Size**: 10-50 employees
- **Age**: 28-40
- **Technical Proficiency**: **High** - 개발자는 아니지만 API, OAuth, Webhook 등 기술 개념 이해, CLI 사용 가능

### Goals
1. **Primary Goal**: Continuum과 외부 서비스(Slack, Google Workspace) 간 OAuth 연동 설정
2. **Secondary Goals**:
   - 시스템 통합 상태(Connected/Disconnected) 실시간 모니터링
   - HR 시스템과 Continuum 간 Webhook 연동 설정 및 테스트
   - API Key 관리 및 보안 설정
   - 시스템 장애 발생 시 빠른 문제 진단 및 해결

### Pain Points
- **복잡한 통합**: 각 서비스(Slack, Google Workspace)마다 OAuth 앱 생성 절차가 다르고 복잡함
- **테스트 어려움**: Webhook 연동 후 실제로 작동하는지 테스트하기 어려움
- **장애 대응**: 외부 API 장애 시 어떤 서비스에서 문제가 발생했는지 파악하기 어려움
- **보안 책임**: OAuth 토큰, API Key 유출 시 회사 전체 시스템에 보안 사고 발생 가능

### Typical Day
- 초기 설정 시:
  - Slack Admin Console에서 OAuth 앱 생성
  - Google Workspace Admin에서 OAuth 앱 생성
  - Continuum 대시보드에서 각 서비스 연동 설정
  - HR 시스템에 Continuum Webhook URL 및 API Key 등록
  - 테스트 퇴사 이벤트 전송하여 연동 검증
- 일상 운영:
  - 주기적으로 Continuum 대시보드에서 연동 상태 확인
  - 외부 API 장애 알림 수신 시 문제 서비스 식별 및 재연동
  - 분기별 OAuth 토큰 갱신 (Phase 2 기능)

### User Journey with Continuum
1. **초기 설정**:
   - Continuum 관리자 계정 생성 및 로그인
   - "External Services" 메뉴에서 "Connect Slack" 클릭
   - Slack OAuth 앱 생성 가이드 문서 참고
   - Slack Admin Console에서 OAuth 앱 생성 후 Client ID, Secret 복사
   - Continuum에 Slack OAuth 정보 입력 및 연동 완료
   - Google Workspace도 동일한 절차로 연동
   - "Webhook Settings" 메뉴에서 Webhook URL 및 API Key 복사
   - HR 시스템 관리자에게 전달하여 등록 요청
2. **일상 운영**:
   - 대시보드에서 연동 상태 실시간 확인 (초록색 Connected 표시)
   - 실패 알림 수신 시 "Audit Logs" 메뉴에서 에러 상세 정보 확인
   - 필요 시 연동 재설정 또는 외부 서비스 관리자에게 에스컬레이션

### Success Metrics
- 초기 설정 완료 시간: **4시간 → 1시간**
- 연동 장애 발생 시 문제 식별 시간: **30분 → 5분**
- OAuth 토큰 관리 오류율: **5% → 0%**

---

## Persona 3: System Operator (박상현)

### Profile
- **Name**: 박상현 (Sang-hyun Park)
- **Role**: System Operator / 시스템 운영자
- **Organization Size**: 10-50 employees (또는 MSP 서비스 제공자)
- **Age**: 25-35
- **Technical Proficiency**: **Very High** - 개발자 또는 DevOps 엔지니어, 로그 분석, 장애 대응 전문

### Goals
1. **Primary Goal**: 시스템 장애 및 오프보딩 실패 이벤트 신속 대응
2. **Secondary Goals**:
   - 과거 감사 로그 조회 및 분석 (특정 직원, 날짜 범위, 실패 이벤트 필터링)
   - 시스템 성능 모니터링 (오프보딩 처리 시간, 성공률)
   - 컴플라이언스 감사 자료 준비 (CSV 내보내기)
   - 정기 보고서 작성 (월별 오프보딩 통계)

### Pain Points
- **로그 분산**: 각 시스템(Slack, Google Workspace, ERP)의 로그가 분산되어 있어 통합 조회 불가
- **장애 원인 파악 어려움**: 오프보딩 실패 시 어떤 단계에서 실패했는지 추적하기 어려움
- **수동 보고서 작성**: 월말 보고서를 위해 수동으로 데이터 집계 (엑셀 작업)
- **사후 대응**: 실패 이벤트 발생 후에야 알게 되어 즉각 대응 불가

### Typical Day
- 아침: Continuum 대시보드 접속하여 전날 오프보딩 이벤트 확인
- 오전: 실패 이벤트 필터링 → 상세 로그 확인 → 원인 분석 (네트워크 타임아웃, OAuth 토큰 만료 등)
- 오전 중: IT 관리자에게 재연동 요청 또는 HR 팀에 수동 처리 가이드 전달
- 오후: 정상 운영 (다른 시스템 모니터링)
- 월말: Continuum 감사 로그 조회 → 날짜 범위 지정 (지난 30일) → CSV 다운로드 → 경영진 보고서 작성

### User Journey with Continuum
1. **일상 모니터링**:
   - 아침 출근 후 Continuum 대시보드 접속
   - "Recent Offboarding Events" 섹션에서 최근 10건 확인
   - "실패" 필터 적용 → 실패 이벤트 2건 발견
   - 실패 이벤트 클릭 → 상세 정보 확인:
     - 퇴사자: 홍길동
     - 실패 서비스: Google Workspace
     - 에러 메시지: "Network timeout after 5 seconds"
     - 처리 시각: 2026-08-18 14:23:45
   - IT 관리자에게 "Google Workspace API 연결 불안정" 보고
2. **감사 로그 조회**:
   - "Audit Logs" 메뉴 클릭
   - 날짜 범위: 2026-07-01 ~ 2026-07-31 (지난달)
   - 검색어: (비워둠, 전체 조회)
   - 결과: 15건의 오프보딩 이벤트 (13건 성공, 2건 부분 실패)
   - "Export CSV" 버튼 클릭 → 로그 다운로드 → 경영진 보고서에 첨부

### Success Metrics
- 실패 이벤트 대응 시간: **2시간 → 15분**
- 감사 자료 준비 시간: **4시간 → 10분**
- 로그 조회 정확도: **70% → 100%** (통합 로그 덕분)

---

## Persona Mapping to Requirements

| Persona | Primary Features Used | Key User Stories |
|---|---|---|
| **HR Manager** | Offboarding event triggering (via ERP), Dashboard monitoring, Email notifications | "Process employee offboarding", "Monitor offboarding status", "Receive failure alerts" |
| **IT Administrator** | OAuth integration setup, External service status monitoring, Webhook configuration | "Configure Slack integration", "Monitor connection status", "Set up webhook endpoint" |
| **System Operator** | Audit log query, Failure event filtering, CSV export, Performance monitoring | "Query audit logs", "Filter failed events", "Export compliance reports" |

---

## Shared Characteristics

### All Personas
- **Motivation**: 보안 강화, 업무 효율화, 컴플라이언스 준수
- **Frustration**: 수동 작업, 시간 낭비, 휴먼 에러, 로그 분산
- **Expectation**: 자동화, 실시간성, 신뢰성, 사용 편의성

### Technical Proficiency Spectrum
- **Low**: (N/A - Continuum의 모든 사용자는 최소 Medium 수준)
- **Medium**: HR Manager - Web UI 사용 가능, 기술 용어 이해 제한적
- **High**: IT Administrator - API, OAuth 개념 이해, 설정 가능
- **Very High**: System Operator - 로그 분석, 장애 진단, 개발자 수준

---

## Design Implications

### For HR Manager
- **UI/UX**: 간단하고 직관적인 대시보드, 최소한의 클릭
- **Language**: 비기술 용어 사용 (예: "권한 차단" vs "OAuth token revocation")
- **Feedback**: 즉각적인 시각적 피드백 (성공 아이콘, 실패 경고)

### For IT Administrator
- **UI/UX**: 단계별 연동 가이드, 테스트 도구 제공
- **Language**: 기술 용어 허용 (OAuth, Webhook, API Key)
- **Documentation**: 상세한 설정 가이드, 트러블슈팅 문서

### For System Operator
- **UI/UX**: 고급 필터링, 정렬, 검색 기능
- **Language**: 기술 용어 + 에러 코드, 스택 트레이스
- **Export**: CSV, JSON 등 다양한 포맷 지원

---

**Document Version**: 1.0  
**Last Updated**: 2026-08-19  
**Author**: AI-DLC User Stories Generation  
**Status**: Generated
