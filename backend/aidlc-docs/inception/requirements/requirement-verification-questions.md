# Employee Management - Requirements Clarification Questions

Please answer each question by filling in the letter choice after the `[Answer]:` tag. If none of the options match, choose the last option (Other) and describe your preference.

## Question 1
직원(Employee) 등록 시 어떤 정보를 입력받아야 하나요?

A) 이름, 이메일만 (최소 정보)

B) 이름, 이메일, 부서, 직책

C) 이름, 이메일, 부서, 직책, 입사일

D) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 2
이메일(employee email)은 시스템 내에서 유일해야 하나요? (오프보딩 이벤트가 이 이메일로 직원을 식별하는 데 이미 사용되고 있습니다)

A) 예, 이메일은 유일해야 하며 중복 등록 시 에러 처리

B) 아니오, 중복 허용

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
직원 삭제는 어떤 방식이어야 하나요?

A) 완전 삭제(hard delete) - DB에서 레코드 제거

B) 소프트 삭제(soft delete) - 상태만 "퇴사/비활성"으로 변경하고 이력은 보존 (이미 발생한 오프보딩 이벤트/감사 로그와의 연결을 보존하기 위해 권장)

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4
직원 목록 조회 화면에 필요한 기능은 무엇인가요? (복수 선택 가능 - 콤마로 구분해 답변)

A) 단순 목록 (페이지네이션만)

B) 이름/이메일 검색

C) 부서별 필터

D) 재직 상태(재직/퇴사) 필터

E) Other (please describe after [Answer]: tag below)

[Answer]: A, B, D

## Question 5
직원 삭제(퇴사 처리)와 기존 오프보딩 자동화 기능을 연동해야 하나요? (즉, 직원을 "삭제"하면 자동으로 Slack/Google 토큰 회수 오프보딩 이벤트가 트리거되어야 하는지)

A) 예, 직원 삭제 시 기존 오프보딩 프로세스를 자동 트리거

B) 아니오, 이번 기능은 직원 마스터 데이터 관리만 하고 오프보딩 트리거와는 분리

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
이 기능은 어디서 접근해야 하나요?

A) 기존 관리자 대시보드(frontend/App.tsx)에 새 탭("Employees") 추가

B) 별도의 새 프론트엔드 애플리케이션

C) API만 필요, UI는 불필요

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
직원 등록/삭제는 누가 수행할 수 있어야 하나요?

A) 기존 관리자 인증(JWT)을 가진 모든 관리자

B) 별도의 권한(역할 기반 접근 제어)이 필요

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8 (Property-Based Testing 확장 - 이 프로젝트에서 이미 활성화됨)
직원 등록 입력값 검증(이메일 형식, 필수 필드 등)에 대해 jqwik 기반 property-based test를 포함해야 하나요?

A) 예, 기존 프로젝트 컨벤션대로 포함

B) 아니오, 이번 기능은 단위 테스트만으로 충분

C) Other (please describe after [Answer]: tag below)

[Answer]: A
