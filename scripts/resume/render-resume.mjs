import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";

const outputPath = resolve(process.cwd(), "public/resume.pdf");

const sections = [
  {
    title: "Summary",
    body: [
      "Computer Science graduate from Miami University (B.S. Computer Science, May 2026; GPA: 3.46) with experience building Python and SQL data pipelines, full-stack products, applied ML workflows, and reliability-focused tooling. Recent ITSM internship work covered 1M+ operational records, Tableau/OAS reporting, Workday data integration, and automation through APIs. Seeking new-grad software engineering, data engineering, full-stack, or ML-adjacent software roles.",
    ],
  },
  {
    title: "Education",
    body: [
      "<strong>Miami University, Oxford, OH</strong> | Bachelor of Science in Computer Science - May 2026",
      "GPA: 3.46 (Dean's List: Fall 2023, Spring 2025, Fall 2025) | Dept GPA: 3.68 | Major GPA: 3.42",
      "<strong>Relevant Coursework:</strong>",
    ],
    items: [
      "CSE 385 - Database Systems: Relational modeling, normalization, relational algebra, SQL",
      "CSE 432 - Machine Learning: Data processing, predictive models, term project on large datasets",
      "CSE 443 - High Performance Computing: Parallel programming on multiprocessors and clusters",
      "CSE 484 - Algorithms II: NP-completeness, approximation and randomized algorithms",
    ],
  },
  {
    title: "Technical Skills",
    items: [
      "<strong>Languages:</strong> Python, Java, C++, JavaScript, TypeScript, SQL",
      "<strong>Web and Systems:</strong> React, Next.js, Node.js, Express, NestJS, PostgreSQL, Prisma, Docker, SwiftUI, ARKit, Vision, OpenMP",
      "<strong>Data and ML:</strong> ETL, pandas, Tableau, Snowflake, RAG, OpenAI Responses API, File Search, LangGraph, MCP, SetFit, sentence-transformers",
      "<strong>Tooling and Quality:</strong> Git, GitHub Actions, Playwright, axe-core, CI/CD, Linux/Unix CLI, Xcode, VS Code",
    ],
  },
  {
    title: "Projects",
    groups: [
      {
        heading: "Agentic AutoML Platform - Senior Capstone (May 2026)",
        items: [
          "Engineered React and Express/PostgreSQL workflow surfaces for dataset upload, EDA, preprocessing, training, experiment tracking, and deployment phases.",
          "Used LangGraph and MCP orchestration with human approval gates, Dockerized execution, and Playwright/eval-runner validation.",
        ],
      },
      {
        heading: "JobTracker - Local-First macOS Job Search Tracker (2026)",
        items: [
          "Built Gmail OAuth2/iCloud IMAP ingestion, SQLite workflow state, and SwiftUI dashboard architecture for private local tracking.",
          "Designed rules, embeddings, and SetFit classifier gates; validation records 182 backend tests and 0.9791 macro-F1 on 96 samples.",
        ],
      },
      {
        heading: "Visual Assist - iOS LiDAR Accessibility App (2025-2026)",
        items: [
          "Built SwiftUI/ARKit LiDAR obstacle detection, Vision OCR, speech guidance, haptics, and VoiceOver-first flows for on-device use.",
          "Covered model and utility logic with 71 audited XCTest functions while keeping camera and location context local.",
        ],
      },
      {
        heading: "Fast MNIST Neural Network - C++ HPC Project (2025-2026)",
        items: [
          "Collaborated on C++17 MNIST train/eval CLI with SIMD/OpenMP kernels, cached dataset loading, and benchmark instrumentation.",
          "Recorded 97%+ MNIST accuracy and 3.5x dot-kernel speedup in committed benchmark evidence.",
        ],
      },
    ],
  },
  {
    title: "Experience",
    groups: [
      {
        heading:
          "ITSM Data Integration Student Associate (Intern) - Miami University (Jun 2025 - May 2026)",
        items: [
          "Built Python and SQL ETL workflows for 1M+ OAS/Tableau/Workday records; normalized operational data for KPI reporting.",
          "Consolidated Tableau metadata and Workday exports into a 10,453-row deduplicated inventory with deterministic IDs and a 35-field schema.",
          "Delivered Tableau dashboards and private internal automation, including Slack and OpenAI RAG support with cited-source checks.",
        ],
      },
      {
        heading:
          "Student Worker - Market Street at MacCracken (Aug 2023 - Dec 2023)",
        items: [
          "Supported checkout and grill operations; maintained accurate service and safety standards.",
        ],
      },
    ],
  },
  {
    title: "Leadership and Activities",
    items: [
      "<strong>Volunteer Teacher - USM, Indore, India (2017-2018):</strong> Taught basic education to underserved children, promoting literacy and inclusion.",
      "<strong>Finalist - MUCAT Design Innovation Competition (Feb 2025):</strong> Selected as finalist team; authored LiDAR visual assistance proposal.",
      "<strong>4th Place - Social Innovation Weekend (Mar 2025):</strong> Built user-centered solutions to loneliness/isolation; placed 4th among interdisciplinary teams.",
    ],
  },
];

function renderList(items = []) {
  if (items.length === 0) return "";

  return `<div class="bullets">${items
    .map((item) => `<p class="bullet">- ${item}</p>`)
    .join("")}</div>`;
}

function renderSection(section) {
  const body = section.body
    ? section.body.map((line) => `<p>${line}</p>`).join("")
    : "";
  const items = renderList(section.items);
  const groups = section.groups
    ? section.groups
        .map(
          (group) => `
            <div class="group">
              <p class="heading">${group.heading}</p>
              ${renderList(group.items)}
            </div>
          `
        )
        .join("")
    : "";

  return `
    <section>
      <h2>${section.title}</h2>
      ${body}
      ${items}
      ${groups}
    </section>
  `;
}

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page {
        size: Letter;
        margin: 0.32in 0.46in 0.32in 0.46in;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        color: #111;
        font-family: "Times New Roman", Times, serif;
        font-size: 9.7pt;
        line-height: 1.13;
        word-spacing: 0.02em;
      }

      header {
        text-align: center;
        margin-bottom: 7px;
      }

      h1 {
        margin: 0 0 2px;
        font-size: 16.2pt;
        line-height: 1;
      }

      .contact {
        font-size: 9.55pt;
        font-weight: 700;
      }

      section {
        margin-top: 4.4px;
      }

      h2 {
        margin: 0 0 1px;
        color: #2f5f99;
        font-size: 13.2pt;
        line-height: 1;
      }

      p {
        margin: 0;
      }

      .heading {
        font-weight: 700;
      }

      .group {
        margin-top: 1.8px;
      }

      .bullets {
        margin: 0 0 0 16px;
      }

      .bullet {
        margin: 0;
        padding-left: 0;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Ayush Yadav</h1>
      <div class="contact">
        yadava5@miamioh.edu | (513) 461-4375 | linkedin.com/in/ayush-yadav-developer | github.com/yadava5
      </div>
    </header>
    ${sections.map(renderSection).join("")}
  </body>
</html>`;

await mkdir(dirname(outputPath), { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({
    path: outputPath,
    format: "Letter",
    printBackground: true,
    preferCSSPageSize: true,
  });
} finally {
  await browser.close();
}

console.log(`Wrote ${outputPath}`);
