# Requirements Document - Continuum

## Intent Analysis Summary

### User Request
Continuum: B2B AI 기반 오프보딩 및 인수인계 미들웨어 개발

### Request Type
**New Project** (Greenfield)

### Scope Estimate
**System-wide** - 완전히 새로운 B2B SaaS 플랫폼 구축

### Complexity Estimate
**Moderate to Complex** - OAuth 통합, RAG 기반 AI, 실시간 권한 차단, 멀티 테넌시

---

## 1. Project Overview

### 1.1 Product Definition
- **제품명**: Continuum (컨티넘)
- **팀명**: AgentBridge
- **한 줄 정의**: 기존 협업툴 환경을 유지하면서 단 1초 만에 퇴사자 권한을 차단하고, RAG 기반 가상 전임자로 인수인계 공백을 제로화하는 B2B AI 플러그인 미들웨어

### 1.2 Target Customer
IT 전담 인력이 부족하고 협업툴(메신저/ERP 등)이 파편화된 국내외 중소기업 및 초기 스타트업
- **규모**: 소규모 (10-50명)
- **특징**: SSO 구축 비용 부담, 수동 권한 관리, 인수인계 부재

### 1.3 Problem Statement

#### P1. 유령 권한(Ghost Privileges) 방치 및 보안 리스크
중소기업은 SSO(통합인증) 구축 비용(수천만 원) 부담으로 인해 퇴사자 발생 시 각 협업툴(슬랙, 잔디, ERP 등)의 접근 권한을 일일이 수동 차단해야 하며, 이 과정에서 누락된 권한으로 인한 기업 기밀 유출 위험이 높음.

#### P2. 업무 맥락 단절 및 인수인계 부재
인수인계 문서가 형식적이거나 파편화된 메신거/개인 PC에 머물러 있어, 후임자가 업무 전말을 파악하는 데 막대한 시간과 비용이 소요됨.

#### P3. 기존 B2B AI의 한계
기존 AI 서비스는 단순 문서 요약 수준에 그치며, 기업의 실무 DB(재무, 결재 등)와 커뮤니케이션 맥락을 교차 분석하지 못함.

---

## 2. Product Goals

### G1. 스위칭 코스트(Switching Cost) 제로화
새로운 거대 플랫폼을 도입할 필요 없이, 기업이 쓰던 툴 사이에 '기생/연결'되는 플러그인 구조 제공.

### G2. 원클릭 오프보딩(Offboarding)
HR/ERP에서 퇴사 처리 시 1초 이내에 연동된 모든 SaaS의 접근 권한 및 세션 파기.

### G3. 100% 신뢰도의 에이전틱 AI 인수인계
RAG(검색 증강 생성) 아키텍처를 통해 AI 환각(Hallucination) 현상을 차단하고, ERP 결재 및 메신저 기록 기반의 정밀 답변/출처 제공.

---

## 3. MVP Scope (Based on User Answers)

### 3.1 Phase 1 - MVP Features
**Question 1 Answer: A** - F1(원클릭 권한 차단)만 구현

MVP는 **오프보딩 자동화**에 집중하며, AI 인수인계 기능(F2)과 어댑터 패턴(F3)은 차후 단계로 연기합니다.

### 3.2 Deferred Features
- **F2**: RAG 기반 소통형 가상 전임자 (Agentic AI Onboarding Assistant) - Phase 2
- **F3**: 어댑터 패턴 API 게이트웨이 (Universal ERP/Messenger Adapter) - Phase 2

**Rationale**: 핵심 문제(유령 권한 방치)를 먼저 해결하고 시장 반응 검증 후 AI 기능 추가.

---

## 4. Functional Requirements

### FR-1: Automated Offboarding Engine (원클릭 권한 즉시 차단)

#### FR-1.1: HR/ERP 퇴사 이벤트 감지
- HR/ERP 시스템으로부터 퇴사 처리 이벤트를 REST API Webhook으로 수신
- 이벤트 페이로드에 포함되어야 할 정보: 퇴사자 이메일, 퇴사 처리 시각, 이벤트 ID

#### FR-1.2: OAuth 2.0 토큰 연쇄 차단
- Slack OAuth 토큰 즉시 만료(Revoke)
- Google Workspace OAuth 토큰 즉시 만료(Revoke)
- 연쇄 차단 시간: **1초 이내** (end-to-end)
  - 측정 기준: HR 시스템에서 퇴사 버튼 클릭 → 모든 외부 서비스 토큰 revoke API 호출 완료 및 응답 수신까지

#### FR-1.3: 세션 통제
- 각 외부 서비스에서 활성화된 모든 세션 즉시 종료
- Redis 기반 세션 캐시 무효화

#### FR-1.4: 보안 감사 로그 생성
- 오프보딩 처리 이벤트 자동 기록
- 로그 항목: 타임스탬프, 퇴사자 ID, 처리된 서비스 목록, 각 서비스의 처리 결과(성공/실패), 처리 소요 시간

#### FR-1.5: 관리자 통보
- 오프보딩 처리 완료 시 관리자에게 즉시 알림
- 실패 시 관리자에게 즉시 알림 + 수동 처리 요청

### FR-2: Web 관리 대시보드

#### FR-2.1: 인증 및 권한 관리
- 관리자 로그인 (이메일 + 비밀번호)
- Role-Based Access Control: Admin, Viewer 역할 구분

#### FR-2.2: 외부 서비스 연동 설정
- Slack OAuth 앱 연동 설정 UI
- Google Workspace OAuth 앱 연동 설정 UI
- 연동 상태 실시간 확인 (Connected / Disconnected)

#### FR-2.3: 오프보딩 이벤트 모니터링
- 최근 오프보딩 이벤트 목록 (타임스탬프, 퇴사자, 처리 결과)
- 처리 실패 이벤트 필터링 및 상세 정보 확인

#### FR-2.4: 감사 로그 조회
- 날짜 범위 기반 로그 검색
- 퇴사자 이름/이메일 기반 로그 검색
- 로그 CSV 내보내기

### FR-3: HR/ERP 시스템 통합

#### FR-3.1: Webhook 수신 엔드포인트
- REST API 엔드포인트: `POST /api/v1/offboarding/event`
- 인증: API Key (Header: `X-API-Key`)
- 요청 페이로드 예시:
```json
{
  "event_id": "evt_abc123",
  "event_type": "employee.offboarded",
  "employee_email": "john.doe@company.com",
  "offboarded_at": "2026-08-19T10:30:00Z"
}
```

#### FR-3.2: 이벤트 검증
- API Key 유효성 검증
- 페이로드 스키마 검증
- 중복 이벤트 방지 (event_id 기반 멱등성)

---

## 5. Non-Functional Requirements

### NFR-1: Performance

#### NFR-1.1: 오프보딩 처리 속도
- **목표**: HR 시스템에서 퇴사 버튼 클릭 → 모든 외부 서비스 토큰 revoke 완료까지 **1초 이내**
- **측정 지점**: Webhook 수신 시각 → 마지막 외부 서비스 API 응답 수신 시각

#### NFR-1.2: API 응답 시간
- Webhook 수신 엔드포인트: 200ms 이내 (동기 응답)
- 관리 대시보드 페이지 로드: 2초 이내

#### NFR-1.3: 동시 처리 용량
- 소규모 고객사 기준: 동시 오프보딩 이벤트 10건 처리 가능
- 응답 시간 저하 없이 처리

### NFR-2: Scalability

#### NFR-2.1: 사용자 규모
- **타깃**: 고객사당 10-50명
- **목표**: 100개 고객사 동시 지원 (총 5,000명 규모)

#### NFR-2.2: 데이터 증가
- 감사 로그 1년치 보관 (약 1,000건/고객사/년 가정)
- PostgreSQL 파티셔닝으로 성능 유지

### NFR-3: Availability & Reliability

#### NFR-3.1: 시스템 가용성
- **목표**: 99% (월 7시간 다운타임 허용)
- 모니터링: AWS CloudWatch를 통한 Uptime 추적

#### NFR-3.2: 에러 처리 및 재시도
- 외부 API 호출 실패 시 **즉시 관리자 알림 + 수동 처리 요청**
- 재시도 로직 없음 (MVP 단계, 수동 개입 우선)

#### NFR-3.3: 데이터 무결성
- 오프보딩 이벤트 처리 실패 시에도 감사 로그 기록 보장
- PostgreSQL 트랜잭션으로 일관성 유지

### NFR-4: Security

#### NFR-4.1: 인증 및 인가
- 관리자 대시보드: 이메일 + 비밀번호 기반 인증
- Webhook 엔드포인트: API Key 기반 인증
- OAuth 토큰: 암호화 저장 (AES-256)

#### NFR-4.2: 데이터 보호
- 전송 중 데이터: TLS 1.3
- 저장 데이터: PostgreSQL의 데이터 암호화 (AWS RDS 기본 제공)

#### NFR-4.3: 규정 준수
- **Question 6 Answer: D** - 특별한 규정 준수 불필요 (B2B 내부 데이터)
- GDPR/개인정보보호법 준수는 Phase 2에서 고려

### NFR-5: Maintainability

#### NFR-5.1: 코드 품질
- Java 21 + Spring Boot 기반 모듈화 아키텍처
- Property-Based Testing (PBT) 적용 (Extension 활성화)
- 기본 단위 테스트 커버리지: 핵심 로직 70% 이상

#### NFR-5.2: 문서화
- 코드 주석 (Javadoc)
- README: 프로젝트 개요, 로컬 개발 환경 설정, 배포 가이드
- API 문서는 Phase 2 (Swagger/OpenAPI)

### NFR-6: Operational

#### NFR-6.1: 배포 환경
- **AWS** (Question 16 Answer: A)
- Compute: AWS ECS (Fargate) 또는 EC2
- Database: AWS RDS (PostgreSQL)
- Cache: AWS ElastiCache (Redis)
- Load Balancer: AWS ALB

#### NFR-6.2: 모니터링 및 로깅
- **기본 로깅만** (Question 17 Answer: A)
- 애플리케이션 로그: CloudWatch Logs
- 메트릭 수집, APM 솔루션은 Phase 2

#### NFR-6.3: CI/CD
- GitHub Actions 기반 CI/CD 파이프라인
- 자동 빌드 및 테스트
- 수동 배포 승인 (MVP 단계)

---

## 6. Technical Architecture

### 6.1 Technology Stack

#### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 3.x
- **Build Tool**: Gradle 또는 Maven

#### Data Layer
- **Primary Database**: PostgreSQL 15+ (AWS RDS)
- **Cache**: Redis 7+ (AWS ElastiCache)

#### External Integrations
- **Slack API**: OAuth 2.0, Token Revocation API
- **Google Workspace API**: OAuth 2.0, Admin SDK (Token Revocation)

#### Testing
- **Unit Testing**: JUnit 5
- **Property-Based Testing**: jqwik (PBT Extension 활성화)

#### Infrastructure
- **Cloud Provider**: AWS
- **Compute**: ECS (Fargate) 또는 EC2
- **Networking**: VPC, Security Groups
- **Monitoring**: CloudWatch Logs

### 6.2 Architecture Pattern
- **Monolith** (MVP 단계 - 단순성 우선)
- **Layered Architecture**: Controller → Service → Repository
- **어댑터 패턴**: Phase 2에서 도입 (현재는 Slack/GWS 직접 통합)

### 6.3 Data Flow (Offboarding Event)

```
HR/ERP System → Webhook → Continuum API Gateway
                              ↓
                    Event Validation (API Key, Schema)
                              ↓
                    Offboarding Service
                              ↓
                    +---------+---------+
                    ↓                   ↓
            Slack API Client    Google Workspace API Client
            (Token Revoke)      (Token Revoke)
                    ↓                   ↓
            Result Aggregation
                    ↓
            Audit Log (PostgreSQL)
                    ↓
            Admin Notification
```

---

## 7. User Scenarios

### Scenario 1: 정상 오프보딩 처리
1. HR 담당자가 ERP 시스템에서 직원 "John Doe"의 퇴사 처리 버튼 클릭
2. ERP 시스템이 Continuum Webhook으로 오프보딩 이벤트 전송
3. Continuum이 이벤트 수신 및 검증
4. Slack API 호출: John Doe의 OAuth 토큰 revoke → 성공
5. Google Workspace API 호출: John Doe의 OAuth 토큰 revoke → 성공
6. Redis 세션 캐시에서 John Doe의 모든 세션 삭제
7. PostgreSQL에 감사 로그 기록
8. HR 담당자에게 이메일 알림: "John Doe 오프보딩 완료"
9. **총 소요 시간: 0.8초**

### Scenario 2: 외부 API 실패 시 처리
1. HR 담당자가 ERP 시스템에서 직원 "Jane Smith"의 퇴사 처리 버튼 클릭
2. Continuum이 이벤트 수신 및 검증
3. Slack API 호출: 성공
4. Google Workspace API 호출: **네트워크 타임아웃 (실패)**
5. 실패 결과를 감사 로그에 기록 (상태: PARTIAL_FAILURE)
6. HR 담당자에게 즉시 알림: "Jane Smith 오프보딩 부분 실패. Google Workspace 권한을 수동으로 차단해 주세요."
7. HR 담당자가 수동으로 Google Workspace Admin Console에서 권한 차단

### Scenario 3: 관리자 대시보드 조회
1. 관리자가 Continuum 웹 대시보드에 로그인
2. 메인 화면에 최근 오프보딩 이벤트 10건 표시
3. "실패" 필터 적용 → 실패한 이벤트 2건 표시
4. 특정 실패 이벤트 클릭 → 상세 정보 확인 (에러 메시지, 실패한 서비스)
5. 감사 로그 메뉴로 이동 → 지난 7일간 모든 이벤트 조회
6. CSV 내보내기 버튼 클릭 → 감사 로그 다운로드

---

## 8. Key Success Metrics (KPIs)

### KPI-1: 오프보딩 속도
- **목표**: ≤ 1.0초 (end-to-end)
- **측정**: Webhook 수신 시각 → 마지막 외부 API 응답 시각

### KPI-2: 오프보딩 성공률
- **목표**: ≥ 95% (정상 처리율)
- **측정**: 성공 이벤트 수 / 전체 이벤트 수

### KPI-3: 시스템 가용성
- **목표**: 99% (월 7시간 다운타임 허용)
- **측정**: AWS CloudWatch Uptime

### KPI-4: PoC 전환율
- **목표**: 클로즈드 베타 테스트(PoC) 참여 초기 스타트업의 정식 유료 전환율 ≥ 30%

---

## 9. Assumptions & Constraints

### Assumptions
- HR/ERP 시스템이 Webhook 기능을 지원함 (또는 커스터마이징 가능)
- Slack 및 Google Workspace가 OAuth 2.0 Token Revocation API를 제공함
- 고객사가 Slack/Google Workspace Admin 권한으로 OAuth 앱 설치 가능
- 네트워크 안정성: 외부 API 호출 성공률 ≥ 95%

### Constraints
- MVP 예산 및 일정 제약으로 F1(권한 차단)만 구현
- 보안/회복탄력성 확장 규칙은 적용하지 않음 (PoC 단계)
- 자동 재시도 로직 없음 (실패 시 수동 처리)
- 외부 서비스: Slack + Google Workspace만 지원 (Jandi, 카카오워크 등은 Phase 2)

---

## 10. Dependencies

### External Services
- Slack API (OAuth 2.0)
- Google Workspace API (Admin SDK)

### Infrastructure Dependencies
- AWS Account (RDS, ElastiCache, ECS/EC2, ALB, CloudWatch)
- Domain & SSL Certificate (관리 대시보드 HTTPS)

### Development Dependencies
- Java 21 JDK
- Gradle/Maven
- PostgreSQL Client
- Redis Client

---

## 11. Risks & Mitigations

### Risk 1: 외부 API 호출 실패
- **Likelihood**: Medium
- **Impact**: High (권한 차단 실패 → 보안 위험)
- **Mitigation**: 
  - 실패 시 즉시 관리자 알림
  - 감사 로그에 실패 기록
  - 수동 처리 프로세스 문서화

### Risk 2: 1초 성능 목표 미달성
- **Likelihood**: Medium
- **Impact**: Medium (핵심 가치 제안 손상)
- **Mitigation**:
  - 외부 API 호출 병렬 처리 (CompletableFuture)
  - Redis 캐싱으로 DB 조회 최소화
  - 성능 테스트 및 프로파일링

### Risk 3: OAuth 토큰 관리 복잡도
- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**:
  - Spring Security OAuth 라이브러리 활용
  - Token 암호화 저장 (AES-256)
  - Token 갱신 로직 구현 (Phase 2)

### Risk 4: 고객사 HR/ERP 시스템 연동 어려움
- **Likelihood**: High
- **Impact**: High (제품 채택 장벽)
- **Mitigation**:
  - Webhook 표준 문서 제공
  - 샘플 Webhook 페이로드 및 테스트 도구 제공
  - 온보딩 지원 (고객 맞춤 설정)

---

## 12. Extensions Configuration

### Enabled Extensions
- **Property-Based Testing (PBT)**: Yes (Full enforcement)
  - 모든 PBT 규칙을 필수 제약사항으로 적용
  - jqwik 프레임워크 사용 (Java)
  - 비즈니스 로직, 데이터 변환, 직렬화, 상태 관리 컴포넌트에 PBT 적용

### Disabled Extensions
- **Security Baseline**: No (PoC 단계)
- **Resiliency Baseline**: No (PoC 단계)
- **Persona Proxy**: No (모든 역할 충분히 대표됨)

---

## 13. Out of Scope (Phase 2 and Beyond)

### Phase 2 Features
- F2: RAG 기반 소통형 가상 전임자 (Agentic AI Onboarding Assistant)
- F3: 어댑터 패턴 API 게이트웨이 (Universal ERP/Messenger Adapter)
- 추가 외부 서비스: Jandi, 카카오워크, 네이버웍스, SAP, 더존
- AI 모델 통합: OpenAI GPT-4
- Vector DB: Pinecone/Weaviate
- API 문서: Swagger/OpenAPI
- 통합 테스트 및 E2E 테스트
- APM 솔루션: DataDog/New Relic
- 자동 재시도 로직
- GDPR/개인정보보호법 준수

### Phase 3 Features
- On-premise 설치 옵션
- Multi-tenant SaaS 확장
- 고급 분석 대시보드
- 고객사별 커스텀 어댑터 Low-code UI

---

## Appendix A: Glossary

- **OAuth 2.0**: 사용자 인증 및 권한 부여를 위한 개방형 표준 프로토콜
- **Token Revocation**: 발급된 OAuth 토큰을 무효화하여 더 이상 사용할 수 없게 만드는 작업
- **RAG (Retrieval-Augmented Generation)**: 외부 데이터를 검색하여 AI 생성 결과에 통합하는 기법
- **Webhook**: 이벤트 발생 시 HTTP POST 요청으로 다른 시스템에 알림을 전송하는 메커니즘
- **Offboarding**: 직원 퇴사 시 시스템 접근 권한 및 계정을 정리하는 프로세스
- **Onboarding**: 신규 입사자가 업무 환경 및 시스템에 적응하는 프로세스

---

## Appendix B: References

- [Slack API Documentation](https://api.slack.com/)
- [Google Workspace Admin SDK](https://developers.google.com/admin-sdk)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [jqwik Property-Based Testing Framework](https://jqwik.net/)

---

**Document Version**: 1.0  
**Last Updated**: 2026-08-19  
**Author**: AI-DLC Requirements Analysis  
**Status**: Approved (base MVP)

---

# Addendum: Employee Management (Feature Cycle 2)

## Intent Analysis Summary

### User Request
"직원 목록 조회, 등록, 삭제 기능 넣어줘" (Add employee list view, registration, and deletion)

### Request Type
**New Feature** (Brownfield addition — no prior Employee concept existed)

### Scope Estimate
**Multiple Components** — new backend entity/repository/service/controller/migration + new frontend tab

### Complexity Estimate
**Moderate** — standard CRUD-shape feature but touches DB schema, security config, and must integrate cleanly with the existing `employeeEmail`-based offboarding/audit data

## Functional Requirements

- **FR1 — List**: `GET /api/v1/employees` returns a paginated list of employees. Supports search by name/email (`?q=`) and filter by status (`ACTIVE`/`OFFBOARDED`) (`?status=`).
- **FR2 — Register**: `POST /api/v1/employees` creates an employee with `name`, `email`, `department`, `position`, `hireDate`. `email` must be unique (case-insensitive); duplicate register returns `409 Conflict`.
- **FR3 — Delete (soft)**: `DELETE /api/v1/employees/{id}` sets the employee's `status` to `OFFBOARDED` and stamps `offboardedAt`; the record is retained (not physically deleted) to preserve links with existing `OffboardingEvent`/`AuditLog` rows keyed by email.
- **FR4 — Detail**: `GET /api/v1/employees/{id}` returns a single employee.
- **FR5 — Frontend**: New "Employees" nav tab in `frontend/src/App.tsx` with a list/table (pagination, search, status filter), a "Register" form/modal, and a delete (offboard) action with confirmation.
- **Out of scope for this cycle**: editing/updating employee fields, role-based access control beyond existing JWT admin auth, auto-triggering the Slack/Google OAuth revocation flow from employee deletion (explicitly decoupled per user answer).

## Non-Functional Requirements

- **NFR1 — Security**: All `/api/v1/employees/**` endpoints sit behind the existing JWT filter chain (`SecurityConfig`), consistent with all other `/api/v1/**` routes.
- **NFR2 — Data integrity**: `email` has a unique constraint at the DB level (new Flyway migration `V2__create_employees_table.sql`), not just application-level validation.
- **NFR3 — Testability**: Unit tests for service/validation logic, a jqwik property-based test for employee input validation (email format, required fields), and an integration test (TestContainers) for the repository/controller, consistent with existing project conventions.
- **NFR4 — Consistency**: Follows the existing layered pattern (Controller → Service → Domain/Model → Repository) and existing `ApiResponse` DTO wrapper conventions used by other controllers.

## Data Model

### Employee (new entity)
| Field | Type | Notes |
|---|---|---|
| id | UUID/Long (match existing PK convention) | PK |
| name | varchar, not null | |
| email | varchar, not null, unique (case-insensitive) | Same value space as `OffboardingEvent.employeeEmail` |
| department | varchar, nullable | |
| position | varchar, nullable | |
| hireDate | date, nullable | |
| status | enum: ACTIVE, OFFBOARDED | default ACTIVE |
| offboardedAt | timestamp, nullable | set on soft delete |
| createdAt / updatedAt | timestamp | audit columns |

**Relationship note**: No FK is added from `OffboardingEvent`/`AuditLog` to `Employee` in this cycle (would require a backfill/migration strategy of its own) — the two remain correlated only by matching email string, same as today.

## User Answers (defaults applied, see requirement-verification-questions.md)
1. Fields: name, email, department, position, hireDate
2. Email uniqueness: enforced
3. Delete: soft delete (status change), history preserved
4. List features: pagination + name/email search + status filter
5. Decoupled from existing offboarding automation
6. UI: new tab in existing dashboard
7. Auth: existing JWT admin auth only, no new RBAC
8. Testing: jqwik property-based tests included

---

**Addendum Version**: 1.0  
**Last Updated**: 2026-09-19  
**Status**: Approved (defaults confirmed by user via "Approve & Continue")

---

# Addendum: Feature Cycle 3 — Real OAuth/Admin-Credential Integration for Slack & Google Workspace

## Problem
`IntegrationService.revokeSlackToken` / `revokeGoogleWorkspaceToken` currently send the stored app `client_secret` as a Bearer token. Neither Slack nor Google authorize admin-level revocation this way, so the current code cannot succeed against the real APIs. This cycle replaces the credential model with mechanisms that actually work.

## Decisions (see `oauth-integration-requirements-questions.md` for full rationale)
1. **Slack**: Manual token entry. A workspace admin generates a token with the required admin scope (`admin.users.session:write` — via a Slack app configured with that scope, or an existing admin-level token) themselves in Slack, and pastes it into the `POST /api/v1/integrations/slack` request. Backend validates (calls `auth.test`) and stores it encrypted. No OAuth redirect/callback flow is built.
2. **Google Workspace**: Service Account + domain-wide delegation. Admin creates a service account JSON key in Google Cloud Console, grants it domain-wide delegation with scope `https://www.googleapis.com/auth/admin.directory.user.security` in the Workspace Admin Console, and submits the JSON key + an impersonated super-admin email via `POST /api/v1/integrations/google-workspace`. Backend signs its own short-lived JWTs (via Google's service-account JWT flow) per request — no refresh token needed.
3. **Scope**: Both Slack and Google Workspace are implemented in this cycle.
4. **Data model**: `IntegrationConfig`'s existing `client_id` + `encrypted_client_secret` columns are repurposed generically:
   - Slack: `client_id` unused/null, `encrypted_client_secret` holds the encrypted bot/admin token.
   - Google: `client_id` holds the impersonated admin email, `encrypted_client_secret` holds the encrypted service-account JSON key.
   No new table; a new Flyway migration only widens `encrypted_client_secret` if needed for JSON key length.
5. **Frontend**: Out of scope for this cycle. Backend API request/response shape for `IntegrationConfigRequest` changes (see below), but no dashboard UI changes are made now.

## Functional Requirements
- **FR1**: `POST /api/v1/integrations/slack` accepts `{ "token": "xoxp-..." }`, validates it by calling Slack's `auth.test`, and stores it encrypted with status `CONNECTED` on success, `ERROR` with a message on failure.
- **FR2**: `POST /api/v1/integrations/google-workspace` accepts `{ "serviceAccountJson": "...", "adminEmail": "admin@company.com" }`, validates by minting a test JWT/access token, and stores both (JSON encrypted) with status `CONNECTED` on success.
- **FR3**: `IntegrationService.revokeSlackToken(employeeEmail)` calls Slack's `admin.users.session.reset` (or equivalent session-invalidation admin endpoint) using the stored admin token, passing the target user's Slack user ID resolved via `users.lookupByEmail`.
- **FR4**: `IntegrationService.revokeGoogleWorkspaceToken(employeeEmail)` mints an access token via the service-account JWT flow (signed JWT → Google token endpoint → access token), then calls the Admin SDK Directory API `users.signOut` (or token-revoke equivalent) for that user.
- **FR5**: `testSlackConnection()` / `testGoogleWorkspaceConnection()` are changed from stubs to real calls (`auth.test` for Slack; a lightweight Directory API read for Google) so integration status reflects reality.
- **FR6**: Existing `OffboardingEngine` parallel-execution/timeout/aggregation logic is unchanged — only the credential acquisition and the specific Slack/Google API calls inside `IntegrationService` change.

## Non-Functional Requirements
- **NFR1 — Security**: Tokens/JSON keys remain encrypted at rest via existing `EncryptionService`; never logged.
- **NFR2 — Backward compatibility**: `IntegrationConfigRequest` DTO shape changes (breaking) since the old `clientId`/`clientSecret` fields don't apply to Slack's manual-token model; Google keeps `clientId`-shaped field repurposed as `adminEmail` per the data model decision above.
- **NFR3 — Testability**: Unit tests mock the Slack/Google HTTP calls; no real external calls in the test suite.

## Out of Scope (this cycle)
- Slack OAuth "Install to Workspace" redirect flow.
- Google OAuth Authorization Code redirect flow.
- Frontend Integrations UI changes.
- Automatic credential rotation/expiry handling (Slack tokens don't expire by default; service-account JWTs are minted fresh per call so no refresh logic is needed).

---

**Addendum Version**: 1.0
**Last Updated**: 2026-09-20
**Status**: Approved via chat clarification (see `oauth-integration-requirements-questions.md`)

---

# Addendum: Feature Cycle 4 — Replace Slack `admin.*` Revocation with SCIM API

## Problem
Feature Cycle 3 implemented Slack session revocation via `admin.users.session.reset`, part of Slack's `admin.*` namespace. That namespace is **Enterprise Grid-only**. The actual target customer size is 100-150 employees, which realistically maps to Slack **Business+** (or lower), not Enterprise Grid. The Cycle 3 implementation would fail with a permission error against real target-customer workspaces.

## Decision
Replace the Slack revocation mechanism with the **SCIM API** (`https://api.slack.com/scim/v2`), available on Business+ and Enterprise Grid, and — unlike the `admin.*` namespace — does not require Enterprise Grid or SSO/SAML to be configured. The admin generates a SCIM API token themselves (same manual-token pattern approved in Cycle 3, Question 1) and pastes it into the same `POST /api/v1/integrations/slack` endpoint — no request/response shape change needed.

## Functional Requirements
- **FR1 (replaces Cycle 3 FR1/FR3/FR5)**: `configureSlack(token)` validates the token by calling SCIM `GET /Users?count=1` instead of Web API `auth.test`.
- **FR2**: `revokeSlackToken(employeeEmail)` calls SCIM `GET /Users?filter=email eq "{employeeEmail}"` to resolve the user's SCIM id, then `DELETE /Users/{id}` to deactivate the account (Slack's SCIM DELETE deactivates rather than erases the user).
- **FR3**: `testSlackConnection()` calls SCIM `GET /Users?count=1` for a lightweight liveness check.
- **FR4**: Google Workspace path (service account + domain-wide delegation, Directory API `users.signOut`) is unchanged from Cycle 3.

## Out of Scope
- No change to the `SlackIntegrationRequest` DTO shape (still just `token`).
- No change to Google Workspace integration.
- No frontend changes (still deferred, same as Cycle 3).

---

**Addendum Version**: 1.0
**Last Updated**: 2026-09-20
**Status**: Approved via chat (user selected "Slack SCIM API로 교체" after AI flagged the Enterprise Grid mismatch)
