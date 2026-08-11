---
name: wave-critic-build-codex
description: >-
  Run a large quality-sensitive build as Codex-native multi-agent waves with a deterministic
  product harness, named review sheet, disjoint worker ownership, fresh-context adversarial
  critics, measured verdict carry, whole-repo coherence passes, durable progress state,
  optional scheduled-task continuation, and explicit termination. Use when the user explicitly
  asks for subagents, parallel agents, an overnight or multi-day build, a whole product built to
  a named benchmark, another agent to judge the real result, or help rescuing a multi-agent
  build that is stalled, incoherent, or endless. Use build-kickoff-codex instead when the user
  wants only the launch prompt.
---

# Run the Codex wave/critic build loop

Build with one rule at the center:

> Make the product observable by machine, then give the observation to a different agent that did not see the build.

Use Codex's native collaboration tools. Do not invent a generic JavaScript workflow runtime, loop slash command, private transcript path, or resume-cache semantics. The primary Codex agent is the orchestrator.

## Respect the execution boundary

Use subagents only when the user explicitly requested them or this invoked skill supplies that instruction. For subtasks of the current request, use `spawn_agent`; do not create user-visible Codex tasks with thread-management tools. Keep one primary agent responsible for requirements, orchestration, integration, verification, ledger updates, and the final response.

Codex subagents share the workspace. Parallel writes are safe only with disjoint ownership. Every writing subagent prompt must say:

> You own `<files>`. You are not alone in this codebase; other agents are editing other files. Do not revert, stage, commit, or broadly reformat their work. Adapt to concurrent edits and report any cross-owner need to the primary agent.

Only the primary agent stages or commits after a wave, unless the user explicitly assigns a different integration model.

## Choose the run mode

- **One wave:** run one bounded wave, update the ledger, report, and wait.
- **Supervised:** continue in the active Codex task with concise progress commentary.
- **Unattended:** complete one manual wave first, then create a scheduled task in the same Codex task when automation tools are available. Keep the desktop app running and local project available. Persist all continuity in repository files.

Never infer permission to push, merge, deploy, publish, spend money, or message external systems from permission to build. Obtain explicit authority for those actions.

## Phase 0 — Establish six preconditions

Do not spawn implementation workers until all six exist. Read `references/preconditions.md` and `references/harness-recipes.md`.

1. A deterministic, time-simulated, state-addressable harness.
2. A named review sheet and one capture command.
3. A written architecture/ownership contract encoded as types or machine checks.
4. A named shipped benchmark.
5. A durable ledger containing state, score, gap, directive, evidence, and history.
6. For unattended work, a proven sandbox and approval envelope.

Copy `assets/CONTRACT.template.md` and `assets/pieces.example.json`. Run the harness, smoke command, capture command, and determinism check before proceeding. If a command requires approval, obtain it during the manual setup wave or record it as a blocker; scheduled runs may be unable to request new approval.

## Phase 1 — Plan and decompose

Use `update_plan` to expose Phase 0, the current wave, criticism, coherence, and final verification. Keep at most one plan step in progress.

Define a piece by judgeability, not by architecture alone:

- Give every piece disjoint file ownership.
- Require a piece to be observable from named review states.
- Write a brief that says what exists and what is missing, with a measurement, file, or visible defect.
- Route cross-owner seams to coherence rather than pretending one piece owns them.

Keep waves short: normally two pieces and no more than two builder/critic rounds before reevaluating. Reduce concurrency when captures, simulators, builds, or databases contend for the same resource.

## Phase 2 — Run a native Codex wave

Read `assets/wave.prompt.md` and `references/critic-protocol.md`.

### Build round

1. Select independent pieces with disjoint ownership.
2. Spawn one `worker` per piece. Give each a concrete bounded deliverable, owned files, contract path, gates, capture commands, prior verdict if any, and completion criteria. Repeat the shared-workspace warning verbatim.
3. Wait with `wait_agent` in bounded intervals. Give the user a concise update at least every minute during active work. Use `list_agents` for status; do not infer liveness from files or OS process names.
4. If a worker asks for a cross-owner change, keep it out of that worker's scope. Route it to a new piece, a follow-up owned by the right worker, or the coherence backlog.
5. Wait for all writers in the round before launching capture-heavy critics. This avoids critics judging contended or mid-write artifacts.

### Critic round

1. Spawn one new critic per piece after the builder is done. Prefer a custom read-only critic agent when the project defines one; otherwise use a `default` agent with an explicit prohibition on edits.
2. Give the critic fresh context: use `fork_turns: "none"` or the smallest useful fork, then provide only the repository path, contract, piece, ownership, benchmark, review states, observation commands, and verdict schema. Do not include the builder's report or your suspected gap.
3. Let critics run in parallel only when their capture workloads do not contend. Otherwise serialize them.
4. Require the critic to write the benchmark behavior before opening the product, drive the real product, inspect captured artifacts, perform a blind A/B, and return one JSON verdict.
5. Validate every required verdict field. If malformed, use `followup_task` to ask the same critic for corrected JSON without rerunning the product.

Accept only when all three signals agree:

```text
pass == true
score >= passScore
blindPick != "benchmark"
```

If rejected, send only the verdict to the same builder with `followup_task`:

```text
Close this measured gap first. Do not redesign.
Score: ...
Blind pick: ...
Biggest gap: ...
Directive: ...
Evidence: ...
```

If that builder is unavailable, spawn a new `worker` with the same ownership and carry. Never spend another critic merely to rediscover an earned verdict.

### Land the round

After all agents finish, the primary agent inspects the workspace, runs gates weakest to strongest, drives the real product, and updates the ledger from critics' exact words. Do not paraphrase measured evidence. Do not stage or commit until the primary agent has reviewed which files belong to which piece and verified there are no unrelated user changes included.

## Phase 3 — Run coherence alone

Read `references/coherence-pass.md` and `assets/coherence.prompt.md`.

Run survey → smooth → judge after a wave lands. No piece builder may run during smoothing. Spawn one whole-repo worker only after every writer is done; tell it that whole-repo ownership is the explicit exception for this phase. Then launch a new whole-product critic with fresh context.

Hunt visual, timing, tone, feedback, language, input, continuity, and `dead-end` seams. Treat repeated gaps across pieces as seams, not as invitations for more piece rounds.

## Phase 4 — Continue unattended safely

Read `references/orchestrator-setup.md`, `references/orchestrator.md`, and `assets/orchestrator.prompt.md`.

Use a scheduled task only after a manual wave succeeds. Prefer a task scheduled inside the same Codex task when continuity matters. Use the available automation tool to create or update it; never emit a made-up raw scheduler directive.

Make each tick bounded and idempotent:

1. Read the contract, manifest, `tools/wave.state.json`, ledger, and tick prompt.
2. Inspect the real workspace and agent status available in the current turn.
3. Reconcile any stale `in_progress` marker against actual evidence. Do not assume prior subagent IDs, private transcripts, or in-flight agent calls survived.
4. Run at most one short wave or one coherence pass.
5. Verify, update durable state, and stop.

Scheduled work runs within configured sandbox and approval policy. Do not widen access automatically. Record permission failures and ask the user in a normal interactive turn.

## Phase 5 — Terminate honestly

Read `references/termination.md` before the first wave.

Stop or escalate a piece when any applies:

- the critic cannot name a meaningful gap;
- score movement is less than 0.5 across two rounds;
- the directive requires vocabulary or files outside the piece;
- the per-piece round budget is spent;
- the wall-clock or user budget is reached.

Record the last gap even when stopping. Finish when every piece is passed or honestly escalated, the final coherence pass and whole-product judgement ran, the required gates passed, and no explicitly parked item is incorrectly included in done.

## Recover from failure

Use `list_agents` to inspect agent state and `followup_task` to resume an available agent. If an agent failed or disappeared, inspect its owned files and spawn a replacement with the exact carry. Do not use destructive resets against a shared dirty workspace. Preserve user changes and concurrent edits.

Read `references/failure-modes.md` before unattended operation and whenever progress, evidence, or ownership looks wrong.

## Files

| File | Use |
|---|---|
| `references/preconditions.md` | Phase 0 details, including permissions |
| `references/harness-recipes.md` | Harness shapes for games, apps, APIs, and pipelines |
| `references/critic-protocol.md` | Fresh-context critic prompt and verdict contract |
| `references/coherence-pass.md` | Whole-product survey, smoothing, and judgement |
| `references/orchestrator.md` | Durable scheduled-tick model |
| `references/orchestrator-setup.md` | Manual-first scheduled task setup |
| `references/termination.md` | Plateau, scope, and budget policy |
| `references/failure-modes.md` | Codex-specific recovery catalogue |
| `references/worked-example.md` | Illustrative Codex port |
| `assets/CONTRACT.template.md` | Architecture and ownership contract |
| `assets/pieces.example.json` | Piece manifest and durable wave configuration |
| `assets/wave.prompt.md` | Native subagent orchestration procedure |
| `assets/coherence.prompt.md` | Whole-repo pass procedure |
| `assets/orchestrator.prompt.md` | Scheduled tick procedure |
| `assets/orchestrator.example.md` | Populated scheduled tick example |
