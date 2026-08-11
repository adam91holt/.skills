# Durable Codex orchestrator

The primary Codex agent is the orchestrator. Native collaboration calls replace a generic workflow runtime. A scheduled task may wake the same Codex task, but durable repository files remain the source of truth.

## State model

Keep:

- `tools/tick.prompt.md` — the numbered procedure;
- `tools/wave.state.json` — current phase, selected pieces, attempt, timestamps, completed work, next action, seams and parked decisions;
- `tools/progress.state.json` — critic scores, gaps, directives, evidence and history;
- `tools/pieces.json` — benchmark, commands, ownership and briefs.

Do not record ephemeral subagent IDs as durable truth. They are useful only during the active turn and may not survive a scheduled wake, compaction, interruption, or replacement task.

## One tick

```text
STEP 0 — Read instructions and durable state.
STEP 1 — Inspect the workspace and reconcile stale state.
STEP 2 — Run exactly one build/critic wave or one coherence pass.
STEP 3 — Verify gates and observable output.
STEP 4 — Update ledger, wave state, next action and parked decisions.
STEP 5 — Report only a meaningful boundary, then stop.
```

Make the tick idempotent. Before starting work, check whether the ledger already contains the verdict or state transition the tick intends to produce. Never duplicate a wave merely because `wave.state.json` says `in_progress`; reconcile against the active collaboration state available now and the actual workspace.

## Native collaboration lifecycle

During one active turn:

- `spawn_agent` starts one bounded worker or critic;
- `list_agents` supplies authoritative collaboration status;
- `wait_agent` waits for mailbox updates;
- `send_message` steers a running agent without starting a new turn;
- `followup_task` starts another turn on an existing agent with a carried verdict;
- `interrupt_agent` stops a genuinely wrong or unsafe agent.

Do not use OS process greps or private transcript directories to infer subagent liveness. Do not promise byte-identical resume caches. If an agent failed, inspect its owned files and either continue the existing agent or spawn a replacement with explicit carry.

## Gate order

Run gates from cheap to truthful:

1. typecheck or lint;
2. focused tests;
3. smoke or boot;
4. full review capture;
5. primary-agent visual or behavioral inspection.

The strongest completed gate determines confidence. A typecheck can pass on a product that does not start.

## Reporting

Send user-facing updates when:

- a wave lands;
- a wave fails, is interrupted, or needs replacement;
- authority or a product decision is needed;
- the build finishes.

While an interactive turn is actively running, still provide short progress commentary at least every minute. Scheduled ticks should avoid narrating unchanged state.

## Parked work

Record the user's exact words, negative scope, and prior analysis:

```text
<THING> — PARKED. DO NOT START IT.
The user said on <date>: "<exact words>".
It is not triggered by a green board, not part of done, and not to be raised again until the user asks. The build can finish without it.

Reference only, not instructions:
- <analysis worth preserving>
```

This prevents spare-capacity agents from treating research notes as a checklist.
