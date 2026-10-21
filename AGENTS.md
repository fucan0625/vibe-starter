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

## 바이브랩에서 가져온 코드 (vibe.*)
바이브랩의 「HTML 파일로 받기」로 받은 앱은 바이브랩 주소의 라이브러리와 `vibe.js`를 불러온다.
"바이브랩에서 독립시켜 줘" 라는 요청을 받으면 다음 세 가지만 한다.

**1. 라이브러리 주소 바꾸기** — 같은 버전, 같은 파일이다.

| 바이브랩 주소 (`https://vibelab-camp.web.app` 뒤) | 바꿀 주소 |
|---|---|
| `/lib/three/three.module.min.js` | `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js` |
| `/lib/three/addons/` | `https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/` |
| `/lib/chart.umd.js` | `https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.js` |
| `/lib/Tone.js` | `https://cdn.jsdelivr.net/npm/tone@15.1.22/build/Tone.js` |
| `/lib/p5.min.js` | `https://cdn.jsdelivr.net/npm/p5@1.11.13/lib/p5.min.js` |
| `/lib/phaser.min.js` | `https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js` |
| `/lib/matter.min.js` | `https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js` |
| `/lib/confetti.browser.js` | `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.js` |

**2. vibe.js를 vibe-local.js 로** — `<script src="https://vibelab-camp.web.app/lib/vibe.js"></script>`를
`<script src="vibe-local.js"></script>`로 바꾼다. 함수 이름이 같아서 나머지 코드는 그대로 둔다.
- `vibe.save` · `vibe.load` → 이 기기에 저장된다. 그대로 둔다.
- `vibe.share.add` · `vibe.share.list` → 이 기기 안 목록이 된다(반 친구와 공유되지 않는다). 화면에 "이 기기에만 저장돼요" 같은 안내를 한 줄 넣는다.
- `vibe.school.*` → 나이스를 직접 부른다. 인증키 없이 한 번에 5줄이라 **시간표는 1~5교시까지만** 온다. 6교시 이후가 비면 화면에 그 까닭을 적는다. 키를 넣지 않는다.
- `vibe.ai` · `vibe.agent` → 공개 사이트에서는 쓸 수 없다(AI 는 키와 서버가 필요하다). 그 기능의 단추를 숨기거나 "바이브랩에서만 되는 기능" 안내로 바꾸고, 규칙으로 흉내 낼 수 있으면 그렇게 한다. 다른 기능은 그대로 돌아야 한다.

**3. 확인** — 고친 뒤 콘솔 오류가 없는지, README 수용 기준이 그대로 되는지 주인에게 확인 방법을 알려 준다.
남은 `vibelab-camp.web.app` 주소가 없어야 한다.

## 내 규칙 (주인이 쓴다)
- 
- 
