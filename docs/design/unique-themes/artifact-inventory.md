# Technical Operations Atlas Artifact Inventory

## Purpose

This inventory records the real project artifacts available before concept generation. The portfolio should use screenshots, architecture diagrams, benchmarks, test evidence, and code links as proof. Generated decorative art must not become the primary project evidence.

## Flagship Projects

| Project | Project id | Required proof role | Existing path | File details | Status | Use in concept |
| --- | --- | --- | --- | --- | --- | --- |
| JobTracker | `jobtracker` | Native app/product visual, local ML pipeline evidence | `public/images/projects/jobtracker-architecture.svg` | SVG architecture diagram | Present | Use in Native Intelligence treatment and homepage selected work; old generated PNG was removed because the source repo intentionally omits outdated screenshots |
| AutoML Platform | `automl` | ML pipeline/workflow visual, orchestration evidence | `public/images/projects/automl.png` | PNG, 1376 x 768 | Present | Use in Technical Operations Atlas selected work and case study |
| Visual Assist | `visual-assist` | Accessibility/native product visual, LiDAR/field-system evidence | `public/images/projects/visual-assist-architecture.svg` | SVG architecture diagram | Present | Use in Field Systems treatment and accessibility proof module; old generated PNG was removed because no simulator screenshot has been source-validated |
| Taskflow Calendar | `taskflow-calendar` | Full-stack productivity app visual, test coverage evidence | `public/images/projects/taskflow.png` | PNG, 1376 x 768 | Present | Use in evidence records and recruiter scan path |
| Fast MNIST Neural Network | `fast-mnist-nn` | Benchmark/performance visual, model/system diagram | `public/images/projects/mnist.png` | PNG, 1376 x 768 | Present | Use in Fast MNIST case-study concept |
| Fast MNIST Neural Network | `fast-mnist-nn` | Secondary vector/diagram asset | `public/images/projects/fast-mnist-nn.svg` | SVG | Present | Use only if it reads as technical proof; otherwise prefer a code-native benchmark table |
| Master Inventory Pipeline | `master-inventory` | Private data pipeline proof | `public/images/projects/pipeline-architecture.svg` and `master-inventory-proof.svg` | SVG architecture diagram + proof ledger | Present | Use with sanitized row counts only: 3,731 Tableau rows + 6,743 Workday rows -> 10,453-row deduped master CSV |
| PolicyBot | `policybot` | Private RAG/Slack proof | `public/images/projects/policybot-architecture.svg` and `policybot-validation-proof.svg` | SVG architecture diagram + proof ledger | Present | Use with sanitized validation counts only: 19/20 structured sweep, 17/25 keyword sweep, and fallback/rejection behavior |

## Supporting Assets

| Asset | Path | Details | Status | Notes |
| --- | --- | --- | --- | --- |
| Resume | `public/resume.pdf` | PDF, 1 page | Present | Must be linked from first viewport and contact/footer |
| Miami University logo | `public/images/companies/miami.png` and `.svg` | Company/experience asset | Present | Use for experience proof if visually clean |
| Aramark logo | `public/images/companies/aramark.png` and `.svg` | Company/experience asset | Present | Secondary experience only |

## Proof Gaps To Fill With Code-Native Artifacts

These should be built as HTML/SVG/table components, not generated as decorative images:

| Project | Needed proof artifact | Recommended implementation |
| --- | --- | --- |
| JobTracker | 3-layer classifier flow and email sync pipeline | Code-native system diagram in `SystemDiagram` |
| AutoML Platform | dataset to training to deployment workflow | Code-native pipeline diagram plus decision/evaluation table |
| Visual Assist | LiDAR/Vision/Core ML privacy path | Code-native field-system diagram with accessibility labels |
| Taskflow Calendar | test coverage and scheduling/conflict workflow | Evidence table plus workflow diagram |
| Fast MNIST | SIMD/OpenMP benchmark and model evaluation | Benchmark table plus architecture diagram |
| Master Inventory | private-safe processed artifact proof | Sanitized terminal/table proof with counts, schema shape, tests, and privacy boundary; no CSV rows or institutional fields |
| PolicyBot | private-safe validation proof | Sanitized validation table with counts, quote-verification design, and local Slack tests; no raw validation JSON or policy text |

## Concept Gate Decision

Concept generation may use the existing screenshots as embedded visual material, but every concept must preserve readable technical proof. If a screenshot is too generic or decorative, the implementation should replace it with a code-native diagram or evidence table.
