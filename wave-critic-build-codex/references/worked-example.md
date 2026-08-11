# Illustrative Codex port — issue tracker against Linear

This example demonstrates the Codex harness mapping. It is illustrative, not a claim about a recorded Codex run.

## Phase 0

| Preconditions | Implementation |
|---|---|
| Harness | seeded database, frozen clock and IDs, `goto(state)`, `flush()`, stable snapshot |
| Review sheet | list/detail/search/settings multiplied by empty/loading/error/dense/mobile/dark |
| Contract | `CONTRACT.md` plus TypeScript domain and event types |
| Benchmark | Linear's web issue workflow |
| Ledger | `tools/progress.state.json` rendered to `progress.html` |
| Permission envelope | typecheck, smoke, browser capture and local writes proven interactively |

## Pieces

`list`, `detail`, `search`, `keyboard`, `filters`, `empty-states`, `copy`, `performance`, and `coherence`.

Each worker receives a disjoint file set and the shared-workspace warning. The primary agent spawns two workers, waits for both, then launches fresh critics after all writers stop.

## Example verdict

```json
{
  "score": 6.5,
  "pass": false,
  "reference": "Linear keeps the command palette responsive while filtering a dense workspace and preserves the selected row when it closes.",
  "blindPick": "benchmark",
  "biggestGap": "The palette takes 340 ms p95 to show the first result on the 5,000-item fixture, versus the 100 ms interaction budget, and focus returns to the page root instead of the selected row.",
  "directive": "Move ranking off the interaction path and restore focus to the invoking row; prove p95 below 100 ms across 20 runs and a focus snapshot after close.",
  "evidence": [
    "20-run palette trace: p95 340 ms, median 286 ms",
    "accessibility snapshot after close: document body focused"
  ]
}
```

The primary agent validates the object and sends it to the original keyboard worker with `followup_task`: close that gap first; do not redesign.

## Coherence find

Three pieces use different terms—archived, closed, and resolved—for two distinct states. Several mutation paths silently roll back without feedback. The survey marks both as cross-piece seams. One whole-repo worker runs alone, centralizes the state labels and feedback pattern, removes duplicate literals, runs gates, and exits. A new critic then judges the whole workflow without seeing the smoother's report.

## Scheduled continuation

After the manual wave succeeds, the task creates an hourly scheduled continuation in the same Codex task. Each wake reads `tools/tick.prompt.md`, `tools/wave.state.json`, `tools/progress.state.json`, and `tools/pieces.json`; runs one short wave or coherence pass; updates state; and stops. It never assumes a prior subagent ID is still valid.

## Honest endpoint

Suppose search moves 6.0 → 6.2 across two rounds and the remaining gap requires a new indexing vocabulary outside its ownership. The orchestrator marks `scope-decision`, records the verdict, and asks whether to create a new indexing piece. It does not spend a third search round pretending local tuning can add the missing capability.
