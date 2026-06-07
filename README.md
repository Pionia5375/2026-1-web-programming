# PlanIt — 2026-1 Web Programming

할 일(Task)과 일정(Event)을 한 화면에서 통합 관리하는 개인용 웹 서비스.

> 14주차 설계서 그대로의 풀스택 구현: React + Express + Prisma + PostgreSQL + Docker + Nginx + GitHub Actions.

## 디렉토리 구조

```
2026-1-web-programming/
├── client/                  React + Vite + Tailwind + react-big-calendar
├── server/                  Express + Prisma + JWT + bcrypt + zod
├── docker/                  docker-compose.yml, nginx.conf
└── .github/workflows/       CI (ci.yml), Deploy (deploy.yml)
```

## 한 줄 실행

```bash
cd docker
docker compose up --build
```

- 웹: http://localhost:8080 (Nginx → React 정적 + `/api` 리버스 프록시)
- API 직통: http://localhost:4000/api/health
- DB: localhost:5434 (호스트 Postgres와 충돌 회피용, 컨테이너 내부는 그대로 5432)

## 기능

| 영역 | 내용 |
| --- | --- |
| 인증 | 이메일/비밀번호, bcrypt 해싱, JWT 7일 |
| 할 일 (Task) | 제목/설명/마감일/우선순위(상·중·하)/완료 토글, 검색·필터 |
| 일정 (Event) | 제목/장소/시작-종료, 종료>=시작 검증 |
| 통합 캘린더 | 월/주/일/아젠다, 한국어 로케일, 일정/할 일 통합 표시 |
| 대시보드 | 오늘 마감 할 일 + 오늘 일정 |
| 다크 모드 | localStorage 영구 저장, OS 환경 감지 |

## Web Storage / DBMS 역할 분담

| 저장소 | 용도 |
| --- | --- |
| **PostgreSQL** | 사용자/할 일/일정 영속 저장 (관계형 1:N) |
| **localStorage** | JWT(`planit.token`), 테마(`planit.theme`) |
| **sessionStorage** | 할 일 검색어/우선순위 필터, 캘린더 마지막 본 월 |
| **IndexedDB** | tasks/events 로컬 캐시 → 네트워크 장애 시 마지막 데이터 표시 |

## API

| Method | Path | 설명 | 인증 |
| --- | --- | --- | --- |
| POST | /api/auth/signup | 회원가입 | - |
| POST | /api/auth/login | 로그인 | - |
| GET  | /api/auth/me | 내 정보 | Bearer |
| GET  | /api/tasks | 할 일 목록 (q, priority, completed, from, to) | Bearer |
| POST | /api/tasks | 할 일 등록 | Bearer |
| PATCH| /api/tasks/:id | 수정 | Bearer |
| DELETE| /api/tasks/:id | 삭제 | Bearer |
| GET  | /api/events | 일정 목록 (q, from, to) | Bearer |
| POST | /api/events | 등록 | Bearer |
| PATCH| /api/events/:id | 수정 | Bearer |
| DELETE| /api/events/:id | 삭제 | Bearer |
| GET  | /api/health | 헬스체크 | - |

## 개발 환경

### 백엔드 단독 실행

```bash
cd server
cp .env.example .env
# DATABASE_URL 을 본인 환경의 Postgres에 맞게 수정
npm install
npx prisma migrate dev
npm run dev
```

### 프론트엔드 단독 실행

```bash
cd client
npm install
npm run dev   # http://localhost:5173 — /api 는 vite proxy 가 :4000 으로 전달
```

## 배포

요약:

- **Frontend**: Vercel — `client/` 폴더
- **Backend**: Render — `server/Dockerfile` 자동 감지
- **Database**: Neon Postgres 무료 플랜

### 1) Neon Postgres 준비

1. https://console.neon.tech → New Project → Region은 가까운 곳
2. `Connection string` (pooled) 복사 — 형식: `postgresql://<user>:<password>@<host>/<db>?sslmode=require`
3. 이 문자열을 **Render 백엔드 환경변수 `DATABASE_URL`** 로 그대로 사용

### 2) Render 백엔드 배포

1. https://dashboard.render.com → **New > Web Service**
2. GitHub 리포 연결 → Root Directory: `server`
3. Runtime: **Docker** (Dockerfile 자동 감지)
4. 환경변수
   - `DATABASE_URL` = Neon 연결 문자열
   - `JWT_SECRET` = 길고 무작위 (예: `openssl rand -hex 32`)
   - `JWT_EXPIRES_IN` = `7d`
   - `PORT` = `4000`
   - `CORS_ORIGIN` = `https://<Vercel 프론트 URL>` (예: `https://planit.vercel.app`)
5. 첫 배포 후 Render → Settings → **Deploy Hook URL** 복사
6. GitHub 리포 → Settings → Secrets → `RENDER_DEPLOY_HOOK_URL` 에 붙여넣기 — `.github/workflows/deploy.yml` 이 main push마다 자동 호출

### 3) Vercel 프론트 배포

1. https://vercel.com → **Add New > Project** → GitHub 리포 선택
2. **Root Directory**: `client`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. 환경변수
   - `VITE_API_BASE_URL` = `https://<Render 백엔드 URL>/api`
6. Deploy. main push마다 Vercel GitHub 연동으로 자동 배포.

### 4) 동작 확인

- `https://<vercel>/` 접속 → 회원가입 → 로그인
- 네트워크 탭에서 `/api/*` 요청이 Render URL로 가는지, CORS 통과하는지 확인
- 다크 모드 토글 → 새로고침 후 유지 확인 (localStorage)
- 할 일 검색 → 새 탭에서 다른 검색 → 원래 탭은 검색어 유지 (sessionStorage)
- DevTools → Application → IndexedDB → `planit-cache` 안에 tasks/events 캐시 확인

## CI/CD

| Workflow | 트리거 | 동작 |
| --- | --- | --- |
| `ci.yml` | PR + main push | server install + prisma generate + node --check, client npm ci + vite build, docker compose build |
| `deploy.yml` | main push | Render Deploy Hook 호출 (Vercel은 GitHub 연동으로 자동 배포) |

## 트러블슈팅 메모

- **Prisma + Alpine OpenSSL 이슈**: 베이스를 `node:20-slim`(Debian)으로, schema에 `binaryTargets = ["native", "debian-openssl-3.0.x"]` 명시.
- **호스트 Postgres 충돌**: docker DB 호스트 포트를 5434로 매핑 (`localhost:5434`). 컨테이너 내부 통신은 그대로 `db:5432`.
