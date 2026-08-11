# Populated Codex tick example

This is illustrative.

```text
ATLAS wave/critic tick. Repository /workspace/atlas. Expected branch codex/atlas-issue-view.
Use $wave-critic-build-codex.

This tick runs unattended under workspace-write. Do not bypass new authority. Record blocked-on-authority and stop if a required command is denied.

Authorized external actions: none. Do not push, merge, deploy, publish or message externally.

STEP 0 — Read durable truth.
Read CONTRACT.md, tools/pieces.json, tools/progress.state.json, tools/wave.state.json and tools/tick.prompt.md. Inspect repository status and preserve unrelated user changes.

STEP 1 — Reconcile state.
wave.state.json says the search critic is pending. Ledger shows the search builder completed round 2 but has no verdict. Do not rebuild search. Confirm no writer is active, then launch a fresh search critic. Do not depend on the prior builder's agent id.

STEP 2 — Select one bounded action.
Today: one critic round for search. If the verdict is valid, persist it and stop. Do not also start keyboard or coherence in this tick.

STEP 3 — Critic.
Launch a new non-writing critic with fresh context. Give it Linear as benchmark; search ownership and review states; the seeded four-corpus query scenarios; capture and timing commands; pass score 8.5; and the standard verdict schema. Do not give it the builder report.

STEP 4 — Verify.
npm run typecheck
npm test
npm run smoke
node tools/capture.mjs --only search-empty,search-dense,search-keyboard --out artifacts/search-r2
node tools/trace.mjs --scenario search-four-corpora
Inspect the artifacts and accessibility output.

STEP 5 — Persist.
Update progress and wave state with the critic's exact JSON. Next priority after search is coherence because list and keyboard writes landed since the last coherence pass.

Standing seams:
- focus ring differs across list, detail and modal;
- optimistic rollback is silent in two mutation paths;
- archived and closed are used interchangeably but are distinct states.

Unjudged surfaces:
- phone touch flow against Linear iOS;
- screen-reader issue creation;
- cold start with expired session.

RENAME TO BEACON — PARKED. DO NOT START.
The user said on 2026-05-14: "Park the rename until I ask for it." It is not triggered by a green board, not part of done, and not to be raised. The build can finish without it.
Reference only, not instructions:
- preserve benchmark mentions of Linear;
- distinguish product name, database cluster and filesystem paths;
- ask about repository and CLI naming only after the user reopens this work.

Termination:
Plateau below 0.5 score movement across two rounds. Otherwise at most three rounds per piece. Record every escalated gap.

STEP 6 — Report and stop.
Only report a valid search verdict, failed/replacement wave, decision or completion. Otherwise persist state and stop.
```
