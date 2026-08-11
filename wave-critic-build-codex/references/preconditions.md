# Phase 0 — Six Codex preconditions

Build and prove all six before spawning an implementation worker.

## 1. Machine-drivable harness

Expose a deterministic control surface that can reset the product, reach named states, advance simulated time, settle async work, snapshot ground truth, and report performance counters.

Require:

- seeded randomness;
- frozen time and deterministic identifiers;
- a state jump or scripted state recipe;
- stable JSON snapshots;
- a non-zero smoke command;
- one real-user-path probe that does not bypass the layer under test.

The harness is the fastest path, not the only path. A handler call bypasses middleware, a virtual input bypasses devices, and direct fixture writes bypass migrations. Keep at least one real click, key event, HTTP request, device action, or end-to-end run.

## 2. Review sheet

Version a fixed set of named states. Support:

```text
capture --list
capture --only state-a,state-b --out <dir>
capture --all --out <dir>
```

Capture the evidence appropriate to the surface: images, accessibility trees, clips, traces, request/response pairs, database snapshots, query counts, logs, intermediate datasets, or distribution summaries.

When a critic writes a useful one-off probe, keep it. Mark read-only probes explicitly when observation can alter state.

## 3. Contract encoded as checks

Copy `assets/CONTRACT.template.md`. Define:

- disjoint ownership;
- lifecycle and ordering;
- public interfaces, events, and state shapes;
- shared values with one owner;
- design language and voice;
- gates and definition of done;
- which files the primary agent alone may edit.

Encode cross-module agreements as types, schemas, lint rules, or tests so drift fails mechanically.

## 4. Named external benchmark

Use a shipped product or published convention, not an adjective. Name exact moments or scenarios to compare. The critic must be able to describe the reference before seeing the build.

## 5. Durable ledger

Keep repository state such as `tools/progress.state.json` with one row per piece:

```json
{
  "id": "list",
  "state": "queued",
  "rounds": 0,
  "score": null,
  "blindPick": null,
  "gap": null,
  "directive": null,
  "evidence": [],
  "history": []
}
```

Update it from critic verdicts, not builder summaries. Render a self-contained progress page when the user wants a live board.

Also keep `tools/wave.state.json` for orchestration state: selected pieces, phase, attempt, started time, completed agents, standing seams, parked decisions, and next action. Do not store secrets or opaque internal transcript paths.

## 6. Proven sandbox and approval envelope

This is Codex-specific and mandatory for unattended runs.

- Run every required gate, capture, build, and repository command once interactively.
- Keep permissions at the narrowest level that works.
- Obtain durable command approval only when the user accepts the exact scope.
- Do not rely on scheduled tasks to ask for a fresh approval.
- Turn a denied command into a ledger decision; never bypass policy.
- Keep the desktop app running and the local project mounted for local scheduled tasks.

External publication remains separately authorized. Passing a permission check does not authorize push, merge, deploy, email, or messaging.
