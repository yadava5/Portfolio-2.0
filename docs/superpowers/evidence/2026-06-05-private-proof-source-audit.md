# Private Proof Source Audit

## Scope

This audit checked the private/work-related proof surfaces that still relied on representative architecture diagrams:

- PolicyBot source repo: `/Users/ayush/Documents/Projects/policybot-Miami-IT`
- Master Inventory source repo: `/Users/ayush/Documents/IT (Internship)/Agentic Architecture/Master Inventory (Code Implementation)`

No raw institutional policy content, Slack messages, PAT values, owner names, report names, or CSV rows were copied into the portfolio.

## PolicyBot

Source state:

- Branch/status: `main...origin/main`, clean during audit.
- Local repo has no checked-in `.venv`, `.env`, or `.vector_store_id`.

Safe validation:

```bash
python3 -m venv /tmp/policybot-audit-venv
/tmp/policybot-audit-venv/bin/python -m pip install --upgrade pip
/tmp/policybot-audit-venv/bin/python -m pip install -e '.[dev]'
/tmp/policybot-audit-venv/bin/python -m pytest tests -q
```

Result: `3 passed`.

Source-backed proof:

- README and architecture docs identify OpenAI Responses API with File Search as the retrieval layer.
- Source docs and code describe cited filenames and local quote verification when local policy files are available.
- Slack Socket Mode bridge and CLI entry points exist, with unit tests covering Slack formatting and mention stripping.
- Validation summary records `19/20` latest structured sweep, `17/25` keyword sweep, and fallback/rejection behavior.

Portfolio boundary:

- Do not publish raw validation JSON because it includes full questions and responses.
- Do not claim production deployment, active Slack workspace usage, always-on service operation, or perfect accuracy.
- Public proof asset added: `public/images/projects/policybot-validation-proof.svg`, a sanitized validation ledger showing counts, guardrails, and local test status only.

## Master Inventory

Source state:

- Branch/status: `main...origin/main [behind 1]`.
- Worktree already had unrelated tracked edits in `src/master_inventory/scripts/run_menu.py`, `tableau_master_inventory_export.py`, and `workday_latest_ingest.py`; this audit did not change them.

Safe validation:

```bash
PYTHONDONTWRITEBYTECODE=1 .venv/bin/python -m pytest -q -p no:cacheprovider
PYTHONDONTWRITEBYTECODE=1 .venv/bin/python -m ruff check --select E9,F63,F7,F82 src tests
```

Results: `3 passed`; ruff critical syntax/import checks passed.

Local processed artifact counts:

- `data/processed/tableau_master_inventory.csv`: 3,731 rows, 35 columns.
- `data/processed/workday_master_inventory.csv`: 6,743 rows, 35 columns.
- `data/processed/master_inventory.csv`: 10,453 rows, 22 nonempty columns.

Source-backed proof:

- README and architecture docs describe a local Python pipeline for Tableau metadata and Workday custom-report exports.
- `configs/unified_schema.yaml` defines the 35-field source schema.
- Source scripts generate deterministic `inventory_id` values and timestamped run folders.
- `data/README.md` explains that real extracts are intentionally excluded from version control.

Portfolio boundary:

- Replace stale `16,685` / `16.7k` inventory claims with the current 10,453-row processed audit.
- Do not expose raw CSV rows, owner/report/project names, datasource names, `.env`, PAT values, or run folder contents.
- Do not claim GraphQL extraction, Google Cloud/OAS scope, production dashboard deployment, or a full validation framework.
- Public proof asset added: `public/images/projects/master-inventory-proof.svg`, a sanitized processed-output ledger showing row counts, schema/test status, and privacy boundary only.
