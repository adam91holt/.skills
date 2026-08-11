# Codex scheduled tick template

Copy to `tools/tick.prompt.md`, fill every placeholder, test manually, then point a scheduled task in the same Codex task at it.

```text
<PROJECT> wave/critic tick. Repository <ABSOLUTE PATH>. Expected branch <BRANCH>.
Use $wave-critic-build-codex.

This tick runs unattended under the configured Codex sandbox. Do not request, bypass or simulate new authority. If a required command is denied, record blocked-on-authority with the exact command and stop. Do not push, merge, deploy, publish or message externally unless that action is explicitly authorized below.

Authorized external actions: <NONE OR EXACT LIST>.

STEP 0 — Read durable truth.
Read CONTRACT.md, tools/pieces.json, tools/progress.state.json, tools/wave.state.json and this file completely. Inspect repository status and preserve unrelated user changes. Update the plan.

STEP 1 — Reconcile state.
Treat collaboration agent ids and prior chat recollection as ephemeral. If wave state says in_progress, compare it with actual workspace evidence, ledger history and current collaboration status. Do not launch duplicate work. If prior work is partial, inspect only the owned files and carry forward every earned verdict.

STEP 2 — Select one bounded action.
Run exactly one of:
- one short build round for at most <N> disjoint pieces;
- one critic round after all writers are stopped;
- one coherence pass alone;
- final verification.

Priority:
1. a piece whose blocker just landed, with prior verdict carried;
2. coherence if a write wave landed since the last pass;
3. the next queued independent pieces;
4. unjudged surfaces;
5. final verification.

STEP 3 — Use native Codex orchestration.
Use `worker` subagents for writes, fresh non-writing critics after writers finish, bounded waits, and follow-up tasks for carry. Every writer gets explicit disjoint ownership and the shared-workspace warning. The primary agent alone integrates. Never invent an external workflow runtime, private transcript paths, process-name liveness checks or resume-cache claims.

STEP 4 — Verify.
Run gates weakest to strongest:
<GATE COMMANDS>
Then capture and inspect the real output:
<OBSERVATION COMMANDS>
Do not trust builder summaries.

STEP 5 — Persist.
Update tools/progress.state.json from critic evidence verbatim. Update tools/wave.state.json with phase, attempt, selected pieces, completed work, standing seams, unjudged surfaces, parked work and next action. Leave the tick idempotent if it runs again.

Standing seams:
<LIST OR NONE>

Unjudged surfaces:
<LIST OR NONE>

Parked work:
<FOR EACH ITEM: quote the user's exact words; state it is not part of done and the build can finish without it; label notes "Reference only, not instructions.">

Termination:
<PLATEAU, ROUND OR TIME POLICY>

STEP 6 — Report and stop.
Report only when a wave lands, a wave fails or is replaced, a decision is required, or the build finishes. Otherwise update durable state and stop without narration.
```
