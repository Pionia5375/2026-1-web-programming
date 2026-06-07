# PlanIt 7분 발표 스크립트

> 화면 녹화 + 내레이션. 전체 7분 이내. 각 섹션 옆 시간은 권장 누적치.

## 0:00 – 0:30 인사 + 한 줄 소개

> "안녕하세요. 컴퓨터공학부 202100580 이정입니다.
> 제가 만든 서비스는 **PlanIt** — 할 일과 일정을 한 화면에서 통합해서 관리할 수 있는 개인용 웹 서비스입니다."

화면: GitHub README 첫 화면 또는 메인 페이지 캡쳐.

## 0:30 – 1:15 만든 이유 + 사용자

> "대학생은 강의·미팅·시험처럼 시각이 정해진 **일정(Event)** 과, 과제·보고서처럼 마감일이 있는 **할 일(Task)** 을 매일 같이 다룹니다.
> 기존 도구들은 캘린더와 투두 앱이 분리되어 있어 두 곳을 오가야 하는 불편이 있었고, PlanIt 은 이걸 한 화면에 모았습니다."

## 1:15 – 1:45 기술 스택 빠르게

> "Frontend 는 React + Vite + Tailwind, 캘린더는 react-big-calendar.
> Backend 는 Express + Prisma + PostgreSQL, 인증은 bcrypt + JWT.
> 운영 환경은 Docker compose 로 db / api / web 세 컨테이너가 동시에 뜨고, Nginx 가 정적 자원과 `/api` 리버스 프록시를 같은 출처로 묶어 줍니다."

화면: `docker compose ps` 결과 또는 README의 디렉토리 트리.

## 1:45 – 4:00 시연 (가장 길게)

화면을 http://localhost:8080 에서 진행.

1. **(15초) 회원가입** — 이메일/비번 8자 이상.
2. **(15초) 로그인 후 대시보드** — "오늘 마감 할 일"과 "오늘 일정"이 자동으로 뜨는 걸 보여줌.
3. **(30초) 할 일 추가** — 제목 "보고서 작성", 우선순위 상, 마감 오늘 23:59. 우선순위 색 뱃지가 붙는 거 강조.
4. **(15초) 검색 + 필터** — 검색어 입력 → 새로 고침해도 그대로 (sessionStorage 데모).
5. **(20초) 일정 추가** — 제목 "수업", 장소 "공학관", 시작 10:00 종료 11:30.
6. **(40초) 통합 캘린더** — 월 보기에서 일정과 할 일이 한 화면에 함께 뜸. 색으로 구분(파랑=일정, 노랑=미완료 할 일, 회색=완료). 주/일/아젠다 전환 시연.
7. **(20초) 다크 모드** — 토글 → 새로 고침해도 유지 (localStorage 데모).
8. **(15초) 마감 알림** — 미리 등록해 둔 1시간 안 마감 할 일이 있으면 우상단에 브라우저 알림.

## 4:00 – 5:30 기술 포인트 (코드 살짝 보여주며)

1. **Web Storage 분담 설계** — README 표 캡쳐로 한 번에.
   - PostgreSQL = 영속, localStorage = JWT/테마, sessionStorage = 검색·뷰 상태, IndexedDB = 캐시
2. **DevTools → Application → IndexedDB** 에서 `planit-cache.tasks` 가 채워져 있는 모습.
3. **백엔드 인증 흐름** — `server/src/routes/auth.js` 의 bcrypt + JWT 발급 / `middleware/auth.js` 의 Bearer 검증.
4. **Nginx 리버스 프록시** — `docker/nginx.conf` 의 `location /api/` 블록 + gzip + immutable 캐시.

## 5:30 – 6:30 CI/CD + 배포

> "main 으로 push 가 들어오면 GitHub Actions 의 `ci.yml` 이 서버/클라이언트 빌드와 docker compose 빌드를 자동으로 돌리고, `deploy.yml` 이 Render Deploy Hook 을 호출합니다. 프런트는 Vercel 의 GitHub 연동으로 자동 배포됩니다."

화면: GitHub Actions runs 화면 + Render/Vercel 대시보드 캡쳐.

## 6:30 – 7:00 마무리

> "정리하면, PlanIt 은 14주차에 제출한 설계서를 그대로 구현해 본 풀스택 프로젝트입니다.
> 수업에서 다룬 React·Express·Docker·Nginx·CI/CD·Web Storage 를 모두 활용했고, IndexedDB 와 Notification API 같은 브라우저 표준도 함께 적용해 봤습니다.
> 한 학기 동안 좋은 강의 감사드립니다. 이상으로 발표를 마칩니다."

---

## 녹화 전 체크리스트

- [ ] 마감이 1시간 이내인 미완료 할 일 1개 미리 등록 (알림 시연용)
- [ ] 오늘 마감 할 일 2~3개, 오늘 일정 1~2개 미리 준비 (대시보드용)
- [ ] 다음 달 일정 1개 등록 (캘린더 다음 달 이동 시연용)
- [ ] 브라우저 알림 권한 허용해 두기
- [ ] 화면 녹화 1920x1080, 마이크 게인 점검
- [ ] 다크 모드 토글 전후를 한 번씩 보여줄 수 있게 시작은 라이트 모드로
