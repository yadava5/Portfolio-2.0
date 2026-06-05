import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";

const outputPath = resolve(process.cwd(), "public/resume.pdf");

const sections = [
  {
    title: "Summary",
    body: [
      "Computer Science graduate from Miami University (B.S., May 2026; GPA 3.46) with ITSM Data Integration internship experience building Python/SQL pipelines on 1M+ row datasets, Tableau dashboards, and workflow automations. Proficient in Python, Java, C++, JavaScript/TypeScript, React, and SQL, with projects spanning an iOS LiDAR accessibility app, an AutoML senior capstone platform, and a SIMD/OpenMP-optimized MNIST neural network. Seeking software engineering/data roles.",
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
      "<strong>Languages:</strong> Python, Java, C++, JavaScript, HTML, CSS, SQL",
      "<strong>Frameworks/Libraries:</strong> React, Tauri, NestJS, Prisma, Zod, SwiftUI, ARKit, Vision, OpenMP, PyTorch, Scikit-learn",
      "<strong>Tools:</strong> Git, Visual Studio Code, Eclipse, Xcode, Linux/Unix CLI, Google Colab",
    ],
  },
  {
    title: "Projects",
    groups: [
      {
        heading:
          "AutoML - Automated Data Scientist Platform (Senior Capstone, May 2026)",
        items: [
          "RAG + MCP platform for domain-tuned ML services with deploy and monitor workflow phases.",
          "Automated training: HPO/multi-model search plus SFT; containerized runs.",
          "TS monorepo: React (Vite), Express, Postgres, Playwright evals.",
        ],
      },
      {
        heading:
          "Visual Assist - iOS LiDAR Visual Assistance App (Ongoing; January 2026)",
        items: [
          "On-device iOS LiDAR navigation with depth scan plus audio/haptics.",
          "Vision OCR plus object awareness; VoiceOver plus voice commands.",
          "Wearable planned; current version targets iOS LiDAR devices.",
        ],
      },
      {
        heading:
          "LifeQuest - Quest-Based Routine and Community Platform (April 2025)",
        items: [
          "Desktop quest platform turning routines into missions for job loss/retirement.",
          "Tauri + React + NestJS (Postgres/Prisma) for quests, progress, rewards.",
          "Future iOS app will add map-based quest experience.",
        ],
      },
      {
        heading:
          "Fast MNIST NN - High-Performance C++ Neural Network (HPC Final Project, November 2025)",
        items: [
          "Collaborated on C++17 MNIST NN with SIMD kernels plus OpenMP hot paths.",
          "CLI train/eval pipeline; cached MNIST loader for repeat runs.",
          "Catch2/CTest, Google Benchmark, CI, Doxygen, clang-format.",
        ],
      },
      {
        heading: "Dynamic Calendar Application (December 2023)",
        items: [
          "Collaborated on calendar tool with notes, reminders, location-aware scheduling.",
          "Integrated external APIs for dynamic address fetching.",
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
          "Built Python/SQL pipelines for 1M+ row datasets; analyzed trends and KPIs.",
          "Delivered Tableau dashboards with actionable insights for IT/non-IT teams.",
          "Built Workday/OAS/Tableau report inventory plus API-integrated Slack bot.",
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

  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
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
        margin: 0.34in 0.48in 0.34in 0.48in;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        color: #111;
        font-family: "Times New Roman", Times, serif;
        font-size: 9.45pt;
        line-height: 1.12;
      }

      header {
        text-align: center;
        margin-bottom: 8px;
      }

      h1 {
        margin: 0 0 2px;
        font-size: 16pt;
        line-height: 1;
      }

      .contact {
        font-size: 9.6pt;
        font-weight: 700;
      }

      section {
        margin-top: 5px;
      }

      h2 {
        margin: 0 0 1px;
        color: #2f5f99;
        font-size: 13.4pt;
        line-height: 1;
      }

      p {
        margin: 0;
      }

      .heading {
        font-weight: 700;
      }

      .group {
        margin-top: 2px;
      }

      ul {
        margin: 0 0 0 19px;
        padding: 0;
        list-style: none;
      }

      li {
        margin: 0;
        padding-left: 10px;
        position: relative;
      }

      li::before {
        content: "-";
        position: absolute;
        left: 0;
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
