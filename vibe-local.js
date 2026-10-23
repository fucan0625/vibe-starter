/* vibe-local.js — 저장과 학교 정보(나이스)를 쉽게 쓰게 해 주는 작은 도구
   index.html 에서 앱 스크립트보다 먼저 <script src="vibe-local.js"></script> 로 불러온다.
   GitHub Pages(공개 주소)와 내 컴퓨터 미리보기에서 똑같이 동작한다.

   await vibe.save("키", 값) · await vibe.load("키")   → 이 기기(브라우저)에만 저장 (localStorage)
   await vibe.share.add("목록", {...}) · .list("목록")  → 이 기기 안 목록 (반 친구와 공유되지 않는다)
   await vibe.school.meal("2026-10-26")                 → 나이스 급식 [{ date, meal, menu:[{ name, allergy }], kcal }]
   await vibe.school.timetable({ grade, classNo, date }) → 시간표 [{ date, period, subject }] (인증키 없이는 1~5교시까지)
   await vibe.school.schedule({ from, to })              → 학사일정 [{ date, event }]
   vibe.ai · vibe.agent                                  → 공개 사이트에서는 쓸 수 없다 (AI 는 키와 서버가 필요하다)

   학교를 바꾸려면 아래 SCHOOL 두 칸만 고친다. 코드는 나이스 교육정보 개방 포털의 '학교기본정보'에서 찾는다.
   인증키는 넣지 않는다. 이 파일은 인터넷에 공개된다. */
(function () {
  var SCHOOL = { atpt: "I10", code: "9300180" };   // 시도교육청 코드 · 학교 코드 (예: 세종특별자치시교육청 I10)
  var APP = (document.title || "app").replace(/\s+/g, "-").slice(0, 30);   // 저장 칸 이름이 다른 앱과 섞이지 않게

  function key(k) { return "vibe:" + APP + ":" + k; }
  var memory = {};
  function read(k) {
    try { var v = localStorage.getItem(key(k)); return v == null ? null : JSON.parse(v); }
    catch (e) { return memory[k] === undefined ? null : memory[k]; }
  }
  function write(k, v) {
    try { localStorage.setItem(key(k), JSON.stringify(v)); }
    catch (e) { memory[k] = v; }
  }

  // ── 학교 정보 (나이스 Open API 를 직접 부른다. 키 없이는 한 번에 5줄이라 하루씩 쪼갠다) ──
  var ALLERGY = ["", "난류", "우유", "메밀", "땅콩", "대두", "밀", "고등어", "게", "새우", "돼지고기", "복숭아", "토마토", "아황산류", "호두", "닭고기", "쇠고기", "오징어", "조개류", "잣"];
  var cache = {};
  function ymd(v) {
    if (v instanceof Date) {
      var p = function (n) { return (n < 10 ? "0" : "") + n; };
      return v.getFullYear() + p(v.getMonth() + 1) + p(v.getDate());
    }
    var s = String(v == null ? "" : v).replace(/[^0-9]/g, "");
    if (!/^20\d{6}$/.test(s)) throw new Error("날짜는 2026-10-26 처럼 적어 주세요.");
    return s;
  }
  function dash(s) { return s.slice(0, 4) + "-" + s.slice(4, 6) + "-" + s.slice(6, 8); }
  function today() { return ymd(new Date()); }
  function days(from, to) {
    var out = [];
    var d = new Date(Date.UTC(+from.slice(0, 4), +from.slice(4, 6) - 1, +from.slice(6, 8)));
    var end = new Date(Date.UTC(+to.slice(0, 4), +to.slice(4, 6) - 1, +to.slice(6, 8)));
    if (end < d) throw new Error("끝 날짜가 시작 날짜보다 앞이에요.");
    while (d <= end) {
      out.push(d.toISOString().slice(0, 10).replace(/-/g, ""));
      if (out.length > 31) throw new Error("한 번에 31일까지만 받을 수 있어요.");
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return out;
  }
  function range(args) {
    if (args && (args.from || args.to)) {
      var from = ymd(args.from || args.to), to = ymd(args.to || args.from);
      days(from, to);
      return [from, to];
    }
    var d = args && args.date != null ? ymd(args.date) : typeof args === "string" || args instanceof Date ? ymd(args) : today();
    return [d, d];
  }
  function hub(service, params) {
    var q = new URLSearchParams(Object.assign({ Type: "json", pIndex: "1", pSize: "5", ATPT_OFCDC_SC_CODE: SCHOOL.atpt, SD_SCHUL_CODE: SCHOOL.code }, params));
    var url = "https://open.neis.go.kr/hub/" + service + "?" + q;
    if (cache[url]) return Promise.resolve(cache[url]);
    return fetch(url)
      .then(function (r) { return r.json(); })
      .catch(function () { throw new Error("학교 정보를 불러오지 못했어요. 인터넷 연결을 확인해 주세요."); })
      .then(function (j) {
        var body = j && j[service];
        var rows = Array.isArray(body) ? (body[1] && body[1].row) || [] : [];
        if (!Array.isArray(body) && j && j.RESULT && j.RESULT.CODE !== "INFO-200") throw new Error("학교 정보를 불러오지 못했어요. (" + j.RESULT.MESSAGE + ")");
        cache[url] = rows;
        return rows;
      });
  }
  function byDays(service, from, to, fromKey, toKey, extra) {
    var list = days(from, to);
    return Promise.all(list.map(function (d) {
      var p = Object.assign({}, extra);
      p[fromKey] = d; p[toKey] = d;
      return hub(service, p);
    })).then(function (parts) { return [].concat.apply([], parts); });
  }
  // "고추장찌개 (5.6.9.10)<br/>얼갈이무침(자) (5.6.13)" → [{ name, allergy }]
  function parseMenu(text) {
    return String(text || "").split(/<br\s*\/?>/i).map(function (line) {
      var m = line.match(/\(([\d.\s]+)\)\s*$/);
      var allergy = m ? m[1].split(".").map(function (n) { return Number(n.trim()); }).filter(function (n) { return n >= 1 && n <= 19; }) : [];
      var name = (m ? line.slice(0, m.index) : line).replace(/\s+/g, " ").trim();
      return { name: name, allergy: allergy };
    }).filter(function (x) { return x.name; });
  }
  function safe(fn) {
    return function (args) {
      try { return fn(args); } catch (e) { return Promise.reject(e); }
    };
  }
  var school = {
    ALLERGY: ALLERGY,
    meal: safe(function (arg) {
      var r = range(arg && typeof arg === "object" && !(arg instanceof Date) ? arg : { date: arg });
      return byDays("mealServiceDietInfo", r[0], r[1], "MLSV_FROM_YMD", "MLSV_TO_YMD", {}).then(function (rows) {
        return rows.map(function (x) {
          return { date: dash(x.MLSV_YMD), meal: x.MMEAL_SC_NM, menu: parseMenu(x.DDISH_NM), kcal: Number(String(x.CAL_INFO || "").replace(/[^0-9.]/g, "")) || null };
        }).sort(function (a, b) { return (a.date + a.meal).localeCompare(b.date + b.meal); });
      });
    }),
    timetable: safe(function (opts) {
      opts = opts || {};
      var grade = Math.trunc(Number(opts.grade)), classNo = Math.trunc(Number(opts.classNo != null ? opts.classNo : opts["class"]));
      if (!(grade >= 1 && grade <= 3) || !(classNo >= 1 && classNo <= 30)) throw new Error("학년(1~3)과 반 번호를 적어 주세요.");
      var r = range(opts);
      return byDays("hisTimetable", r[0], r[1], "TI_FROM_YMD", "TI_TO_YMD", { GRADE: String(grade), CLASS_NM: String(classNo) }).then(function (rows) {
        return rows.map(function (x) { return { date: dash(x.ALL_TI_YMD), period: Number(x.PERIO), subject: String(x.ITRT_CNTNT || "").trim() }; })
          .sort(function (a, b) { return a.date.localeCompare(b.date) || a.period - b.period; });
      });
    }),
    schedule: safe(function (opts) {
      var r = range(opts || {});
      return byDays("SchoolSchedule", r[0], r[1], "AA_FROM_YMD", "AA_TO_YMD", {}).then(function (rows) {
        return rows.map(function (x) { return { date: dash(x.AA_YMD), event: String(x.EVENT_NM || "").trim() }; })
          .filter(function (x) { return x.event && x.event !== "토요휴업일"; })
          .sort(function (a, b) { return a.date.localeCompare(b.date); });
      });
    }),
  };

  var noAi = function () { return Promise.reject(new Error("공개 사이트에는 AI 키를 넣을 수 없어서 앱 속 AI는 쓸 수 없어요.")); };

  window.vibe = {
    inLab: false,
    save: function (k, v) { write(k, v); return Promise.resolve(true); },
    load: function (k) { return Promise.resolve(read(k)); },
    share: {
      add: function (name, item) {
        var list = read("list:" + name) || [];
        var row = Object.assign({}, item, { id: String(Date.now()) + list.length, at: Date.now() });
        list.unshift(row);
        write("list:" + name, list.slice(0, 300));
        return Promise.resolve({ id: row.id });
      },
      list: function (name, opts) {
        var n = Math.max(1, Math.min(100, Number(opts && opts.limit) || 50));
        return Promise.resolve((read("list:" + name) || []).slice(0, n));
      },
    },
    ai: noAi,
    school: school,
    agent: function () { return { ask: noAi, reset: function () {} }; },
  };
})();
