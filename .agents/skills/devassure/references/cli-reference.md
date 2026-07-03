# DevAssure CLI — Complete Reference

Package and install details: [@devassure/cli on npm](https://www.npmjs.com/package/@devassure/cli).

## Table of Contents
1. [All Commands](#all-commands)
2. [Global Options](#global-options)
3. [Run Tests Options](#run-tests-options)
4. [Plan Command Options](#plan-command-options)
5. [Git Code Changes Options (`devassure test`)](#git-code-changes-options-devassure-test)
6. [Config File Formats](#config-file-formats)
7. [Hooks](#hooks)
8. [Actions](#actions)
9. [Tools](#tools)
10. [Library Tools](#library-tools)
11. [Filtering Examples](#filtering-examples)
12. [Report Commands](#report-commands)
13. [CI/CD](#cicd)
14. [FAQ](#faq)

---

## All Commands

### Authentication
| Command | Description |
|---------|-------------|
| `devassure login` | Login via OAuth2 (opens browser) |
| `devassure login --confirm` | Login and automatically open the browser for OAuth2 |
| `devassure logout` | Logout and clear stored tokens |
| `devassure add-token <token>` | Add and validate an auth token (CI/CD) |
| `devassure ping` | Check auth and connectivity status |

### Configuration
| Command | Description |
|---------|-------------|
| `devassure init` | Initialize `.devassure/` config in current directory |

### Running Tests
| Command | Description |
|---------|-------------|
| `devassure run-tests` (alias: `run`) | Run tests from current directory |
| `devassure plan` | Create a test plan for git code changes (no execution) |
| `devassure test` | Plan + run tests scoped to git code changes |
| `devassure resume --last` | Resume last test session |
| `devassure resume --session-id <id>` | Resume specific session |
| `devassure resume --id <id>` | Alias for `--session-id <id>` |

### Reports & Statistics
| Command | Description |
|---------|-------------|
| `devassure open-report --last` | Open report for last session |
| `devassure open-report --session-id <id>` | Open report for specific session |
| `devassure open-report --archive <path>` | Open report from archived zip |
| `devassure archive-report --output-dir <dir> --last` | Archive last session report to zip |
| `devassure summary --last` | Print summary for last session |
| `devassure summary --last --json` | Print summary as JSON |
| `devassure stats` | Show session count, scenario count, storage |

Notes:
- `devassure open-report` requires one of `--archive`, `--session-id`, or `--last`.
- `devassure archive-report` requires `--output-dir` and one of `--session-id` or `--last`.
- `devassure summary` requires one of `--session-id` or `--last` (and `--json` is optional).

### Maintenance
| Command | Description |
|---------|-------------|
| `devassure cleanup --retain-days <N>` | Keep sessions from last N days |
| `devassure cleanup --retain-sessions <N>` | Keep last N sessions |
| `devassure cleanup` | Prompt to delete all sessions |

### Utility
| Command | Description |
|---------|-------------|
| `devassure version` | Show CLI version |
| `devassure help` | Show help |

---

## Global Options

| Flag | Description |
|------|-------------|
| `--no-ui` | Disable the CLI UI and emit plain logs. **Use on all agent-invoked commands.** |
| `--verbose` | Enable verbose logging for all commands |

---

## Run Tests Options

Applies to `devassure run-tests` and `devassure run`.

| Flag | Description |
|------|-------------|
| `--path <path>` | Project path (default: current directory) |
| `--csv <path>` | Path to CSV file with test cases (supports relative paths; relative order: current directory, `.devassure`. File must exist and end with `.csv`) |
| `--tag <tags>` / `--tags` | Comma-separated tags (e.g. `--tag=smoke,regression`) |
| `--priority <values>` / `--priorities` | Comma-separated priorities (e.g. `--priority=P0,P1`) |
| `--folder <paths>` / `--folders` | Comma-separated folder paths |
| `--query <string>` / `--queries` | Search query string |
| `--filter <string>` / `--filters` | Raw filter string (overrides tag/priority/folder/query) |
| `--archive <folder>` | Archive folder path; after run, test reports are written as `devassure-results-<session-id>.zip` into this folder (relative paths resolved from current directory) |
| `--environment <env>` | Environment key from `test_data.yaml` |
| `--url <url>` | Override default test URL (`test_data.default.url`) |
| `--headless <true\|false>` | Run browser headless (omit to use project default) |
| `--workers <N>` | Number of parallel workers (positive integer) |
| `--plan-id <id\|last>` | Execute a test plan created by `devassure plan` (session UUID or `last`). Filter, CSV, and provider options are ignored when set. |
| `--skip-hooks` | Bypass hook execution in `.devassure/hooks/` |

**Filter string syntax:** `--filter="tag = tag1,tag2 && priority = P0"`
**Keyword search:** `--filter="query = dashboard"`

If `--filter` is provided, all other filter flags are ignored.

---

## Plan Command Options

`devassure plan` creates a test plan for **git code changes** without executing tests. Same branch/commit semantics as `devassure test`.

| Flag | Description |
|------|-------------|
| `--path <path>` | Project path (default: current directory) |
| `--head <branch>` | Source branch to plan against |
| `--base <branch>` | Target branch to compare against (baseline) |
| `--commit <sha>` | Commit to plan against |

On success, prints planned scenarios and follow-up commands to view or execute the plan.

```bash
devassure plan --no-ui
devassure plan --no-ui --head feature/login --base main
devassure plan --no-ui --commit abc1234567890
```

Execute a plan with `devassure run --no-ui --plan-id=last` (or a specific session UUID).

---

## Git Code Changes Options (`devassure test`)

`devassure test` is **plan + run** in one step — it runs scenarios focused on git differences (branch comparison or a specific commit), using the same test discovery as `run-tests` (YAML under the project directory).

| Flag | Description |
|------|-------------|
| `--path <path>` | Project path (default: current directory) |
| `--head <branch>` | Source branch to test against |
| `--base <branch>` | Target/baseline branch to compare against |
| `--commit <sha>` | Commit to test |
| `--archive <folder>` | Archive folder path for report zip output |
| `--environment <env>` | Environment name (e.g. staging, production) |
| `--url <url>` | Override default test URL (`test_data.default.url`) |
| `--headless <true\|false>` | Run the browser headless (omit to use project default) |
| `--workers <N>` | Number of parallel workers (positive integer) |
| `--skip-hooks` | Bypass hook execution in `.devassure/hooks/` |

Branch vs commit:
- If you pass `--head`/`--base` or `--commit`, that mode is enabled.
- If you omit all of `--head`, `--base`, and `--commit`, DevAssure uses the current branch as the source and the repository default branch as the target.

---

## Config File Formats

All files live under `.devassure/`. A minimal project setup includes:

- `app.yaml`
- `test_data.yaml`
- `personas.yaml`
- `preferences.yaml`
- `agent_instructions.yaml`
- `tests/sample.yaml`

See [@devassure/cli on npm](https://www.npmjs.com/package/@devassure/cli) for full sample contents.

### app.yaml
```yaml
description: >
  About my application
  in multi-line format
rules:
  - User can't create more than 3 projects
  - Any data deleted can't be restored
```

### test_data.yaml
```yaml
default:
  url: 'http://localhost:3000'
  users:
    default:
      user_name: 'user@test.com'
      password: 12345678
    admin:
      user_name: 'admin@test.com'
      password: 12345678
  custom_data_key: value
uat:
  url: 'http://uat.myapp.com'
  users:
    default:
      user_name: 'user@uat.com'
      password: 12345678
```
If a key is missing for a specific environment, the `default` value is used.

### personas.yaml
```yaml
normal_user:
  description: No admin access, can do all other operations
  age_group: 18-30
  gender: M
  region: USA
admin:
  description: Admin can add or delete users and manage privileges
deactivated_user:
  description: Login is deactivated by admin
```

### preferences.yaml
```yaml
browsers:
  default:
    browser: chromium   # chromium | chrome | edge
    resolution: 1920 x 1200
    headless: true
workers: 2
```

### agent_instructions.yaml
```yaml
instructions:
  - Reload the app and retry if app shows warning server is busy
  - Sign up a new user and proceed if any of the given logins are not working
```

### csv_mapping.yaml
```yaml
summary: Summary
steps: Steps
priority: Priority
tags: Tags
```

### Test Case YAML (in `.devassure/tests/`)
Example `tests/sample.yaml`:
```yaml
summary: Sample test case
steps:
  - Open the application url
  - Verify if the page loads successfully
  - Verify if there are no error messages
priority: P0
tags:
  - sanity
  - app-load
```
**Required fields:** `summary`, `steps`. **Optional:** `priority`, `tags`.

---

## Hooks

Define test hooks in `.devassure/hooks/` to run shared setup and cleanup around a run. You can add multiple YAML files (e.g. split by module).

```yaml
# .devassure/hooks/auth-hooks.yaml
before_all:
  - name: seed test user
    steps:
      - Run seed script for test user
after_all:
  - name: cleanup test data
    steps:
      - Delete test user created during run
```

Skip hooks from the CLI when needed (e.g. subsequent local runs after first execution):

```bash
devassure run --no-ui --skip-hooks
devassure test --no-ui --skip-hooks
```

Keep hooks enabled in CI runs.

---

## Actions

Actions are reusable step sequences defined in `.devassure/actions/`.

**Action file format:**
```yaml
name: login_as_admin
description: Login to the app as admin using Google
steps:
  - Open admin portal url
  - Click on Google login button
  - Enter admin email and password
  - If MFA is asked, enter the authenticator OTP
```

**Using actions in tests:** Reference by `name` as a step:
```yaml
steps:
  - login_as_admin
  - Open users list page
  - Verify if the manager user is listed
```

---

## Tools

Custom commands/scripts invoked by the agent during test execution. Configured in `.devassure/tools/index.yaml`.

### Mandatory fields per tool
| Field | Description |
|-------|-------------|
| `name` | Unique identifier |
| `description` | What the tool does |
| `exec` | Command to run. Supports `${argName}` substitution |

### Optional fields
| Field | Description |
|-------|-------------|
| `cwd` | Working directory (relative to `.devassure/tools/`, or absolute) |
| `args` | List of `{name, type, optional?}`. Types: `string`, `number`, `boolean`, `object` |
| `timeoutSec` | Max execution time in seconds |
| `output.start` / `output.end` | Stdout markers — only content between these is captured |
| `env` | List of `KEY: value` environment variables |
| `ignore_failure` | If `true`, failure doesn't fail the run |

### Top-level optional config
- **`settings`**: Defaults applied to all tools and setup steps (env is merged, other fields are fallback).
- **`setup`**: Steps run once per session before tests (e.g., `npm install`).

### Full example
```yaml
settings:
  timeoutSec: 10
  output:
    start: "__TOOL_OUTPUT_START__"
    end: "__TOOL_OUTPUT_END__"
  env:
    - BUILD_ENV: "dev"
  ignore_failure: false
setup:
  - name: "Install dependencies"
    cwd: "api-tools"
    exec: "npm install"
tools:
  - name: "getProjectDetails"
    description: "Get project details from API"
    cwd: "api-tools"
    args:
      - name: projectId
        type: string
      - name: projectName
        type: string
        optional: true
    exec: |
      npm run warmupTestingProcess
      npm run getProjectDetails ${projectId} "${projectName}"
      npm run cleanupTestingProcess
```

---

## Library Tools

Built-in tools enabled via `.devassure/library.yaml`:

```yaml
tools:
  - 'authenticator'
  - 'faker:*'
```

### faker
| Tool-key | Description |
|----------|-------------|
| `*first_name*` | Random first name |
| `*last_name*` | Random last name |
| `*full_name*` | Random full name |
| `*email*` | Random email |
| `*phone*` | Random phone number |

### authenticator
| Tool-key | Description |
|----------|-------------|
| `get_authenticator_otp` | Generate TOTP code from authenticator secret |

---

## Filtering Examples

```bash
# Plan tests for git code changes
devassure plan --no-ui
devassure plan --no-ui --head feature/login --base main
devassure plan --no-ui --commit abc1234567890

# Execute last plan
devassure run --no-ui --plan-id=last

# E2E test from git code changes (plan + run)
devassure test --no-ui
devassure test --no-ui --head feature/login --base main
devassure test --no-ui --commit abc1234567890

# By tags
devassure run --no-ui --tag=smoke,regression

# By priority
devassure run --no-ui --priority=P0,P1

# By folder
devassure run --no-ui --folder=admin/users,project/integration

# By search query
devassure run --no-ui --query="login flow"

# Combined
devassure run --no-ui --tag=smoke --priority=P0 --folder=admin/users

# Raw filter (overrides all other filters)
devassure run --no-ui --filter="tag = tag1,tag2 && priority = P0"

# Keyword search via filter
devassure run --no-ui --filter="query = dashboard"

# From CSV
devassure run --no-ui --csv=sample-tests.csv

# With archive
devassure run --no-ui --archive=./reports

# Skip hooks (when hooks exist)
devassure run --no-ui --skip-hooks
```

---

## Report Commands

```bash
# Open last session report in browser (run in background when agent invokes)
devassure open-report --no-ui --last

# Archive report to zip
devassure archive-report --no-ui --output-dir=./reports --last

# Open from archived zip
devassure open-report --no-ui --archive=./reports/devassure-results-<session-id>.zip

# JSON summary (useful for CI)
devassure summary --no-ui --last --json
# Returns: session_id, environment, scenarios, score, grouped_failures,
#          passed_validations, duration_ms, duration_string

# Session statistics
devassure stats --no-ui
```

---

## CI/CD

DevAssure provides built-in integrations for popular CI/CD platforms:

- **GitHub Actions** — [devassure-action](https://github.com/marketplace/actions/devassure-action): installs CLI, authenticates with a token, runs tests, enforces score thresholds, archives reports.
- **GitLab CI/CD** — [DevAssure CI/CD Catalog component](https://gitlab.com/explore/catalog/devassure/devassure): add DevAssure from the CI/CD catalog.
- **CircleCI** — [devassure/devassure orb](https://circleci.com/developer/orbs/orb/devassure/devassure): wraps DevAssure CLI commands for CircleCI workflows.

You can also use the CLI directly in any pipeline:

```bash
devassure add-token $DEVASSURE_TOKEN --no-ui
devassure test --no-ui --archive=./test-reports
devassure summary --no-ui --last --json
devassure cleanup --no-ui --retain-days 7
```

**Job placement:** Add the DevAssure step **after** app build, spin-up, or preview-environment deploy. Pass dynamic preview URLs with `--url`:

```bash
devassure test --no-ui --url=$PREVIEW_URL --archive=./test-reports
```

Supports proxy via `HTTP_PROXY` / `HTTPS_PROXY` environment variables.

---

## FAQ

**How to add new test cases?**
Add YAML files under `.devassure/tests/`, or use CSV with `--csv` and `csv_mapping.yaml`.

**Can I use CSV only (no YAML)?**
Yes. Use `devassure run --no-ui --csv=<path>` with `csv_mapping.yaml` to map columns.

**What are mandatory test case fields?**
`summary` and `steps`. `priority` and `tags` are optional.

**What is the difference between `plan`, `run`, and `test`?**
- `plan` — analyze git changes and generate scenarios without executing.
- `run --plan-id=last` — execute a previously created plan.
- `test` — plan + run in one command for git-scoped testing.
- `run` (without `--plan-id`) — run all or filtered tests from YAML/CSV.

**How to add a new environment?**
Add a top-level key in `test_data.yaml` and run with `--environment=<key>`.

**Supported browsers?**
Chromium (default), Chrome, Edge. Set in `preferences.yaml`.

**How to run headless?**
Set `browsers.default.headless: true` in `preferences.yaml`, or pass `--headless true|false` on `run` and `test`.

**How to check auth status?**
Run `devassure ping --no-ui`. On failure, use `devassure login --confirm --no-ui` or `devassure login`.

**CI/CD setup?**
Use official GitHub/GitLab/CircleCI integrations when available. Otherwise use `devassure add-token` for auth, then `devassure test` or `devassure run` with desired flags. Use `--archive` to save reports and `devassure summary --last --json` for machine-readable results.

**Proxy support?**
Set `HTTP_PROXY` or `HTTPS_PROXY` environment variables.

**DevAssure pricing?**
Subscription plans: https://www.devassure.io/pricing. Token-based pricing with multiple customized models selected at runtime.
