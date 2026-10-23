# AGENTS.md — 이 저장소에서 일하는 AI 에이전트에게

이 파일은 Copilot · Claude Code · Codex 같은 코딩 에이전트가 일을 시작하기 전에 읽는 규칙이다.
사람(저장소 주인)도 읽고 고친다. 맨 아래 「내 규칙」은 주인이 쓴다.

## 프로젝트
- 고등학생이 만드는 웹앱 하나. 화면은 `index.html` 한 파일(HTML · CSS · JS 함께)이고 GitHub Pages로 인터넷에 공개된다.
- 무엇을 왜 만드는지는 `README.md`의 「명세」에 있다. 코드를 바꾸기 전에 읽고, 수용 기준을 깨지 않는다.
- 빌드 도구 · 서버 · 패키지 설치가 없다. 파일을 브라우저로 열면 돈다.

## 일하는 순서
1. **계획 먼저.** 바꾸기 전에 무엇을 어느 순서로 바꿀지 3~6줄로 보여 준다. "계획만"이라고 하면 코드를 바꾸지 않는다.
2. **한 번에 한 가지.** 요청과 상관없는 부분은 고치거나 다시 쓰지 않는다. 파일 전체를 새로 쓰지 않는다.
3. **끝나면 보고.** 바꾼 곳(어느 부분, 왜)과, 주인이 직접 눌러 확인할 방법(수용 기준 번호)을 알려 준다.
4. **커밋 · 푸시는 주인이 한다.** 에이전트는 `git push`를 하지 않는다. 커밋 메시지는 제안만 한다.

## 코드 규칙
- 데이터 · 사용자 글 · 바깥에서 받은 글은 `textContent`나 `createElement`로 넣는다. `innerHTML`에는 코드에 직접 쓴 고정 글만 넣는다.
- 키 입력은 `e.code`(`"KeyD"`, `"ArrowLeft"`, `"Space"`)로 판정한다. `e.key`는 한글 입력 상태에서 바뀐다.
- 배속이 있는 앱은 판정 · 표시를 앱 안 시간 하나로 계산한다. 소리에 맞추는 앱은 노트 · 판정 · 소리를 같은 시계로 계산한다.
- 저장은 `vibe.save` / `vibe.load`(아래 vibe-local.js) 또는 `localStorage`를 `try/catch`로 감싸 쓴다.
- 라이브러리는 아래 표의 jsDelivr 고정 버전 주소만 쓴다. 새 라이브러리는 꼭 필요할 때만, 버전을 고정해서.
- 화면 글은 한국어. 단추는 `<button>`. 그림 파일 대신 CSS · SVG · 캔버스. 휴대폰 폭(375px)에서도 쓸 수 있게.
- 실패에 대비한다: 불러오는 중 · 자료 없음 · 불러오기 실패를 화면에 글로 보여 준다.

## 절대 하지 않는 것
- API 키 · 비밀번호 · 토큰을 코드나 저장소에 넣지 않는다. 이 저장소와 사이트는 누구나 본다.
- 이름 · 연락처 · 학번 · 사진 같은 개인정보를 모으거나 코드에 넣지 않는다.
- 다른 사이트의 정보를 몰래 긁어 오거나, 남의 계정 · 시스템에 접근하는 코드를 쓰지 않는다.

## 첫 버전 만들기
템플릿의 안내 화면(`index.html`, v0.0)을 주인의 첫 앱으로 바꿔 달라는 요청을 받으면 이렇게 한다.
- `README.md`의 「명세」(문제, 사용자 스토리, 수용 기준, 범위 밖)를 먼저 읽는다. 명세가 비어 있으면 만들지 말고 주인에게 채워 달라고 한다.
- S1, S2를 먼저 만들고, S3는 시간이 남으면 만든다. 「범위 밖」에 적힌 것은 만들지 않는다.
- 화면은 `index.html` 한 파일에 HTML · CSS · JS를 함께 쓴다. 안내 화면을 첫 버전으로 바꿀 때만 `index.html` 전체를 새로 쓰고, 그다음부터는 바꿀 곳만 고친다.
- 저장과 학교 정보는 `vibe-local.js`로 한다. `<script src="vibe-local.js"></script>`를 앱 스크립트보다 먼저 넣는다.
  - `await vibe.save("키", 값)` · `await vibe.load("키")` → 이 기기(브라우저)에만 저장된다.
  - `await vibe.share.add("목록", {...})` · `await vibe.share.list("목록")` → 이 기기 안 목록이다(반 친구와 공유되지 않는다). 화면에 "이 기기에만 저장돼요" 같은 안내를 한 줄 넣는다.
  - `await vibe.school.meal("2026-10-26")` · `await vibe.school.timetable({ grade, classNo, date })` · `await vibe.school.schedule({ from, to })` → 나이스 급식 · 시간표 · 학사일정을 직접 부른다. 인증키 없이 한 번에 5줄이라 **시간표는 1~5교시까지만** 온다. 6교시 이후가 비면 화면에 그 까닭을 적는다. 키를 넣지 않는다.
- 앱 속 AI(`vibe.ai`, `vibe.agent`)는 공개 사이트에서 쓸 수 없다(AI는 키와 서버가 필요하다). 규칙으로 흉내 낼 수 있으면 그렇게 하고, 아니면 「범위 밖」으로 돌리고 주인에게 알린다.
- 끝나면 수용 기준마다 주인이 직접 눌러 확인할 방법을 알려 주고, 커밋 메시지 `v0.1 첫 버전`을 제안한다.

## 쓸 수 있는 라이브러리
「코드 규칙」의 '아래 표'가 이 표다. 모두 jsDelivr의 고정 버전 주소다.

| 라이브러리 (쓰임) | 주소 |
|---|---|
| three.js (3D) | `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js` |
| three.js 부가 기능 (카메라 조작, 모델 불러오기) | `https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/` |
| Chart.js (차트, 그래프) | `https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.js` |
| Tone.js (소리, 음악) | `https://cdn.jsdelivr.net/npm/tone@15.1.22/build/Tone.js` |
| p5.js (그림, 애니메이션) | `https://cdn.jsdelivr.net/npm/p5@1.11.13/lib/p5.min.js` |
| Phaser (2D 게임) | `https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js` |
| Matter.js (2D 물리) | `https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js` |
| canvas-confetti (축하 효과) | `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.js` |

three.js는 모듈이라 `<script type="importmap">`으로 `"three"`와 `"three/addons/"`를 위 두 주소에 이어 쓴다.

## 내 규칙 (주인이 쓴다)
- 
- 
