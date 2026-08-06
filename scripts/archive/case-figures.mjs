/**
 * fig. 1, seven times — the case files' plates, drawn static.
 *
 * WHAT THESE REPLACE. fig. 1 was four React client scenes (3,158 lines:
 * AppliedScene, GlyphScene, CadenceScene, AutomlEchoScene) plus a raster
 * fallback for the three files with no scene. The scenes were one-shot
 * drawn animations; their server markup was already "the settled frame",
 * because every static world had to get a truthful still.
 *
 * THE JUDGEMENT: the settled frame IS the archival form, so these plates
 * are that frame authored directly — inline SVG in the run's own figure
 * grammar (same ink classes, same mono voice, same clay-marks-the-gate
 * law), no script, no motion. The ruling that retired the run's
 * scroll-scrubbed bench fills generalises exactly here: a gauge that
 * fills as you watch is an instrument; a record does not move. The run
 * is the instrument. This room holds what it measured.
 *
 * ONE EDITION PER PLATE, AND THE ARITHMETIC SAYS WHY THAT IS NOT A CUT.
 * The run authors two editions per figure and swaps by MEASURED seat:
 * wide 560-unit plates need a ≥515px seat to keep 12-unit type on the
 * 11px floor. The archive's fig. 1 column measures 384px at lg and
 * ~518px at xl (CaseStudyPage's own numbers) — a band where the run's
 * edition rule chooses the TIGHT plate at every width but a 3px sliver
 * at xl. So the tight 240-unit portrait edition is not a compromise
 * here; it is what the house arithmetic selects for this seat. Authored
 * at 11 units and capped at 330px rendered (the run's own tight cap),
 * the voice stays inside the 11–15px band from a 320px viewport up:
 * 11 × 248/240 = 11.4px at the narrowest measured seat, 15.1px at cap.
 *
 * HONESTY: every number drawn below appears in the same file's receipts
 * or checked-in ledger; the drawings add geometry, never figures. Each
 * plate carries the contract's full-sentence aria-label.
 */
import { esc } from "./html.mjs";

/* The mono advance at 11 units is ~6.6 units/char (Fragment Mono is a
   0.6em-advance face; the run measured 7.25/char at 12). Every label
   below was length-checked against its 232-unit line before it was
   drawn — the congestion in the run's fig. 03/04 came from labels
   authored without this check, and Phase 5's brief (FIGURES.md) makes
   the check the rule. */

const t = (x, y, s, cls = "") =>
  `<text x="${x}" y="${y}"${cls ? ` class="${cls}"` : ""}>${esc(s)}</text>`;
const te = (x, y, s, cls = "") =>
  `<text x="${x}" y="${y}" text-anchor="end"${cls ? ` class="${cls}"` : ""}>${esc(s)}</text>`;

/** One settled mail mark (the run's fig. 04 glyph): body + flap. */
function mail(x, y, verdict) {
  const flap =
    verdict === "ok"
      ? "var(--pine)"
      : verdict === "rv"
        ? "var(--clay-g)"
        : "var(--ink)";
  return (
    `<g transform="translate(${x} ${y})">` +
    `<rect x="-4.5" y="-3.2" width="9" height="6.4" class="mk${verdict === "ok" ? " ok" : verdict === "rv" ? " rv" : ""}"/>` +
    `<path d="M -4.5 -3.2 L 0 .6 L 4.5 -3.2" fill="none" stroke="${flap}" stroke-width=".9"/></g>`
  );
}

/* ── jobtracker · Applied — the sorting line, settled ────────────────── */
function figJobtracker() {
  const gates = [
    [64, "rules"],
    [118, "e5 similarity"],
    [172, "gated setfit"],
  ];
  const cells = [
    [8, 216, "applied"],
    [128, 216, "interview"],
    [8, 276, "rejected"],
    [128, 276, "needs-review"],
  ];
  /* Eight marks, the run's own honest mix — no per-bucket count is
     claimed anywhere, so none is drawn. 3 applied · 2 interview ·
     2 rejected · 1 deferred at the clay gate. */
  const settled = [
    [0, "ok"],
    [0, "ok"],
    [0, "ok"],
    [1, "ok"],
    [1, "ok"],
    [2, ""],
    [2, ""],
    [3, "rv"],
  ];
  const perCell = [0, 0, 0, 0];
  let marks = "";
  for (const [b, v] of settled) {
    const [cx, cy] = cells[b];
    marks += mail(cx + 22 + perCell[b] * 28, cy + 16, v);
    perCell[b] += 1;
  }
  return {
    viewBox: "0 0 240 330",
    alt: "The sorting line, settled: eight mail marks have fallen through the classifier’s three gates — rules, e5 similarity, gated SetFit — and rest in their four shelves: three filed applied, two interview, two rejected, and one deferred to needs-review at the clay gate.",
    caption:
      "fig. 1 — the sorting line, settled: rules ⟶ e5 similarity ⟶ gated setfit.",
    captionNote: "the clay gate is where the model defers to review.",
    disclosure:
      "a drawn plate, at rest — not a screenshot. the gates are the repository’s real three-layer path; the marks are illustrative and carry no counts. the measured numbers live in the receipts below.",
    body:
      t(8, 16, "inbox") +
      `<path d="M 120 24 V 208" class="route"/>` +
      gates
        .map(
          ([y, label]) =>
            `<line x1="8" y1="${y}" x2="232" y2="${y}" class="lane gatecol"/>` +
            te(232, y - 6, label)
        )
        .join("") +
      `<rect x="115" y="167" width="10" height="10" class="gsq"/>` +
      cells
        .map(
          ([x, y, label]) =>
            `<path d="M ${x} ${y} v 44 h 104 v -44" class="lane"/>` +
            t(x + 6, y + 38, label)
        )
        .join("") +
      marks,
  };
}

/* ── fast-mnist-nn · Glyph — the network at rest, and its record ─────── */
function figGlyph() {
  let hidden = "";
  for (let i = 0; i < 100; i++) {
    const r = Math.floor(i / 10),
      c = i % 10;
    hidden += `<circle cx="${104 + c * 12}" cy="${30 + r * 9}" r="2" class="hn"/>`;
  }
  let readout = "";
  for (let d = 0; d < 10; d++) {
    const x = 12 + d * 22.6;
    readout +=
      `<rect x="${x - 4}" y="138" width="9" height="9" class="lane"/>` +
      `<text x="${x + 0.5}" y="162" text-anchor="middle">${d}</text>`;
  }
  return {
    viewBox: "0 0 240 346",
    alt: "The 784–100–10 network at rest — a dashed, empty 28-by-28 input square, the hidden layer’s hundred dots, ten readout slots — and beneath it the committed record: 97.01 percent on the 10,000-image MNIST test set, and the openmp-plus-simd dot-256 kernel measured at 3.5 times the single-thread -O3 baseline.",
    caption: "fig. 1 — the network at rest, over its committed record.",
    captionNote:
      "the input square stays blank — the live read belongs to the line, at ¶ 06.",
    disclosure:
      "a drawn plate, at rest — not a screenshot. structure from the repository (784 ⟶ 100 ⟶ 10); both numbers are committed artifacts: mnist_eval.txt @ 97de736 and the 2025-12-26 benchmark run.",
    body:
      `<rect x="8" y="26" width="64" height="64" class="pencil"/>` +
      t(8, 106, "input 28×28") +
      hidden +
      t(104, 132, "hidden ×100") +
      readout +
      t(8, 180, "softmax ×10") +
      `<line x1="8" y1="196" x2="232" y2="196" class="lane"/>` +
      t(8, 218, "the committed record", "lit") +
      t(8, 240, "97.01% — 9,701/10,000", "lit") +
      t(8, 254, "macro-f1 0.9698") +
      t(8, 268, "mnist_eval.txt @ 97de736") +
      /* Static at full extent, deliberately: a record does not move. */
      t(8, 294, "one thread, -O3 · 1×") +
      `<rect x="8" y="300" width="64" height="5" class="bark"/>` +
      t(8, 322, "openmp+simd · 3.5×") +
      `<rect x="8" y="328" width="224" height="5" class="bark clay"/>` +
      t(8, 344, "dot-256 · committed 2025-12-26"),
  };
}

/* ── automl — the halt, on file ──────────────────────────────────────── */
const AML_TOOLS = [
  "list_project_files",
  "get_dataset_profile",
  "get_dataset_sample",
  "search_documents",
  "list_cells",
  "read_cell",
  "write_cell",
  "edit_cell",
  "run_cell",
  "delete_cell",
  "reorder_cells",
  "insert_cell",
];
const AML_PHASES = [
  "1.0 ingest",
  "2.0 explore",
  "3.0 preprocess",
  "4.0 engineer",
  "5.0 train",
  "6.0 experiments",
  "7.0 deploy",
];
function figAutoml() {
  const cellLen = [150, 180, 120, 190, 165, 135];
  let cells = "";
  for (let i = 0; i < 6; i++) {
    const y = 70 + i * 24;
    cells +=
      `<rect x="8" y="${y}" width="224" height="18" class="cellr"/>` +
      `<path d="M 16 ${y + 10} h ${cellLen[i]}" class="cellink"/>` +
      te(224, y + 13, "✓", "pinet");
  }
  let registry = "";
  for (let i = 0; i < 12; i++) {
    const y = 268 + i * 15;
    registry +=
      `<rect x="8" y="${y - 6}" width="5" height="5" class="tdot"/>` +
      t(20, y, AML_TOOLS[i], "tname");
  }
  const PHY = Array.from({ length: 7 }, (_, i) => 470 + i * 27);
  let rail =
    `<path d="M 16 456 V ${PHY[6] - 20}" class="lane"/>` +
    `<path d="M 16 ${PHY[6] - 20} V 640" class="lane" stroke-dasharray="3 6"/>`;
  for (let i = 0; i < 7; i++) {
    rail +=
      `<line x1="10" y1="${PHY[i]}" x2="22" y2="${PHY[i]}" class="lane"/>` +
      `<rect x="11.5" y="${PHY[i] - 18}" width="9" height="10" class="phgate${i === 6 ? " shut" : " open"}"/>` +
      t(32, PHY[i] + 4, AML_PHASES[i], i === 6 ? "deplbl" : "lit");
  }
  /* The halt: the bead rests against the seventh gate wearing the same
     clay ring the run token wears at 22:41. The one clay moment. */
  const halt =
    `<circle cx="16" cy="${PHY[6] - 13}" r="9" fill="none" stroke="var(--clay-g)" stroke-width="2"/>` +
    `<circle cx="16" cy="${PHY[6] - 13}" r="4.5" fill="var(--ink)"/>`;
  return {
    viewBox: "0 0 240 648",
    alt: "The halted run, on file: a LangGraph supervisor over a notebook of six written-and-run cells; the twelve real MCP tools of mcpServer.ts listed in source order; and a seven-phase rail where six gates stand open and the run rests in clay against the seventh — deploy stays dashed and never lights.",
    caption: "fig. 1 — the halt, on file: six gates opened, the seventh held.",
    captionNote: "deploy never lights itself — that word belongs to a person.",
    disclosure:
      "a drawn plate, at rest — not a screenshot. the twelve tools are mcpServer.ts’s at e506c91, in source order; no metric is drawn because none is claimed — the receipts say why.",
    body:
      `<rect x="8" y="8" width="224" height="46" rx="3" class="lane"/>` +
      t(16, 28, "langgraph supervisor", "lit") +
      t(16, 44, "agentic core · gpt-5.4") +
      `<path d="M 120 54 V 70" class="route"/>` +
      cells +
      t(8, 232, "the notebook — written and run") +
      t(8, 254, "mcp registry ×12 · source order", "lit") +
      registry +
      rail +
      halt,
  };
}

/* ── visual-assist — two modes, one device ───────────────────────────── */
function figVisualAssist() {
  /* The corrected topology, drawn as corrected: the 2026-08-02 audit
     removed a sensor→vision edge that never existed in the source. The
     two modes are INDEPENDENT, so the plate separates them with a rule
     instead of merging them into one flattering pipeline. */
  const arcs = [12, 22, 32]
    .map(
      (r) =>
        `<path d="M ${20 + r * 0.64} ${78 - r * 0.77} A ${r} ${r} 0 0 1 ${20 + r * 0.64} ${78 + r * 0.77}" class="lane"/>`
    )
    .join("");
  const speech = [8, 14, 20]
    .map(
      (r) =>
        `<path d="M ${196 + r * 0.5} ${78 - r * 0.87} A ${r} ${r} 0 0 1 ${196 + r * 0.5} ${78 + r * 0.87}" class="lane"/>`
    )
    .join("");
  return {
    viewBox: "0 0 240 320",
    alt: "Two independent modes drawn on one device. Navigation mode: LiDAR depth arcs meet an obstacle and resolve into haptic pulse marks and spoken distance. Awareness modes: camera frames feed Vision OCR for text and local recognition for objects, read aloud. VoiceOver is the interaction layer, and every path stays on the device.",
    caption: "fig. 1 — two modes, one device: lidar guides, the camera reads.",
    captionNote:
      "the two vision paths never touch the lidar — the modes are independent.",
    disclosure:
      "a drawn plate, at rest — not a screenshot. topology from the audited source at 22ebdaa: navigation reads lidar, the awareness modes read camera frames, and the modes share nothing but the device.",
    body:
      t(8, 16, "on-device — nothing leaves it", "lit") +
      t(8, 44, "navigation mode") +
      `<circle cx="20" cy="78" r="3" class="hn lit-dot"/>` +
      arcs +
      `<rect x="70" y="68" width="6" height="20" class="mk"/>` +
      `<path d="M 84 78 H 132" class="lane"/>` +
      `<rect x="136" y="74" width="5" height="8" class="gsqp"/>` +
      `<rect x="146" y="72" width="6" height="12" class="gsqp"/>` +
      `<rect x="157" y="70" width="7" height="16" class="gsqp"/>` +
      speech +
      /* ≤30 columns: the ⟶ sets wider than a mono cell, so the 232-unit
         line check budgets it at two — the first cut of this label
         clipped at the frame edge. */
      t(8, 122, "lidar ⟶ haptic pulses · speech") +
      `<line x1="8" y1="140" x2="232" y2="140" class="lane"/>` +
      t(8, 160, "awareness modes") +
      `<rect x="8" y="170" width="44" height="34" class="prod"/>` +
      `<circle cx="30" cy="187" r="7" class="mk"/>` +
      `<path d="M 52 180 H 96" class="lane"/>` +
      `<path d="M 52 194 C 72 194 76 213 96 213" class="lane"/>` +
      `<rect x="96" y="166" width="136" height="26" class="prod"/>` +
      t(104, 183, "vision ocr — text") +
      `<rect x="96" y="200" width="136" height="26" class="prod"/>` +
      t(104, 217, "local recognition") +
      t(8, 252, "camera frames ⟶ read aloud") +
      `<line x1="8" y1="270" x2="232" y2="270" class="lane"/>` +
      t(8, 292, "voiceover-first interaction"),
  };
}

/* ── master-inventory — the merge, keyed ─────────────────────────────── */
function figMasterInventory() {
  return {
    viewBox: "0 0 240 310",
    alt: "Two feeders — 3,731 processed Tableau metadata rows and 6,743 Workday export rows — pass one python-and-SQL works gate with hash dedup and land in a single master inventory of 10,453 rows by 35 fields, keyed by a deterministic inventory id. The raw institutional exports stay uncommitted.",
    caption: "fig. 1 — two systems that disagree, filed as one table.",
    captionNote: "every count is the checked-in ledger’s own.",
    disclosure:
      "a drawn plate, at rest — not a screenshot. all three row counts and the 35-field schema are the checked-in proof ledger’s; no institutional record is shown.",
    body:
      t(8, 16, "the freight") +
      `<rect x="8" y="28" width="224" height="34" class="prod"/>` +
      t(16, 49, "tableau metadata — 3,731 rows") +
      `<rect x="8" y="74" width="224" height="34" class="prod"/>` +
      t(16, 95, "workday exports — 6,743 rows") +
      `<path d="M 120 108 V 178" class="lane"/>` +
      `<line x1="108" y1="140" x2="132" y2="140" class="lane gatecol"/>` +
      t(140, 137, "python · sql") +
      t(140, 152, "hash-dedup") +
      `<rect x="8" y="178" width="224" height="48" class="rec landed"/>` +
      t(16, 198, "master_inventory.csv", "lit") +
      t(16, 216, "10,453 rows × 35 fields") +
      `<path d="M 206 200 l 5 6 l 10 -12" class="tickp"/>` +
      t(8, 252, "one deterministic inventory_id", "lit") +
      t(8, 266, "keys every row across systems") +
      t(8, 296, "the raw exports stay uncommitted"),
  };
}

/* ── policybot — the guardrail path ──────────────────────────────────── */
function figPolicybot() {
  return {
    viewBox: "0 0 240 336",
    alt: "The guardrail path: policy documents in DOCX, PDF and Markdown are indexed; File Search returns candidate quotes; a local quote verifier gates them in clay. Verified quotes ship to the Slack thread as a cited answer; unsupported topics take the dashed branch and are declined — four were, in the recorded sweep.",
    caption: "fig. 1 — the guardrail path: no verified quote, no answer.",
    captionNote:
      "the clay gate is the product — the declines are receipts too.",
    disclosure:
      "a drawn plate, at rest — not a screenshot. the path and the four declines are the checked-in validation ledger’s; no policy text or slack message appears.",
    body:
      t(8, 16, "the guardrail path") +
      `<rect x="8" y="28" width="224" height="34" class="prod"/>` +
      t(16, 49, "policy docs — docx · pdf · md") +
      `<path d="M 120 62 V 92" class="lane"/>` +
      t(128, 82, "indexed") +
      `<rect x="8" y="92" width="224" height="34" class="prod"/>` +
      t(16, 113, "file search — openai retrieval") +
      `<path d="M 120 126 V 156" class="lane"/>` +
      t(124, 146, "candidate quotes") +
      `<rect x="115" y="156" width="10" height="10" class="gsq"/>` +
      t(8, 184, "local quote verifier — the gate", "lit") +
      `<path d="M 120 166 V 206" class="lane"/>` +
      `<rect x="8" y="206" width="180" height="34" class="rec landed"/>` +
      t(16, 227, "cited answer ⟶ slack") +
      /* the honest branch: what the gate refuses takes the pencil.
         An elbow, not a swoop: it runs level at the gate's own y —
         above the verifier label's ascent line — and only drops once
         it is past the label's 213-unit end, so the dash never crosses
         a word. Two earlier curves grazed “the gate”. */
      `<path d="M 129 161 H 214 C 220 161 222 167 222 176 V 246" class="pencil"/>` +
      te(232, 266, "unsupported —", "penciltx") +
      te(232, 280, "declined", "penciltx") +
      t(8, 310, "unverified quotes do not ship", "lit") +
      t(8, 326, "4 declined in the recorded sweep"),
  };
}

/* ── taskflow-calendar · Cadence — the parse, filed ──────────────────
   The one plate that is not SVG, because its material is TYPE: a
   sentence, a week grid, and the event the parse filed. Set as the
   paper's own furniture — the parsed spans carry sidenote numerals and
   the event card answers them, the same ¹…² grammar the decisions
   section already speaks. The event block sits IN the tuesday column
   of a real CSS grid rather than absolutely positioned over it — which
   is also the shape Phase 5 should give the run's fig. 05, whose chip
   currently covers wednesday because nothing ties it to a cell. */
function figCadence() {
  const days = ["mo", "tu", "we", "th", "fr", "sa", "su"];
  const head = days
    .map((d) => `<span${d === "tu" ? ' class="tu"' : ""}>${d}</span>`)
    .join("");
  let cells = "";
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 7; c++) {
      cells += r === 1 && c === 1 ? `<i class="ev">12:00</i>` : "<i></i>";
    }
  }
  return {
    html:
      `<div class="cadfig" role="img" aria-label="${esc(
        "The parse, filed: the sentence “lunch with Sam next Tuesday at noon, add a Meet” has its three spans marked with sidenote numerals, the week grid holds the event at Tuesday noon, and the filed card answers each numeral — who: sam; when: tue 12:00; meet: link attached."
      )}">` +
      `<p class="sent">“lunch with <span class="w">Sam<sup>1</sup></span> <span class="w">next Tuesday at noon<sup>2</sup></span>, <span class="w">add a Meet<sup>3</sup></span>.”</p>` +
      `<div class="week"><div class="hd">${head}</div><div class="wgrid">${cells}</div></div>` +
      `<dl class="evcard">` +
      `<div><dt><sup>1</sup> who</dt><dd>sam</dd></div>` +
      `<div><dt><sup>2</sup> when</dt><dd>tue · 12:00</dd></div>` +
      `<div><dt><sup>3</sup> meet</dt><dd>link attached</dd></div>` +
      `</dl></div>`,
    caption: "fig. 1 — the parse, filed: one sentence, one committed event.",
    captionNote: "the numerals are the paper’s own sidenote hand.",
    disclosure:
      "a drawn plate, at rest — not a screenshot. the sentence is illustrative, never user data; the parse path it depicts — chrono-node and compromise into a structured event — is the app’s real one.",
  };
}

const FIGURES = {
  jobtracker: figJobtracker,
  "fast-mnist-nn": figGlyph,
  automl: figAutoml,
  "visual-assist": figVisualAssist,
  "master-inventory": figMasterInventory,
  policybot: figPolicybot,
  "taskflow-calendar": figCadence,
};

/**
 * The finished fig. 1 for one case file: plate, drawing, caption,
 * disclosure. Every file has one — there is no fallback branch, because
 * a missing entry here is a build error, not a degraded page.
 */
export function caseFigure(projectId) {
  const make = FIGURES[projectId];
  if (!make) throw new Error(`no fig. 1 authored for ${projectId}`);
  const fig = make();
  const drawing = fig.html
    ? fig.html
    : `<svg class="figsvg" viewBox="${fig.viewBox}" role="img" aria-label="${esc(fig.alt)}">${fig.body}</svg>`;
  return `<figure id="fig-1" class="plate-fig">
        <div class="plate-paper"><div class="plate-inner">${drawing}</div></div>
        <figcaption><p class="fc-main">${esc(fig.caption)} <i>${esc(fig.captionNote)}</i></p>
        <p class="fc-note">${esc(fig.disclosure)}</p></figcaption>
      </figure>`;
}
