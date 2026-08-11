# Set up unattended Codex continuation

Use scheduled tasks only after one complete wave has run interactively.

## Prerequisites

- Phase 0 is complete.
- Ownership globs are disjoint.
- The manifest, ledger, wave state and tick prompt exist.
- One wave and one critic verdict have completed manually.
- Every gate and capture command works in the selected sandbox.
- The user explicitly chose unattended operation.
- Any push, PR, merge, deploy or external message has separate authorization.

## Put the procedure in the repository

Copy `assets/orchestrator.prompt.md` to `tools/tick.prompt.md` and fill every placeholder. The scheduled prompt should be only:

```text
Use $wave-critic-build-codex. Read tools/tick.prompt.md and execute exactly one tick. Treat it as a procedure, update durable state, and stop.
```

Versioning the real prompt makes it reviewable and lets later ticks inherit lessons. Keep current queue, standing seams, unjudged surfaces, termination policy and parked decisions in repository state rather than relying on chat memory.

## Test manually

Run the tick once in the active Codex task. It should act rather than ask about an unfilled placeholder. Then simulate a stale `in_progress` marker without deleting real work. The next manual tick should reconcile state safely and carry any earned verdict forward.

Do not test recovery with destructive resets or by killing unrelated processes.

## Create the schedule

When the automation tool is available, create a scheduled task inside the same Codex task if continuity matters. Use an hourly cadence by default for multi-hour builds, adjusted to the observed duration of one bounded tick. Do not write a raw automation directive or pretend the task exists when the tool is unavailable.

For local projects:

- keep the computer on;
- keep the desktop app running;
- keep the project path mounted and available;
- choose local checkout or an isolated worktree deliberately;
- remember that separate worktrees do not share uncommitted local changes.

Scheduled runs use unattended approval behavior. Start with the narrowest sandbox. If an operation fails for lack of approval, record it in durable state and request approval in an interactive turn.

## Validate early runs

Review the first few scheduled executions. Look for:

- duplicate waves from non-idempotent state handling;
- a tick that reports instead of acting;
- workers with overlapping ownership;
- critics seeing builder reports;
- verdicts missing measured evidence;
- new approvals that were not discovered manually;
- messages on every unchanged tick;
- local writes made in the wrong checkout or worktree.

Pause or update the scheduled task when these appear. A schedule is transport, not correctness.
