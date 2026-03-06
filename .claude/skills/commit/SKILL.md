---
name: commit
description: Create a well-formatted git commit with conventional commit messages
user-invocable: true
disable-model-invocation: true
---

# Commit Skill

Create a git commit for the current staged/unstaged changes.

## Instructions

1. Run `git status` and `git diff --staged` (and `git diff` if nothing is staged) to understand the changes.
2. Run `git log --oneline -5` to see recent commit style.
3. Analyze the changes and determine the commit type:
   - `feat:` — new feature
   - `fix:` — bug fix
   - `refactor:` — code restructuring without behavior change
   - `style:` — formatting, CSS, visual changes
   - `docs:` — documentation only
   - `chore:` — build, config, dependencies
   - `perf:` — performance improvement
4. Draft a concise commit message (1 line, under 72 chars) that focuses on **why**, not **what**.
5. If nothing is staged, stage the relevant changed files (avoid staging `.env`, credentials, or lock files).
6. Show the user the proposed commit message and ask for confirmation before committing.
7. Commit with the approved message.

## Rules

- Never force push
- Never amend previous commits unless explicitly asked
- Never stage `.env`, credentials, or `package-lock.json`
- Always ask for confirmation before committing
- Add `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` to the commit message
