---
description: Create a feature spec file and branch for this project
argument-hint: "Step number (optional) and feature name — e.g. '3 refresh token rotation' or 'rate limiting'"
allowed-tools: Read, Write, Glob, Bash(git checkout:*), Bash(git pull:*), Bash(git branch:*), Bash(git status:*)
---

You are a senior developer preparing a new feature for implementation.
Always follow the conventions in CLAUDE.md before writing anything.

User input: $ARGUMENTS

---

## Step 1 — Guard: working directory must be clean

Run `git status`. If there are any uncommitted, unstaged, or untracked
files, stop immediately and tell the user:

> "Please commit or stash your changes before running /create-spec."

DO NOT continue past this step until the working directory is clean.

---

## Step 2 — Parse arguments

From $ARGUMENTS extract:

1. `step_number` (optional)
   - If a leading number is present, zero-pad to 2 digits: 2 → 02, 11 → 11
   - If absent, omit from the filename entirely

2. `feature_title`
   - Short, human-readable, Title Case
   - Example: "Refresh Token Rotation"

3. `feature_slug`
   - Lowercase kebab-case, only `a-z 0-9 -`
   - Replace spaces and punctuation with `-`
   - Collapse consecutive `-` into one
   - Trim `-` from both ends
   - Max 40 characters

4. `branch_name`
   - Format: `claude/feature/<feature_slug>`

If you cannot confidently infer all of the above, ask the user to
clarify before proceeding. Do not guess.

---

## Step 3 — Check branch name availability

Run `git branch` to list all local branches.
If `branch_name` is taken, append an incrementing suffix until free:
`claude/feature/rate-limiting-01`, `-02`, etc.

---

## Step 4 — Update main and create the feature branch

Run in order:
`git checkout main`
`git pull origin main`
`git checkout -b <branch_name>`

If any command fails, stop and report the error to the user.

---

## Step 5 — Research the codebase

Read ALL of these before writing a single line of the spec:

- `CLAUDE.md` — architecture, conventions, project structure
- `src/app.ts` — existing middleware stack and mounted routers
- `src/modules/` — all existing module folders
- `src/shared/` — shared infrastructure already in place
- `specs/` — all existing specs (avoid duplicating scope)
- `specs/template.md` — the spec template you MUST follow exactly

If the requested feature overlaps with anything already specced or
built, warn the user and stop.

---

## Step 6 — Draft the spec

Using the structure from `specs/template.md` exactly — no added
sections, no removed sections — fill in each section for this feature.

Do not add technical implementation details such as code examples.

---

## Step 7 — Save the spec

Determine the filename:

- With step number: `specs/<step_number>-<feature_slug>.md`
- Without step number: `specs/<feature_slug>.md`

Save the spec to that path.

---

## Step 8 — Report to the user

Print this summary and nothing else:
Branch: `<branch_name>`
Spec file: `specs/<filename>`
Title: `<feature_title>`

Then say:

> "Review the spec, make any edits, then enter Plan Mode
> (Shift+Tab twice in Claude Code) to begin implementation."

Do not print the full spec in chat unless the user explicitly asks.
