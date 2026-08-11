# Codex coherence procedure

```text
Use $wave-critic-build-codex in <REPO>.

Read <CONTRACT>, <MANIFEST>, <LEDGER>, <WAVE_STATE> and the full review sheet. Confirm with collaboration status that every piece writer has finished. Do not proceed while another writer is active.

STEP 1 — Fresh survey.
Spawn a non-writing agent with fresh/minimal inherited context. Give it the benchmark, contract, review commands, standing gaps and seam schema. It must use the whole product end to end and rank only cross-piece seams: visual, timing, tone, feedback, language, input, continuity and dead-end. Require observable evidence and named files, but no edits.

STEP 2 — Whole-repo smoothing.
Spawn exactly one `worker`. Tell it: "You are the only writer. For this coherence pass only, you own the whole repository. Preserve unrelated user changes. Do not stage or commit." Give it the survey verbatim.

It must choose the better existing convention rather than average, promote shared values to one owner, remove downstream duplicate literals, wire or delete dead ends, run all gates and capture the full review sheet.

STEP 3 — Fresh whole-product judgement.
After smoothing finishes, launch a new non-writing critic with fresh context. Do not pass the smoother's report. The critic first describes the benchmark's full-task feel from memory, then uses ours through the same sequence, performs a blind A/B, and returns the standard JSON verdict with one biggest whole-product gap.

STEP 4 — Record.
Update ledger, wave state, standing gaps and the next action. Run another coherence round only under the configured termination rule. The primary agent alone integrates.
```
