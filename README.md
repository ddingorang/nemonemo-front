# Created: 2026-04-19 23:14:41
# nemonemo-front

공유 스토리지 예약 및 계약 관리 시스템의 프론트엔드입니다.

## 기술 스택

- React 18 + Vite 5
- React Router v6
- Axios
- Tailwind CSS
- Recharts

## 실행 방법

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드 → /dist
npm run preview  # 프로덕션 빌드 미리보기
```

백엔드(`http://localhost:8080`)가 먼저 실행되어 있어야 합니다.  
Vite 개발 서버는 `/api/*` 요청을 `http://localhost:8080`으로 프록시합니다.

## 페이지 구성

### 고객 페이지

| 경로 | 설명 |
|------|------|
| `/` | 창고 유닛 현황 (10×5 그리드) |
| `/inquiry` | 예약 문의 제출 |

**유닛 색상 표시**

| 색상 | 상태 |
|------|------|
| 초록 | 이용 가능 |
| 주황 | 사용 중 |
| 노랑 | 계약 만료 7일 이내 |
| 회색 | 비활성화 |

### 관리자 페이지

| 경로 | 설명 |
|------|------|
| `/admin/login` | 로그인 |
| `/admin/dashboard` | 현황 요약 대시보드 |
| `/admin/units` | 유닛 관리 (계약·고객 정보 통합) |
| `/admin/contracts` | 계약 조회 (월별 네비게이션, 상태 필터) |
| `/admin/inquiries` | 문의 관리 (상태 변경, 관리자 메모) |
| `/admin/memos` | 메모 (내부 메모 작성·고정) |

관리자 계정: `admin` / `admin1234`

모든 관리자 경로는 `localStorage`의 토큰을 확인하는 `<ProtectedRoute>`로 보호됩니다.

## 주요 기능

### 유닛 관리 (`/admin/units`)

- 창고 유닛 그리드(WarehouseGrid)와 테이블을 동시에 표시
- 활성 계약이 있는 유닛은 계약 정보(고객명·연락처·기간·금액 등)를 테이블에 통합 표시
- 사이즈별 필터(XS / S / M / L / XL)
- 만료 임박(7일 이내) 행 강조
- 유닛 상태 수동 변경: `RESERVED`·`DISABLED`·`MAINTENANCE`로 설정 시 활성 계약이 있어도 해당 상태 우선 표시
- 계약 신규 생성·수정·해지

### 계약 조회 (`/admin/contracts`)

- 월별 네비게이션으로 기간 필터
- 상태별 필터(ACTIVE / EXPIRED / TERMINATED)
- 사용 기간 컬럼 자동 계산

### 문의 관리 (`/admin/inquiries`)

- 접수된 예약 문의 목록 및 상세 보기
- 상태 변경(접수 / 처리 중 / 완료 / 취소)
- 관리자 메모 저장
- 문의 삭제

### 메모 (`/admin/memos`)

- 내부 업무 메모 작성·수정·삭제
- 고정(pinned) 메모는 상단 섹션에 분리 표시
- 카드 hover 시 고정 토글 버튼 노출

## 아키텍처

### API 클라이언트 (`src/api/client.js`)

단일 Axios 인스턴스 (`baseURL: /api`):
- **요청 인터셉터**: `Authorization: Bearer <token>` 헤더 자동 첨부
- **응답 인터셉터**: `.data` 언래핑, 401 시 토큰 제거 후 로그인 리다이렉트, 에러 발생 시 `app:error` 커스텀 이벤트 디스패치 → `ErrorModal` 표시

### 주요 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| `DataTable` | 검색·정렬·페이지네이션(20행) 지원 범용 테이블 |
| `WarehouseGrid` | 유닛 상태를 색상으로 시각화한 창고 그리드 |
| `ConfirmModal` | 삭제·해지 등 위험 동작 전 확인 모달 |
| `ErrorModal` | API 에러 전역 표시 모달 |
| `AdminLayout` | 사이드바 네비게이션 + `<Outlet>` 레이아웃 |

### 컴포넌트 규칙

- **모달**: `fixed inset-0` 방식, `modal === 'create' | 'edit' | null` 상태로 제어
- **폼**: `setForm(p => ({...p, [key]: value}))` 패턴
- **상태 배지**: 페이지별 `STATUS_CLASS` 객체로 Tailwind 클래스 매핑
- **버튼 클래스**: `src/styles/index.css`의 `@layer components`에 정의 — `.btn-primary`, `.btn-outline`, `.btn-ghost`, `.btn-sm`, `.btn-edit`, `.btn-delete`
- **날짜**: ISO 문자열 그대로 사용, `.slice(0, 10)`으로 표시
- **UI 언어**: 한국어 전용
