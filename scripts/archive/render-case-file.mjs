/**
 * One case file, rendered whole — the dossier as static HTML.
 *
 * The DOM contract this reproduces is measured, not remembered:
 * ARCHIVE-RENDER-CONTRACT.md carries file:line for every id, anchor and
 * conditional below, read out of the React renderer before it was
 * retired. The section ids in document order are `problem`,
 * `project-visual`, `architecture`, `decisions`, `validation`, `ledger`
 * (two files), `corrections`, `artifacts`; the receipt anchors are
 * `v-<projectId>-<n>`, 1-based and continuous across receipts then
 * outcomes; appendix plates number from `figStart = registryFig ? 4 : 3`
 * because receipt prose cites "see fig. N" and EvidenceTable's rewrite
 * of those labels into `#fig-N` links breaks silently if the plates are
 * numbered on their own.
 *
 * WHAT IS NEW HERE, BY DESIGN: the arrival slip under the kicker and the
 * rejoin link in the folio. Both quote `stations.ts`, the one file whose
 * strings are drift-guarded verbatim against the run.
 *
 * WHAT IS DELIBERATELY ABSENT: the `held` receipt path (zero live rows
 * carry it — omitting it is a decision the report records, not a no-op),
 * and CitationInk's hover pen-strokes (a desktop-engine flourish whose
 * event plumbing outweighed what it drew; the `data-cites` hooks stay).
 */
import { esc, head, document_ } from "./html.mjs";
import {
  sitePath,
  breakable,
  auditGlyph,
  visibilityGlyph,
  VISIBILITY_LABEL,
  masthead,
  colophon,
  stationFor,
  stationNo,
  assetHead,
} from "./partials.mjs";
import { caseFigure } from "./case-figures.mjs";

/** This route's depth below the site root — every same-site asset and
 *  archive-internal link is addressed from here, so the staging tree
 *  previews correctly under any prefix. Seam links to the run are the
 *  full published URL instead (see partials.mjs for the rule). */
const PREFIX = "../../";

/** The widest date the mono voice prints — the settled face reserves
 *  with it so the swap to a real date can never grow the line. */
const GHOST_DATE = "mmm 00, 0000";

const external = (href) => href.startsWith("http");

/** "see fig. N" citations: same sharpening rule as EvidenceTable's
 *  citedFig()/citationHref() — the label's number IS the link target,
 *  which is why plate numbering and receipt prose are locked together. */
const citedFig = (row) => {
  for (const a of row.artifacts) {
    if (!a.href.startsWith("#")) continue;
    const m = a.label.match(/\bfig\.\s*(\d+)/);
    if (m) return Number(m[1]);
  }
  return null;
};
const citationHref = (a) => {
  if (!a.href.startsWith("#")) return a.href;
  const m = a.label.match(/\bfig\.\s*(\d+)/);
  return m ? `#fig-${m[1]}` : a.href;
};

/* ── the arrival slip ──────────────────────────────────────────────────
   THE RULE THAT KEEPS THE SLIP HONEST: it cannot know how THIS reader
   arrived. Fragments never reach a referrer, and two files (jobtracker,
   fast-mnist-nn) are reachable from their station AND from ¶10's
   receipts. So the slip records the STANDING ROUTE — the consigning
   station's own waybill, quoted verbatim from stations.ts, where
   check-stations.mjs already guards every word against the run. And it
   carries NO run number: the record room quotes the route, not one
   day's serial — a slip stamped "run 042" is wrong for every later run,
   which is also why the two review-filed files quote ¶10's receipt
   clause instead of the review's consignment. */
const REVIEW_RECEIPT = {
  policybot: "19/20 cited-source sweep, self-reported",
  "visual-assist": "71 passed · 0 skipped",
};

/* THE SLIP QUOTES THE WAYBILL ADDRESSED TO THIS FILE, and once a station could
   declare two that stopped being the same thing as "the station's consignment".
   `stations.ts` widened to an array on 2026-08-08 and ¶03 now declares both the
   shaped table (→ the line) and the master inventory (→ the case file). Reading
   the field as a scalar coerced it to "A,B" and printed a bare-comma join.

   The array EXPOSED this; it did not create it. Arrival semantics — "freight
   arrives at the station it is about", §6.1 — apply one level down: a document's
   slip records what was consigned TO THAT DOCUMENT. The slip has been quoting
   "→ the line" since it was written, and that was only approximately right while
   a station declared one string.

   And the complete-both-of-them reading would be worse than coarse, it would be
   FALSE. The yard's own handoff: "only the inventory is checked in — the rest
   are read off miami's own systems and cannot be published." A slip listing the
   shaped table would be the record room printing a receipt for freight it does
   not hold and is not permitted to hold.

   So: select by address, never by index, and never coerce. Zero or two matches
   is a broken declaration and aborts the build — guessing is how a slip ends up
   approximately right again. */
const CASE_FILE_ADDRESS = "→ the case file";
function waybillFor(station) {
  const c = station.consignment;
  if (!Array.isArray(c)) return c;
  const addressed = c.filter((w) => w.endsWith(CASE_FILE_ADDRESS));
  if (addressed.length !== 1) {
    throw new Error(
      `render-case-file: ${station.id} declares ${c.length} waybills and ${addressed.length} of them end "${CASE_FILE_ADDRESS}".\n` +
        `  The arrival slip quotes the one addressed to this file, so exactly one must be.\n` +
        `  declared: ${JSON.stringify(c, null, 2)}\n` +
        `  Do not fall back to [0] — a slip quoting freight addressed elsewhere is a false receipt.`
    );
  }
  return addressed[0];
}

function arrivalSlip({ station, study, runUrl }) {
  const at = `<a href="${esc(runUrl)}/#${esc(station.id)}">${esc(station.name)} — ¶ ${stationNo(station)} · ${esc(station.clock)}</a>`;
  const line =
    station.dossier === study.projectId
      ? `↳ <span class="dep">consigned at</span> ${at} · <span class="dep">waybill:</span> ${esc(waybillFor(station))}`
      : `↳ <span class="dep">filed at</span> ${at} · <span class="dep">receipt:</span> ${esc(REVIEW_RECEIPT[study.projectId])}`;
  /* The lamp. The archive holds one light on purpose — a scroll-keyed
     arc would assign a time of day to a jump target — but the conceit
     is SAID on the files whose consigning stop is past dusk (beat ≥ 7,
     where the run's own choreography goes dark): the lamp is why this
     paper is bright at ten at night. */
  const lamp =
    station.beat >= 7
      ? `\n        <p class="hourline lamp">the line stands dark at ${esc(station.clock)} — the archive lamp is lit; a record is read in the light it needs.</p>`
      : "";
  return `<p class="slip">${line}</p>${lamp}`;
}

/* ── the meta ledger ─────────────────────────────────────────────────── */
function ledgerRow(term, value) {
  return `<div class="mrow"><dt>${term}</dt><span class="lead" aria-hidden="true"></span><dd>${value}</dd></div>`;
}

function metaLedger({ study, project }) {
  const liveHost = project.liveUrl ? new URL(project.liveUrl).hostname : null;
  const rows = [ledgerRow("role", esc(study.role.toLowerCase()))];
  if (study.collaborator) {
    const c = study.collaborator;
    const name = c.href
      ? `<a href="${esc(c.href)}" target="_blank" rel="noopener noreferrer">${esc(c.name)}</a>`
      : esc(c.name);
    rows.push(
      ledgerRow("with", `${name}${c.scope ? ` — ${esc(c.scope)}` : ""}`)
    );
  }
  rows.push(ledgerRow("timeframe", esc(study.timeframe.toLowerCase())));
  rows.push(
    ledgerRow("stack", esc(project.techStack.map((t) => t.name).join(" · ")))
  );
  if (study.repoPin) {
    const pin =
      `${study.repoPin.repo} @ ${study.repoPin.sha}` +
      (study.repoPin.branch ? ` · ${study.repoPin.branch}` : "");
    /* The ↗ is glued with a no-break space: this dd wraps `anywhere`,
       and a plain space would print the leaving-mark alone on its own
       line under the pin it qualifies (N20's measured defect). */
    rows.push(
      ledgerRow(
        "repo",
        `<a href="${esc(study.repoPin.href)}" target="_blank" rel="noopener noreferrer">${breakable(pin)}&#xA0;↗</a>`
      )
    );
  } else {
    rows.push(
      ledgerRow("repo", `private — ${breakable(study.privateRepoName ?? "")}`)
    );
  }
  if (project.liveUrl) {
    rows.push(
      ledgerRow(
        "live demo",
        `<a href="${esc(project.liveUrl)}" target="_blank" rel="noopener noreferrer" data-live-demo>${breakable(liveHost)}&#xA0;↗</a>`
      )
    );
  }
  if (project.liveUrl && project.systemCardUrl) {
    /* `systemCardEdition` is named when the card is NOT the current edition —
       exactly one entry carries it, automl's frozen expo booklet. Without it
       this row read "/system-card ↗" flat and the archive presented a document
       frozen at a 2025 expo as the live one. The run refuses to cite that card
       at all; the archive does cite it, so the archive has to say which it is.
       Still gated on both fields, never composed from liveUrl. */
    const edition = project.systemCardEdition
      ? ` — ${esc(project.systemCardEdition)}`
      : "";
    rows.push(
      ledgerRow(
        "system card",
        `<a href="${esc(project.systemCardUrl)}" target="_blank" rel="noopener noreferrer" data-system-card>/system-card${edition} ↗</a>`
      )
    );
  }
  return `<dl class="meta">${rows.join("\n            ")}</dl>`;
}

/** The page's single stamp — private files only. Aria-label verbatim
 *  from the contract. */
const PRIVATE_STAMP = `<div role="img" aria-label="Stamp: private repository — evidence on file" class="stamp-private">
          <svg viewBox="0 0 250 110" aria-hidden="true"><g fill="none" stroke="currentColor" opacity="0.9">
          <path stroke-width="2" stroke-dasharray="6 6" stroke-linecap="round" d="M10 12 C 78 8, 172 10, 240 9 C 242 42, 241 74, 240 100 C 170 103, 80 101, 10 101 C 8 70, 9 40, 10 12 Z"/>
          <text x="125" y="48" text-anchor="middle" font-size="14" letter-spacing="2" fill="currentColor" stroke="none">private repository</text>
          <text x="125" y="72" text-anchor="middle" font-size="10" letter-spacing="1.5" fill="currentColor" stroke="none">evidence on file — private-safe</text>
          </g></svg></div>`;

/* ── fig. 2 — the architecture, data-driven ────────────────────────────
   A faithful port of SystemDiagram.tsx: linear draws the true pipeline
   as a stage rail with off-spine branches; loop keeps the card grid and
   marks the approval edge; default is cards + flow list. Clay marks the
   gates, and the caption's clay clause renders only when a gate does. */
function isGateNode(n) {
  return n.kind === "validation" || n.gate === true;
}
function nodeCard(n) {
  const gate = isGateNode(n);
  return `<div class="ncard${gate ? " gate" : ""}"><p class="nlabel">${esc(n.label)}${gate ? '<span class="gsq2" aria-hidden="true"></span>' : ""}</p><p class="ndetail">${esc(n.detail)}</p></div>`;
}
function systemDiagram(arch) {
  const byId = new Map(arch.nodes.map((n) => [n.id, n]));
  const gateCount =
    arch.nodes.filter(isGateNode).length +
    arch.edges.filter((e) => e.gate === true).length;
  const figureName =
    arch.variant === "linear"
      ? "the pipeline"
      : arch.variant === "loop"
        ? "the gated loop"
        : "the system";
  const caption =
    gateCount > 0
      ? `fig. 2 — ${figureName}, inked. clay marks ${gateCount === 1 ? "the gate" : "the gates"}: where a check can stop the run.`
      : `fig. 2 — ${figureName}, inked.`;
  const annotation = arch.annotation
    ? `<div class="annot"><svg aria-hidden="true" viewBox="0 0 34 24"><path d="M2 22 C 9 19, 16 11, 29 4 M29 4 l-6.5 0.8 M29 4 l-1.2 6.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg><p>${esc(arch.annotation)}</p></div>`
    : "";

  if (arch.variant === "linear" && arch.flow) {
    const stageEdgeLabels = (from, to) => [
      ...new Set(
        arch.edges
          .filter((e) => from.includes(e.from) && to.includes(e.to))
          .map((e) => e.label)
      ),
    ];
    const offSpine = arch.edges.filter((e) => {
      for (let i = 0; i < arch.flow.length - 1; i++) {
        if (arch.flow[i].includes(e.from) && arch.flow[i + 1].includes(e.to))
          return false;
      }
      return true;
    });
    const rail = arch.flow
      .map((stage, i) => {
        const joint =
          i > 0
            ? `<div class="joint"><span aria-hidden="true">⟶</span><span>${esc(stageEdgeLabels(arch.flow[i - 1], stage).join(" · "))}</span></div>`
            : "";
        return `${joint}<div class="stage">${stage.map((id) => (byId.has(id) ? nodeCard(byId.get(id)) : "")).join("")}</div>`;
      })
      .join("");
    const branches = offSpine.length
      ? `<div class="offspine"><p class="oshead">off the spine —</p><ul>${offSpine
          .map(
            (e) =>
              `<li><span class="n1">${esc(byId.get(e.from)?.label ?? e.from)}</span><span aria-hidden="true"> ⟶ </span><wbr><span class="n1">${esc(byId.get(e.to)?.label ?? e.to)}</span><wbr> <span class="elabel">${esc(e.label)}</span></li>`
          )
          .join("")}</ul></div>`
      : "";
    return `<figure id="fig-2" class="diagram"><p class="dsummary">${esc(arch.summary)}</p><div class="rail">${rail}</div>${branches}${annotation}<figcaption>${esc(caption)}</figcaption></figure>`;
  }

  const firstNodeId = arch.nodes[0]?.id;
  const circuit = arch.edges
    .map((e) => {
      const closes = arch.variant === "loop" && e.to === firstNodeId;
      return `<li>${e.gate ? '<span class="gsq2" aria-hidden="true"></span>' : ""}<span class="n1">${esc(byId.get(e.from)?.label ?? e.from)}</span><span aria-hidden="true"> ⟶ </span><wbr><span class="n1">${esc(byId.get(e.to)?.label ?? e.to)}</span><wbr> <span class="elabel${e.gate ? " gatelbl" : ""}">${esc(e.label)}</span>${closes ? '<span class="elabel"> <span aria-hidden="true">↺ </span>closes the loop</span>' : ""}</li>`;
    })
    .join("");
  return `<figure id="fig-2" class="diagram"><p class="dsummary">${esc(arch.summary)}</p><div class="cards">${arch.nodes.map(nodeCard).join("")}</div><div class="offspine"><p class="oshead">${arch.variant === "loop" ? "the circuit —" : "flow —"}</p><ol>${circuit}</ol></div>${annotation}<figcaption>${esc(caption)}</figcaption></figure>`;
}

/* ── fig. 3 — the registry excerpt (automl only) ───────────────────────
   The stampable 041 row: a real <button> in both states, aria-pressed
   as the accessible truth, paper-memory.js as the pen. The metric
   column stays drawn, labelled and redacted — ▓▓ with an sr-only twin —
   because a table with no place for the withheld numbers cannot show
   WHAT is withheld (F21/F56's ruling, carried over). */
function registryFig(reg) {
  const rows = reg.rows
    .map((row, i) => {
      const awaiting = row.status === "awaiting approval";
      const status = awaiting
        ? `<button type="button" data-registry-approve aria-pressed="false" aria-label="Approve run no. ${esc(row.run)}" class="registry-approve"><span class="registry-strike">${esc(row.status)}</span><span aria-hidden="true" class="registry-mark"><span class="gsq2"></span>approved</span></button>`
        : `<span class="rgstatus">${esc(row.status)}</span>`;
      return `<li data-registry-row="${i}"${awaiting ? ' class="awaiting"' : ""}><span class="rgrun">${esc(row.run)} · ${esc(row.model)}</span><span class="rgm" aria-hidden="true">▓▓</span><span class="sr-only">metrics not published</span>${status}</li>`;
    })
    .join("\n              ");
  return `<section class="registry"><figure id="fig-3">
          <ul>
            <li class="rghead" aria-hidden="true"><span>run · model</span><span class="rgm">metrics</span><span class="rgstatus">status</span></li>
            <li class="rgnote" aria-hidden="true">metrics withheld — the caption says why</li>
              ${rows}
          </ul>
          <figcaption>${reg.caption.map((l) => `<span>${esc(l)}</span>`).join("")}</figcaption>
        </figure></section>`;
}

/* ── the receipts table ────────────────────────────────────────────── */
function receiptRow({ row, n, projectId, receiptAnchor, receiptAuditState }) {
  const padded = String(n).padStart(2, "0");
  const anchor = receiptAnchor(projectId, n);
  const state = receiptAuditState(row);
  const cites = citedFig(row);
  const glyph =
    state === "artifact" ? "tick" : state === "capture" ? "ring" : "dash";
  const artifacts = row.artifacts.length
    ? `<ul>${row.artifacts
        .map((a, i) => {
          const key = i === 0 ? `<span class="klabel">artifact: </span>` : "";
          return external(a.href)
            ? `<li>${key}<a href="${esc(a.href)}" target="_blank" rel="noopener noreferrer">${esc(a.label)}&#xA0;↗</a></li>`
            : `<li>${key}<a href="${esc(citationHref(a))}" class="cite-link">${esc(a.label)}</a></li>`;
        })
        .join("")}</ul>`
    : `<p class="none"><span class="klabel">artifact: </span>no linkable artifact — described only</p>`;
  return `<li id="${anchor}" data-receipt-row${cites ? ` data-cites="${cites}"` : ""} data-audit="${state}">
              <p class="claim"><a class="rnum" href="#${anchor}" aria-label="${padded} — permalink to receipt ${n}">${padded}<span class="audit-mark am-${glyph}">${auditGlyph(state)}</span></a><span class="klabel">claim: </span><span class="ctext">${esc(row.claim)}</span></p>
              <p class="rmeta"><span class="klabel">method: </span>${esc(row.method)}<span class="rdate"><span class="klabel">date: </span>${row.date ? esc(row.date) : "date not recorded"}</span></p>
              <div class="rart">${artifacts}<p class="vis">${visibilityGlyph(row.visibility)} ${esc(VISIBILITY_LABEL[row.visibility])}</p></div>
            </li>`;
}

function evidenceTable({
  title,
  rows,
  startIndex,
  projectId,
  helpers,
  headSlot,
}) {
  const { receiptAnchor, receiptAuditState } = helpers;
  const headRow = headSlot
    ? `<div class="thead"><h3>${title}</h3>${headSlot}</div>`
    : `<h3>${title}</h3>`;
  return `<div class="rtable">
          ${headRow}
          <div class="collegend" aria-hidden="true"><span>claim</span><span>method · date</span><span>artifact · visibility</span></div>
          <ol>
            ${rows
              .map((row, i) =>
                receiptRow({
                  row,
                  n: startIndex + i,
                  projectId,
                  receiptAnchor,
                  receiptAuditState,
                })
              )
              .join("\n            ")}
          </ol>
        </div>`;
}

/** "run the audit" — resting face and settled face in one grid cell, so
 *  the swap (fresh or dried) moves nothing. paper-memory.js persists the
 *  act; assets/archive.js walks the rows and fills the date. */
function auditControl({ projectId, counts, sentence }) {
  const descId = `audit-run-desc-${projectId}`;
  return `<span class="audit-seat"><button type="button" class="audit-run" data-audit-run="${esc(projectId)}" aria-describedby="${descId}">
            <span class="faces"><span class="face rest">walk the ${counts.total} claims ⟶</span><span class="face settled" aria-hidden="true">${esc(sentence)} · <span data-walk-date>${GHOST_DATE}</span></span></span>
          </button><span id="${descId}" class="sr-only">walks the receipts below, top to bottom, and marks each row this page can verify: a check where a pinned artifact resolves, a ring where the trail ends in an on-page capture, a dash where a claim is described only. walked once, the result settles here and stays.</span><span role="status" class="sr-only" data-walk-status></span></span>`;
}

/* ── the appendix ──────────────────────────────────────────────────────
   RULED 2026-08-07: the appendix holds only artifacts a reader can OPEN —
   captures and documents that are evidence in themselves. Anything the
   page can say natively already says it as fig. 1, fig. 2 or the ledger;
   the React era's dark-palette architecture/ledger SVGs restated those
   surfaces in a foreign hand and are retired, not redrawn — a native
   redraw would just duplicate fig. 2 in-house. */

/** The split the appendix is built on, named once: a local artifact ships
 *  as a plate the reader can enlarge; an external or mailto one is a row
 *  in the outbound index. tests/playwright/case-file-fixtures.ts restates
 *  this predicate — a drift here sends the suite looking for plates the
 *  page never draws. */
const isPlateArtifact = (a) =>
  !external(a.href) && !a.href.startsWith("mailto:");

function viewerDialog({ artifact, fig }) {
  const href = external(artifact.href)
    ? artifact.href
    : sitePath(PREFIX, artifact.href);
  return `<dialog class="viewer" id="viewer-fig-${fig}" aria-label="${esc(artifact.label)} artifact viewer">
          <div class="vhead"><div class="vtitle"><p class="vtype">${esc(artifact.type)}</p><h2>${esc(artifact.label)}</h2></div>
          <a href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="Open original artifact">open original&#xA0;↗</a>
          <button type="button" data-viewer-close aria-label="Close artifact viewer">✕</button></div>
          <p class="vprov">source: ${esc(artifact.source)} · date: ${artifact.date ? esc(artifact.date) : "not recorded"} · boundary: ${esc(artifact.boundary)}</p>
          <img src="${esc(href)}" alt="${esc(artifact.label)} artifact">
        </dialog>`;
}

function artifactGallery({ artifacts, figStart }) {
  const plates = artifacts.filter(isPlateArtifact);
  const indexRows = artifacts.filter((a) => !isPlateArtifact(a));
  /* The poster spans the full grid width on its own class, so the pairing
     arithmetic counts only the half-width gallery plates. The old
     `plates.length` parity counted the poster too and handed `.wide` to
     automl's third plate while its second sat alone beside an empty cell —
     the exact ragged row the data layer's plate-order note says this grid
     was arranged to avoid. And `.wide` asks for MORE than one: it is the
     odd-remainder patch for a multi-plate grid (16:9 frame, caption
     sidebar), so a file with a single plate files it at standard plate
     scale instead of dressing it as the leftover of a pair that does not
     exist — Cadence shipped exactly that costume until 2026-08-07. */
  const galleryCount = plates.filter(
    (a) => !(a.panels && a.sourceSize)
  ).length;
  const parts = [];
  const dialogs = [];

  plates.forEach((artifact, i) => {
    const fig = figStart + i;
    const src = sitePath(PREFIX, artifact.href);
    dialogs.push(viewerDialog({ artifact, fig }));
    const capTail = `<span class="fc-note">source: ${esc(artifact.source)} · ${artifact.date ? esc(artifact.date) : "date not recorded"} · open to inspect ⟶</span>`;

    if (artifact.panels && artifact.sourceSize) {
      /* The poster: readable column-width CSS crops of the one
         checked-in capture — the rect math is PanelCrop's, verbatim,
         so no derivative asset is ever generated. */
      const s = artifact.sourceSize;
      const panels = artifact.panels
        .map((p) => {
          const w = ((s.width / p.width) * 100).toFixed(4);
          const l = ((p.x / p.width) * 100).toFixed(4);
          const tp = ((p.y / p.height) * 100).toFixed(4);
          return `<span class="panel"><span class="plate-paper"><span class="crop" style="aspect-ratio:${p.width} / ${p.height}"><img src="${esc(src)}" alt="" style="width:${w}%;left:-${l}%;top:-${tp}%" loading="lazy"></span></span><span class="plabel">${esc(p.label)}</span></span>`;
        })
        .join("");
      parts.push(
        `<a class="plateb poster" id="fig-${fig}" href="${esc(src)}" data-viewer="viewer-fig-${fig}">${panels}<span class="pcap"><span class="fc-main">fig. ${fig} — ${esc(artifact.label)}.</span><span class="fc-note">panels cropped at column width from the checked-in capture — the titles are the poster’s words, not this file’s claims.</span>${capTail}</span></a>`
      );
      return;
    }
    const wide =
      galleryCount > 1 && galleryCount % 2 === 1 && i === plates.length - 1;
    parts.push(
      `<a class="plateb${wide ? " wide" : ""}" id="fig-${fig}" href="${esc(src)}" data-viewer="viewer-fig-${fig}"><span class="plate-paper"><span class="pframe"><img src="${esc(src)}" alt="${esc(artifact.label)} plate" loading="lazy"></span></span><span class="pcap"><span class="fc-main">fig. ${fig} — ${esc(artifact.label)}.</span>${capTail}</span></a>`
    );
  });

  const index = indexRows.length
    ? `<div class="aindex"><p class="oshead">artifact index —</p><ul>${indexRows
        .map(
          (a) =>
            `<li><a href="${esc(a.href)}" target="_blank" rel="noopener noreferrer">${esc(a.label)}&#xA0;↗</a><span class="aprov">[${esc(a.type)}] · ${esc(a.source)}</span></li>`
        )
        .join("\n            ")}</ul></div>`
    : "";
  return `${plates.length ? `<div class="plates">${parts.join("\n          ")}</div>` : ""}${index}${dialogs.join("\n        ")}`;
}

/* ── the page ────────────────────────────────────────────────────────── */
export function renderCaseFile({
  study,
  project,
  next,
  stations,
  seo,
  siteMetadata,
  caseStudies,
}) {
  const {
    DOSSIER_TOTAL,
    receiptAnchor,
    receiptAuditState,
    receiptAuditCounts,
    auditTallyClauses,
    auditSettledSentence,
  } = caseStudies;
  const RUN = siteMetadata.url;
  const TOTAL = String(DOSSIER_TOTAL);
  const fileNo = String(study.fileNo);
  const station = stationFor(stations, study.projectId);
  const isPrivate = study.repoPin === null;
  const figStart = study.registryFig ? 4 : 3;
  const counts = receiptAuditCounts(study);
  const sentence = auditSettledSentence(counts);
  const allRows = [...study.receipts, ...study.outcomes];
  const hasLocalOnlyRow = allRows.some((r) => r.visibility === "local-only");
  const anchorCount = allRows.length;

  /* The appendix heading is a claim, and it must match the shelf: plates
     when there are plates, the outbound index when that is all there is,
     and a stated absence when a file has nothing a reader could open —
     which is a boundary being kept, not a gap. Every variant keeps the
     word "artifacts": atlas asserts a visible occurrence of each section
     word on every route. */
  const plateCount = study.artifacts.filter(isPlateArtifact).length;
  const appendixKick = plateCount
    ? "plates &amp; artifacts"
    : study.artifacts.length
      ? "artifacts, indexed"
      : "artifacts — none beyond the page";
  const appendixBody = study.artifacts.length
    ? artifactGallery({ artifacts: study.artifacts, figStart })
    : `<p class="noplates">nothing to open here, deliberately — ${
        study.ledger
          ? "the ledger above is this file’s publishable artifact, shown in full,"
          : "everything this file can publish is already on the page,"
      } and the records behind it stay private.</p>`;

  const title = `${project.title} Case Study | Ayush Yadav`;
  const route = `/projects/${study.projectId}/`;

  const glance = `<figure class="glance" data-proof-glance>
          <div class="gmarks" aria-hidden="true">${allRows
            .map((r) => {
              const s = receiptAuditState(r);
              return `<span data-glance-state="${s}">${auditGlyph(s, "ag lg")}</span>`;
            })
            .join("")}</div>
          <figcaption>at a glance — ${esc(auditTallyClauses(counts).join(" · "))}</figcaption>
        </figure>`;

  const methodSlip = study.protocol
    ? `<aside class="methodslip"><h3>method slip — eval protocol</h3>${
        study.protocol.documented
          ? `<dl>${study.protocol.lines
              .map(
                (l) =>
                  `<div><dt>${esc(l.label)}: </dt><dd>${breakable(l.value)}</dd></div>`
              )
              .join("")}</dl>`
          : `<p class="notdoc">protocol: not yet documented — see corrections.</p>`
      }</aside>`
    : "";

  /* The boundary ends the section. The clause that used to follow it —
     "the svg plate in the appendix is this same ledger, demoted to
     thumbnail" — described the React era's dark-palette SVG twin,
     retired 2026-08-07. The table above IS the record; the json
     download is its portable copy, and nothing stands in for either. */
  const ledger = study.ledger
    ? `<section id="ledger">
          <h2 class="seckick">[ ledger ] · § ${esc(study.ledger.title)} — checked in ${esc(study.ledger.checkedIn)}</h2>
          <table><thead><tr><th scope="col">entry</th><th scope="col">value</th><th scope="col" class="notecol">note</th></tr></thead>
          <tbody>${study.ledger.rows
            .map(
              (r) =>
                `<tr><td>${esc(r.label)}</td><td class="val">${esc(r.value)}</td><td class="notecol">${esc(r.note)}</td></tr>`
            )
            .join("")}</tbody></table>
          <p class="dl"><a href="${esc(sitePath(PREFIX, study.ledger.jsonPath))}" download>download the raw ledger (json) ⟶</a></p>
          <p class="boundary">${esc(study.ledger.boundary)}.</p>
        </section>`
    : "";

  const corrections = study.corrections.length
    ? `<ul>${study.corrections
        .map(
          (c) =>
            `<li><p class="ckind">${esc(c.kind)} · ${esc(c.date)}</p><p class="cbody">${esc(c.text)}</p></li>`
        )
        .join("\n            ")}</ul>`
    : `<p class="noc">no corrections on file. when a number changes, it is amended here in public — never deleted.</p>`;

  const nextTeaser = next
    ? `<p class="nextfile">next file — <a href="../${esc(next.projectId)}/">case file ${next.fileNo} of ${TOTAL} · ${esc((caseStudies.getCaseStudyProject(next)?.title ?? next.projectId).toLowerCase())} — filed ${esc(next.filed)} ⟶</a></p>`
    : "";

  const body = `${masthead(RUN, `the record room · case file ${fileNo} of ${TOTAL}`)}
    <main id="main-content">
    <article class="dossier" data-dossier data-case-file="${esc(study.projectId)}">
      <div class="wrap">
        <div class="kickrow">
          <p data-dossier-kicker>¶ case file ${fileNo} of ${TOTAL} · ${esc(project.title.toLowerCase())} — <span class="nowrap">filed ${esc(study.filed)}</span> · <span class="nowrap">last verified ${esc(study.verified)}</span></p>
          <p data-dossier-status class="folio-seat">status: ${esc(study.status)}${study.statusDetail ? ` — ${esc(study.statusDetail)}` : ""}</p>
        </div>

        ${arrivalSlip({ station, study, runUrl: RUN })}

        <p class="file-note" data-file-memory="${esc(study.projectId)}" hidden></p>

        <header class="filehead">
          <h1 data-thread-title>${esc(project.title)}</h1>
          <p class="deck">${esc(study.summary)}</p>
        </header>

        <div class="metagrid">
          ${metaLedger({ study, project })}
          <div class="metaside">${isPrivate ? PRIVATE_STAMP : ""}${
            study.evidenceDisclosure
              ? `<aside class="disclosure">${esc(study.evidenceDisclosure.label)} — ${esc(study.evidenceDisclosure.detail)}</aside>`
              : ""
          }</div>
        </div>

        <div class="probgrid">
          <section id="problem">
            <h2 class="seckick">[ problem ] · § as found</h2>
            <p class="prose">${esc(study.problem)}</p>
            <h3 class="sublabel">constraints —</h3>
            <ul class="constraints">${study.constraints.map((c) => `<li>${esc(c)}</li>`).join("\n              ")}</ul>
          </section>
          <section id="project-visual">
            ${caseFigure(study.projectId)}
          </section>
        </div>

        <section id="architecture">
          <h2 class="seckick">[ architecture ] · § fig. 2, inked</h2>
          ${systemDiagram(study.architecture)}
        </section>

        ${study.registryFig ? registryFig(study.registryFig) : ""}

        <section id="decisions">
          <h2 class="seckick">[ decisions ] · § as filed</h2>
          <div class="drows">
            ${study.decisions
              .map(
                (d, i) =>
                  `<article class="drow"><h3>d${i + 1} — ${esc(d.decision.toLowerCase())} · ${esc(d.status)}</h3><p class="dreason">${esc(d.reason)}<sup>${i + 1}</sup></p><p data-tradeoff-slip class="dslip"><sup>${i + 1}</sup> tradeoff — ${esc(d.tradeoff)}</p></article>`
              )
              .join("\n            ")}
          </div>
        </section>

        <section id="validation">
          <h2 class="seckick">[ validation ] · § the receipts</h2>
          ${glance}
          ${methodSlip}
          ${evidenceTable({
            title: "validation",
            rows: study.receipts,
            startIndex: 1,
            projectId: study.projectId,
            helpers: { receiptAnchor, receiptAuditState },
            headSlot: auditControl({
              projectId: study.projectId,
              counts,
              sentence,
            }),
          })}
          ${evidenceTable({
            title: "outcomes",
            rows: study.outcomes,
            startIndex: study.receipts.length + 1,
            projectId: study.projectId,
            helpers: { receiptAnchor, receiptAuditState },
          })}
          <p class="provline">${
            hasLocalOnlyRow
              ? "rows marked [local — verified on request] were run by me on personal or demo data · "
              : ""
          }ci rows link the public run · repo pins are the exact commits verified ${esc(study.verified)}.</p>
          <div class="notclaim">
            <h3 class="sublabel">what i’m NOT claiming —</h3>
            <ul>${study.notClaiming.map((l) => `<li>${esc(l)}</li>`).join("\n            ")}</ul>
          </div>
        </section>

        ${ledger}

        <section id="corrections">
          <h2 class="seckick">[ corrections ] · § the register</h2>
          ${corrections}
        </section>

        <section id="artifacts">
          <h2 class="seckick">[ appendix ] · § ${appendixKick}</h2>
          ${appendixBody}
        </section>

        <footer class="folio">
          <div class="rule" aria-hidden="true"><span></span><span class="rlabel">case file ${fileNo} of ${TOTAL}</span><span></span></div>
          <div class="folio-links">
            <a class="rejoin" href="${esc(RUN)}/#${esc(station.id)}">⟵ rejoin the line at ¶ ${stationNo(station)} · ${esc(station.name)} — ${esc(station.clock)}</a>
            <a class="onward folio-seat" href="${PREFIX}evidence/">the evidence index ⟶</a>
          </div>
          ${nextTeaser}
        </footer>
      </div>
    </article>
    </main>
    ${colophon(RUN)}`;

  const html = document_({
    headHtml: head({
      seo,
      siteMetadata,
      route,
      title,
      description: study.summary,
      image: `/og/case-${study.projectId}.png`,
      imageAlt: `Case file card — ${project.title}, from Ayush Yadav’s portfolio`,
      ogType: "article",
      article: { published: study.filed, modified: study.verified },
      jsonLd: seo.caseStudyGraph(project, study),
      extraHead: assetHead(PREFIX),
    }),
    body,
    bodyClass: "archive case-file",
  });

  return { html, anchorCount };
}
