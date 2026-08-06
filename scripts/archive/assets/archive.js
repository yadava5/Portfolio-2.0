/**
 * The archive's two behaviours beyond paper memory: the audit walk's
 * cadence, and the artifact viewer.
 *
 * DIVISION OF LABOUR, stated so neither file grows into the other.
 * paper-memory.js owns every PERSISTED fact — it records the walk on
 * click, restores it across visits, and stamps [data-walked] +
 * [data-walked-on] on the control. This file owns only what happens on
 * screen: the row-by-row tick (an auditor's pace, not a cascade — the
 * same 350ms the React walk used), the settled face's date text, and
 * the dialog. Nothing here writes storage; delete this file and every
 * fact still holds, which is the test of it being presentation.
 *
 * Same weight discipline as the run: no framework, no module graph,
 * and nothing that runs while the page is still.
 */
(function () {
  "use strict";

  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TICK_MS = 350;

  function rows() {
    var section = document.getElementById("validation");
    return section
      ? [].slice.call(section.querySelectorAll("[data-receipt-row]"))
      : [];
  }

  /* ── the audit walk ─────────────────────────────────────────────── */
  function mountAudit() {
    var control = document.querySelector("[data-audit-run]");
    if (!control) return;
    var section = document.getElementById("validation");
    var dateSlot = control.querySelector("[data-walk-date]");
    var status = document.querySelector("[data-walk-status]");
    var faces = control.querySelectorAll(".face");
    /* Both flags exist because of listener ORDER: paper-memory's click
       listener was registered first, so by the time this file hears the
       click the act is already recorded and [data-walked] is already
       stamped. Gating the performance on that attribute would skip the
       walk on its own first click. `walkedHere` is this document's own
       memory of having performed OR restored; `selfAct` keeps the
       subscribe callback from drying a walk that is mid-performance. */
    var walkedHere = false;
    var selfAct = false;

    /* The two faces trade aria-hidden with the swap, so exactly one
       voice speaks at a time — the visual swap is CSS on [data-walked]. */
    function syncFaces() {
      var walked = control.hasAttribute("data-walked");
      if (faces.length === 2) {
        faces[0].setAttribute("aria-hidden", walked ? "true" : "false");
        faces[1].setAttribute("aria-hidden", walked ? "false" : "true");
      }
      control.setAttribute("aria-disabled", walked ? "true" : "false");
      if (dateSlot && control.hasAttribute("data-walked-on")) {
        dateSlot.textContent = control.getAttribute("data-walked-on");
      }
    }

    /* A stored or cross-tab walk arrives as dried ink, never a replay:
       the section's dried attribute kills the marks' transitions in the
       same task the ticks are applied, so nothing fades on load. */
    function restoreDried() {
      if (walkedHere || selfAct) return;
      if (!control.hasAttribute("data-walked")) return;
      walkedHere = true;
      if (section) section.setAttribute("data-audit-dried", "");
      rows().forEach(function (row) {
        row.setAttribute("data-audit-ticked", "");
      });
    }

    control.addEventListener("click", function () {
      /* paper-memory's listener (registered first) has already recorded
         the act; this one only performs it. */
      if (walkedHere) return;
      walkedHere = true;
      selfAct = true;
      var list = rows();
      if (RM || list.length === 0) {
        list.forEach(function (row) {
          row.setAttribute("data-audit-ticked", "");
        });
        announce();
        return;
      }
      list.forEach(function (row, i) {
        setTimeout(function () {
          row.setAttribute("data-audit-ticked", "");
          if (i === list.length - 1) announce();
        }, i * TICK_MS);
      });
    });

    /* Announced once, politely, at the moment of a fresh walk — dried
       revisits never speak. */
    var announced = false;
    function announce() {
      if (announced || !status) return;
      announced = true;
      var settled = control.querySelector(".settled");
      if (settled) status.textContent = settled.textContent;
    }

    if (window.paperMemory) {
      window.paperMemory.subscribe(function () {
        /* paper-memory paints before this runs (its listener was added
           first); by now the attributes are current. */
        syncFaces();
        restoreDried();
      });
    }
    /* first paint: paper-memory's start() has already run (both scripts
       are deferred, in document order), so the dried state is visible */
    syncFaces();
    restoreDried();
  }

  /* ── the artifact viewer ────────────────────────────────────────────
     The plate is a real <a> to the artifact, so with no script the
     click opens the original — the viewer is an enhancement over a
     working link, never a replacement for one. <dialog> brings Escape
     and focus containment of its own. */
  function mountViewer() {
    document.querySelectorAll("[data-viewer]").forEach(function (plate) {
      var dialog = document.getElementById(plate.getAttribute("data-viewer"));
      if (!dialog || typeof dialog.showModal !== "function") return;
      plate.addEventListener("click", function (e) {
        e.preventDefault();
        dialog.showModal();
      });
      dialog.addEventListener("click", function (e) {
        /* backdrop click: the dialog element is the target only when
           the click landed outside its content boxes */
        if (e.target === dialog) dialog.close();
      });
      var close = dialog.querySelector("[data-viewer-close]");
      if (close)
        close.addEventListener("click", function () {
          dialog.close();
        });
    });
  }

  function start() {
    mountAudit();
    mountViewer();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
