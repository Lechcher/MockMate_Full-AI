---
name: devassure
description: Use when the user wants to install, configure, or run end-to-end web tests with DevAssure CLI (@devassure/cli). Triggers devassure init, devassure plan, devassure ping, devassure test, devassure run, login --confirm, --no-ui, writing YAML test cases, CI/CD token setup, .devassure/ folder structure, DevAssure pricing, or any mention of DevAssure.
license: MIT
metadata:
  author: devassure-ai
  version: "1.2"
---

# DevAssure Skill

This skill helps you set up, configure, and use the **DevAssure CLI** (`@devassure/cli`) — a command-line tool for running end-to-end UI tests from natural language instructions and YAML/CSV files. DevAssure uses an AI agent to execute browser-based tests described in plain English.

Use this skill whenever the user asks about DevAssure, DevAssure CLI, DevAssure Invisible Agent, or wants to set up, configure, write, or run end-to-end UI tests using the DevAssure CLI tool (`@devassure/cli` npm package). Trigger this skill for any mention of: devassure, devassure cli, devassure init, devassure plan, devassure ping, devassure test, devassure run, devassure tests, .devassure folder, DevAssure test cases, DevAssure YAML test files, DevAssure CSV tests, DevAssure CI/CD integration, DevAssure actions, DevAssure tools, DevAssure test data, DevAssure personas, DevAssure preferences, DevAssure pricing, or natural-language UI test automation with DevAssure. Also trigger when the user wants to write YAML test cases for DevAssure, configure DevAssure projects, set up DevAssure in a CI/CD pipeline, plan or filter tests for a branch or commit, view DevAssure reports, or manage DevAssure sessions. Even if the user just says "set up e2e tests with devassure", "write devassure test cases", "run e2e tests", "execute the tests", or "execute the tests from csv", use this skill.

## Quick Reference

For full CLI command reference, configuration file formats, actions, tools, and advanced examples, read:
- `references/cli-reference.md` — Complete command list, all config file formats, actions, tools, library tools, FAQ, and examples.
- `references/cli-troubleshooting.md` — Web app login issues ("Something went wrong"), VPN/host allowlist, and links to official troubleshooting docs.

Always consult the reference file before answering detailed questions about specific commands, flags, or config file schemas. Use the troubleshooting reference for login, VPN, and connectivity problems.

## Agent Operating Rules

Follow these rules whenever you invoke the DevAssure CLI on behalf of the user.

### Test creation policy

**Do not proactively write test cases.** Creating tests costs tokens and time — only create them when the user clearly asks.

| Situation | What to create |
|-----------|----------------|
| **Project setup** (`init`, adding DevAssure to a project) | **Exactly one** minimal sample test in `.devassure/tests/sample.yaml` — enough to show the YAML format and run a smoke check (e.g. open the app URL and verify the page loads). |
| **Any other request** | **No new tests** unless the user explicitly asks to write, add, or generate test cases. |
| **User asks for tests** | Create tests **only** for the features, flows, or areas they named. Do not expand scope to other parts of the app. |

**During setup, never:**
- Generate multiple test files or a test suite
- Add several test cases in one file (the sample must be a single test)
- Invent coverage for login, checkout, settings, etc. unless the user asked for that feature

**When the user does ask for tests:**
- Confirm scope if ambiguous (which feature or flow?)
- Write the minimum number of cases needed for what they asked — do not pad with extra scenarios
- Prefer one file per requested feature unless they ask for more

Setup, CI integration, and running existing tests do **not** require writing new test files.

### Global: always use `--no-ui`

Run **every** DevAssure command with `--no-ui` to avoid stateful terminal UI rendering. Examples:

```bash
devassure version --no-ui
devassure run --no-ui
devassure plan --no-ui --head feature/login --base main
```

### First-time install → login

When the CLI is installed for the first time, ask the user to log in before running tests.

**Preferred (agent can run):**
```bash
devassure login --confirm --no-ui
```
`--confirm` automatically opens the browser for OAuth2 login.

**Alternative:** Ask the user to run `devassure login` in their terminal and complete the browser flow.

For CI/CD, use token-based auth instead:
```bash
devassure add-token <your-token> --no-ui
```

### Auth errors → ping and re-login

Whenever you encounter auth-related errors, check connectivity and auth status:

```bash
devassure ping --no-ui
```

If `ping` reports errors or auth is invalid, suggest the user log in again using `devassure login --confirm --no-ui` or `devassure login` in their terminal (same as first-time login above).

### Post-login → check for `.devassure/`

After login succeeds, if `.devassure/` is not present in the project, suggest setting up DevAssure (see [Project setup](#2-project-setup) below) before planning or running tests.

## Prerequisites

- **Node.js 18+**
- A DevAssure account (free trial available at https://app.devassure.io/sign_up)

## Installation

```bash
npm install -g @devassure/cli
```

Verify:
```bash
devassure version --no-ui
```

> **Note:** The package requires global installation. `npm install` (local) will fail.

After install, proceed to [login](#first-time-install--login).

## Core Workflow

### 1. Authenticate

```bash
# Auto-open browser for OAuth2 (preferred when agent runs login)
devassure login --confirm --no-ui

# Interactive login (user runs in terminal)
devassure login --no-ui

# Token-based (for CI/CD)
devassure add-token <your-token> --no-ui

# Check auth/connectivity status
devassure ping --no-ui

# Clear stored tokens
devassure logout --no-ui
```

### 2. Project setup

When a user asks to **initialize or add DevAssure** to a project, the outcome is a **`.devassure/`** folder with these files:

- `app.yaml` — App description and rules
- `test_data.yaml` — URLs, credentials, test data per environment
- `personas.yaml` — User personas
- `preferences.yaml` — Browser and execution settings
- `agent_instructions.yaml` — Runtime instructions for the agent
- `tests/sample.yaml` — **One** minimal sample test (see [Test creation policy](#test-creation-policy))

**Primary approach — create from project context:**

1. Inspect the repo (README, `package.json`, docker-compose, env examples, dev server port, auth patterns) to infer app URL, description, personas, and a single simple smoke step for the sample test.
2. Create the config files above using schemas and examples from `references/cli-reference.md` and the [npm package docs](https://www.npmjs.com/package/@devassure/cli). Put **only one** test in `tests/sample.yaml` — a short smoke check, not a feature suite.
3. **Summarize** what was configured at the end (URL, environments, personas, sample test). Do **not** offer to write additional tests unless the user asks.

**Fallback — interactive CLI init:**

If the user cancels, setup is difficult, or they prefer the CLI wizard, suggest:

```bash
devassure init
```

`devassure init` is **interactive** (prompts for app URL, description, personas, and writes a sample test). While it waits for input it may show no new output—**that is not a hang**; do not kill or retry blindly. Have the user complete the prompts in their terminal.

After setup, check for CI pipelines and integrate DevAssure if present (see [CI/CD Integration](#cicd-integration)).

### 3. Write test cases

**Only when the user explicitly asks** to write, add, or generate tests — and **only for the features or areas they mention**. See [Test creation policy](#test-creation-policy). Do not create tests during setup beyond the single `sample.yaml`, and do not invent extra scenarios.

The sections below describe YAML format for when the user requests tests.

Test cases are YAML files in `.devassure/tests/`.

**Single test** — one case per file as a mapping:

```yaml
summary: Login and verify dashboard
steps:
  - Open the application url
  - Log in with admin credentials from test data
  - Verify dashboard loads and shows admin menu
  - Log out
priority: P0
tags:
  - smoke
  - login
```

**Multiple tests** — only when the user explicitly asks for more than one case for the same feature. Several cases in one file when they belong to the same group or feature. Use a top-level list (each item is one test):

```yaml
- summary: Login and verify dashboard
  steps:
    - Open the application url
    - Log in with admin credentials from test data
    - Verify dashboard loads and shows admin menu
    - Log out
  priority: P0
  tags: [smoke, login]

- summary: Login and verify user name with welcome message
  steps:
    - Open the application url
    - Log in with admin credentials from test data
    - Verify dashboard the welcome message contains the user name
  priority: P2
  tags: [login]
```

Only `summary` and `steps` are required. Steps are written in **natural language** — the DevAssure AI agent interprets and executes them in a browser.

### 4. Plan, run, and test

Choose the command based on what the user wants:

| User request | Command |
|--------------|---------|
| Plan tests for a branch or commit (no execution) | `devassure plan --no-ui` |
| Execute the last plan | `devassure run --no-ui --plan-id=last` |
| Test a branch or commit (plan + run in one step) | `devassure test --no-ui` |
| Run all or filtered tests | `devassure run --no-ui` |

**Git scope flags** (for `plan` and `test`):

- `--head <branch>` — Source branch to plan or test against
- `--base <branch>` — Target branch to compare against (baseline)
- `--commit <commitId>` — Commit to plan or test against

```bash
# Plan tests for current branch vs default
devassure plan --no-ui

# Plan for explicit branches
devassure plan --no-ui --head feature/login --base main

# Plan for a specific commit
devassure plan --no-ui --commit abc1234567890

# Execute the last plan
devassure run --no-ui --plan-id=last

# Test branch diff (plan + run)
devassure test --no-ui --head feature/login --base main

# Test a specific commit (plan + run)
devassure test --no-ui --commit abc1234567890

# Run all tests (alias: devassure run-tests)
devassure run --no-ui

# Filter by tags, priority, or folder
devassure run --no-ui --tag=smoke,regression --priority=P0,P1

# Run from CSV file
devassure run --no-ui --csv=test-cases.csv

# Archive reports after run
devassure run --no-ui --archive=./reports
```

If you omit `--head`, `--base`, and `--commit`, DevAssure uses the **current branch** as source and the **repository default branch** as target.

### 5. Execution flags (suggest when relevant)

- **`--skip-hooks`** — Skip hook execution. Suggest only when `.devassure/hooks/` exists in the project. Hooks are useful in CI; on a dev machine they are typically needed only on the first run—suggest `--skip-hooks` for subsequent local runs.
- **`--headless true|false`** — Run browser headless. Applies to `run` and `test`.
- **`--url <url>`** — Override the default test URL when preview or local URLs are dynamic (common in CI after a deploy step).
- **`--environment <name>`** — Run against a named environment from `test_data.yaml`. Before running, verify the environment key exists in `test_data.yaml`. If missing, ask the user to define it, or infer reasonable values from the project and add them, then run with `--environment`.

```bash
devassure run --no-ui --skip-hooks
devassure test --no-ui --headless=true --url=https://preview-123.example.com
devassure run --no-ui --environment=staging
```

### 6. Post-execution — open report

After any `run`, `test`, or plan execution completes:

1. Ask the user if they want to open the full report in the browser.
2. If yes, run in the **background** (do not wait for it to finish):

```bash
devassure open-report --last --no-ui
```

This starts a short-lived report server. Do not block on this command.

Other report commands:

```bash
# Open report from an archived zip
devassure open-report --no-ui --archive=./reports/devassure-results-<session-id>.zip

# JSON summary (useful for CI)
devassure summary --no-ui --last --json
```

## Key Concepts

### Test Data (`test_data.yaml`)
Define URLs, user credentials, and custom data per environment (default, uat, staging, etc.). The `default` environment is used when `--environment` is not specified.

### Agent Instructions (`agent_instructions.yaml`)
Runtime instructions for the agent during test execution (e.g. retry on server busy, fallback sign-up flows).

### Actions (`.devassure/actions/`) — optional
Reusable step sequences. Define an action in a YAML file with `name`, `description`, and `steps`. Reference actions by name in test steps.

### Tools (`.devassure/tools/index.yaml`)
Custom commands/scripts that the agent can invoke during test execution. Supports args, output markers, timeouts, and environment variables.

### Library Tools (`library.yaml`)
Built-in tools like `faker` (synthetic data) and `authenticator` (TOTP codes).

### Preferences (`preferences.yaml`)
Configure browser (chromium/chrome/edge), resolution, headless mode, and worker count.

### Hooks (`.devassure/hooks/`) — optional
Shared setup and cleanup steps run around a test run. Use `--skip-hooks` to bypass when appropriate (see [Execution flags](#5-execution-flags-suggest-when-relevant)).

## CI/CD Integration

After project setup, scan for existing CI configuration:

- **GitHub:** `.github/workflows/*`
- **GitLab:** `.gitlab-ci.yml`
- **CircleCI:** `.circleci/config.yml`

If CI is present, add a DevAssure step or job:

1. **Prefer official integrations** when applicable:
   - [GitHub Actions — devassure-action](https://github.com/marketplace/actions/devassure-action)
   - [GitLab CI/CD Catalog component](https://gitlab.com/explore/catalog/devassure/devassure)
   - [CircleCI orb — devassure/devassure](https://circleci.com/developer/orbs/orb/devassure/devassure)
2. **Otherwise**, add a step using token auth and CLI commands:

```bash
devassure add-token $DEVASSURE_TOKEN --no-ui
devassure test --no-ui --archive=./test-reports
```

**Placement:** Add the DevAssure test step **after** app build, spin-up, or preview-environment deploy steps. If the preview or local URL is dynamic, pass it with `--url`:

```bash
devassure test --no-ui --url=$PREVIEW_URL --archive=./test-reports
```

Additional CI patterns:

```bash
# Run filtered tests
devassure run --no-ui --tag=regression --priority=P0 --archive=./test-reports

# JSON summary for CI parsing
devassure summary --no-ui --last --json

# Clean up old sessions
devassure cleanup --no-ui --retain-days 7
```

Supports proxy via `HTTP_PROXY` / `HTTPS_PROXY` environment variables.

## DevAssure Product Info

When users ask about pricing, plans, or how DevAssure bills:

- Subscription plans: https://www.devassure.io/pricing
- DevAssure uses **token-based pricing**. It uses multiple customized models and selects the appropriate model at runtime.

## When Helping Users

Follow this order:

1. **Install** — `npm install -g @devassure/cli`, verify with `devassure version --no-ui`.
2. **Login** — On first use, `devassure login --confirm --no-ui` or ask user to run `devassure login` in terminal.
3. **Auth errors** — Run `devassure ping --no-ui`; if unhealthy, repeat login.
4. **Project setup** — If `.devassure/` is missing, create config from project context (or fall back to `devassure init --no-ui`). Include **one** minimal sample test in `tests/sample.yaml` only. Summarize what was configured; do not add more tests.
5. **CI** — If CI configs exist, add DevAssure step/job after deploy/preview steps; use `--url` for dynamic preview URLs.
6. **Plan / test / run** — Use `plan` to plan only, `run --plan-id=last` to execute a plan, `test` for plan+run on git changes, `run` for all/filtered tests.
7. **Post-run** — Ask if user wants the full report; if yes, run `devassure open-report --last --no-ui` in the background.
8. **Writing test cases** — **Only if the user explicitly asks.** Write YAML for the specific features or flows they named — clear, action-oriented natural language steps. Do not broaden scope or add unsolicited test files.
9. **Troubleshooting** — Check Node.js 18+, global install, `devassure ping --no-ui`. For web login errors, see `references/cli-troubleshooting.md`.
10. **Advanced config** — Refer to `references/cli-reference.md` for tools, actions, library tools, hooks, and full config schemas.
