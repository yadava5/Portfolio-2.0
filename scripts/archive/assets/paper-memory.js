/**
 * paper memory — what this reader has already done here, kept between visits.
 *
 * A VANILLA PORT OF src/lib/paperMemory.ts, AND THE PORT IS THE POINT. The
 * migration plan says to preserve three localStorage keys and a change event
 * unrenamed. Preserving the keys while deleting the only module that reads
 * them preserves nothing: a visitor who signed the gate, walked an audit and
 * opened four case files would come back to a site that still holds all of it
 * on disk and shows none of it. So the reader moves across too.
 *
 * KEYS AND EVENT NAME ARE UNCHANGED, DELIBERATELY. They are versioned
 * (`:v1:`), they are already in real visitors' browsers, and a rename is a
 * silent amnesia with no error anywhere. The stored shape is unchanged for the
 * same reason.
 *
 * No build step, no module graph, no framework. The run itself is a
 * hand-authored HTML file with inline script and its whole argument is that it
 * weighs 166 KB with no dependencies; the record room does not get to be
 * heavier than the line it files for.
 */
(function () {
  "use strict";

  var APPROVAL_KEY = "paper-memory:v1:approved";
  var VISITED_KEY = "paper-memory:v1:visited";
  var AUDITS_KEY = "paper-memory:v1:audits";

  /* The `storage` event is CROSS-TAB ONLY — a document never hears its own
     writes. Everything on a page that reflects paper memory listens for this
     one instead, and every write below dispatches it. */
  var CHANGE_EVENT = "paper-memory:change";

  /** Today, in the visitor's own calendar, in both machine and page voice. */
  function todayLocal() {
    var now = new Date();
    var label = now
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .toLowerCase();
    var pad = function (n) {
      return String(n).padStart(2, "0");
    };
    return {
      iso:
        now.getFullYear() +
        "-" +
        pad(now.getMonth() + 1) +
        "-" +
        pad(now.getDate()),
      label: label,
    };
  }

  /* Storage may be unavailable (private mode, a blocked third-party context,
     a full quota) or hold something a previous version wrote. Neither is an
     error a reader should ever see. */
  function readJson(key) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* the act still holds for this page via the event below; it simply
         will not persist */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  /** Storage is user-editable, so a stored date is a candidate, not a fact. */
  function asPaperDate(value) {
    if (
      value &&
      typeof value === "object" &&
      typeof value.iso === "string" &&
      typeof value.label === "string"
    ) {
      return value;
    }
    return null;
  }

  function readDateMap(key) {
    var raw = readJson(key);
    var out = {};
    if (raw && typeof raw === "object") {
      for (var id in raw) {
        if (Object.prototype.hasOwnProperty.call(raw, id)) {
          var date = asPaperDate(raw[id]);
          if (date) out[id] = date;
        }
      }
    }
    return out;
  }

  /* Every recorded act is IDEMPOTENT and the FIRST date sticks. A file you
     opened in March and again today was still first read in March, and the
     margin note that says so would be a lie if it moved. */
  function recordOnce(key, id) {
    var map = readDateMap(key);
    if (map[id]) return { date: map[id], first: false };
    var date = todayLocal();
    map[id] = date;
    writeJson(key, map);
    return { date: date, first: true };
  }

  var api = {
    CHANGE_EVENT: CHANGE_EVENT,

    readApproval: function () {
      return asPaperDate(readJson(APPROVAL_KEY));
    },

    /** Sign the run. Idempotent — the ink dries once. */
    approveRun: function () {
      var existing = api.readApproval();
      if (existing) return existing;
      var date = todayLocal();
      writeJson(APPROVAL_KEY, date);
      return date;
    },

    readVisitedFiles: function () {
      return readDateMap(VISITED_KEY);
    },

    recordFileVisit: function (fileId) {
      var r = recordOnce(VISITED_KEY, fileId);
      return { date: r.date, firstVisit: r.first };
    },

    readFileAudits: function () {
      return readDateMap(AUDITS_KEY);
    },

    recordFileAudit: function (fileId) {
      var r = recordOnce(AUDITS_KEY, fileId);
      return { date: r.date, firstWalk: r.first };
    },

    /** Same-document acts AND another tab's. Returns an unsubscribe. */
    subscribe: function (listener) {
      window.addEventListener(CHANGE_EVENT, listener);
      window.addEventListener("storage", listener);
      return function () {
        window.removeEventListener(CHANGE_EVENT, listener);
        window.removeEventListener("storage", listener);
      };
    },
  };

  window.paperMemory = api;

  /* ── The three things the archive's own chrome does with it ──────────
     Declarative: an element opts in with a data attribute, so the page
     templates carry no script and this file carries no page structure.

     NOTHING HERE WRITES DURING RENDER. The React original had that rule
     recorded against it (CRITIC-LEDGER F81) after a component recorded a
     visit from a render body; the same rule holds when the renderer is a
     string concatenation. Writes happen on load or on a press, never while
     the page is being laid out. */

  function paint() {
    var visited = api.readVisitedFiles();
    var audits = api.readFileAudits();
    var approval = api.readApproval();

    /* the file's own margin note — "first read on …" */
    var memo = document.querySelector("[data-file-memory]");
    if (memo) {
      var id = memo.getAttribute("data-file-memory");
      var seen = visited[id];
      memo.textContent = seen ? "first read on " + seen.label : "";
      memo.hidden = !seen;
    }

    /* /evidence/ — a mark beside every case file this reader has opened */
    var marks = document.querySelectorAll("[data-visited-mark]");
    for (var i = 0; i < marks.length; i++) {
      var mark = marks[i];
      var was = !!visited[mark.getAttribute("data-visited-mark")];
      mark.hidden = !was;
    }

    /* the audit walk's settled state, restored on a later visit */
    var walk = document.querySelector("[data-audit-run]");
    if (walk) {
      var walked = audits[walk.getAttribute("data-audit-run")];
      if (walked) {
        walk.setAttribute("data-walked", "");
        walk.setAttribute("data-walked-on", walked.label);
      } else {
        walk.removeAttribute("data-walked");
        walk.removeAttribute("data-walked-on");
      }
    }

    /* the registry's approval row, on the one file that has one */
    var approve = document.querySelector("[data-registry-approve]");
    if (approve) {
      approve.setAttribute("aria-pressed", approval ? "true" : "false");
      if (approval) approve.setAttribute("data-approved-on", approval.label);
      else approve.removeAttribute("data-approved-on");
    }
  }

  function start() {
    var file = document.querySelector("[data-case-file]");
    if (file) api.recordFileVisit(file.getAttribute("data-case-file"));

    var walk = document.querySelector("[data-audit-run]");
    if (walk) {
      walk.addEventListener("click", function () {
        api.recordFileAudit(walk.getAttribute("data-audit-run"));
      });
    }

    var approve = document.querySelector("[data-registry-approve]");
    if (approve) {
      approve.addEventListener("click", function () {
        api.approveRun();
      });
    }

    api.subscribe(paint);
    paint();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
