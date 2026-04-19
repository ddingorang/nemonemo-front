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

## 페이지 구성

### 고객 페이지

| 경로 | 설명 |
|------|------|
| `/` | 창고 유닛 현황 (10×5 그리드) |
| `/inquiry` | 예약 문의 제출 |

**유닛 색상 표시**
- 초록 — 이용 가능
- 주황 — 사용 중
- 노랑 — 계약 만료 7일 이내

### 관리자 페이지

| 경로 | 설명 |
|------|------|
| `/admin/login` | 로그인 |
| `/admin/dashboard` | 현황 요약 대시보드 |
| `/admin/units` | 유닛 관리 (계약 고객 정보 포함) |
| `/admin/inquiries` | 문의 관리 |

관리자 계정: `admin` / `admin1234`
