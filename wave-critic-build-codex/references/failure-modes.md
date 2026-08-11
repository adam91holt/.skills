# Codex failure modes

## Parallel writing

### One worker reverts another worker's edits

**Cause:** ownership was vague or the worker treated shared changes as dirt.

**Fix:** use disjoint globs and repeat the shared-workspace warning. Only the primary agent integrates. Never use destructive resets in a shared dirty workspace.

### A commit contains another worker's unfinished files

**Cause:** a subagent staged or committed from the shared checkout.

**Fix:** prohibit staging and commits in worker prompts. The primary agent reviews paths and integrates after every writer stops.

### A whole-repo pass edits files under active builders

**Cause:** coherence overlapped a wave.

**Fix:** inspect `list_agents`, wait for every writer, then run one smoother alone.

## Criticism

### Every verdict is roughly 8/10 with praise

**Cause:** missing calibration.

**Fix:** state that seven is competent, the benchmark wins by default, and any meaningful gap means fail.

### The critic praises something not present

**Cause:** it saw the builder's report or inherited too much context.

**Fix:** launch a new critic after the builder, use minimal context inheritance, and forbid reports and commit messages.

### Evidence is prose without measurements

**Cause:** the review sheet cannot observe the property.

**Fix:** add or retain a probe. A verdict that cannot become an acceptance test is not ready to carry.

### The critic returns malformed JSON

**Cause:** collaboration results are not schema-enforced automatically.

**Fix:** validate in the primary agent and use `followup_task` for corrected JSON only. Do not rerun the capture.

### The critic judges contended or half-written output

**Cause:** critics ran while writers or heavy captures were active.

**Fix:** wait for the write round, then limit critic concurrency to available resources.

## Durable continuation

### A scheduled tick launches duplicate work

**Cause:** `in_progress` was trusted without reconciliation or the tick was not idempotent.

**Fix:** check ledger history, actual workspace state, and current collaboration status before launching. Execute one bounded phase per tick.

### A tick tries to resume an agent that no longer exists

**Cause:** ephemeral agent IDs were stored as durable truth.

**Fix:** persist piece, ownership, carry and evidence—not agent identity. Continue an available agent when possible; otherwise spawn a replacement.

### Unattended work stops on approval

**Cause:** Phase 0 did not exercise the real commands in the scheduled sandbox.

**Fix:** prove commands manually, use narrow durable approvals only with consent, and turn remaining denials into visible decisions.

### Work happens in the wrong worktree

**Cause:** the scheduled task's project mode was not chosen explicitly.

**Fix:** record the absolute project path and expected branch in the tick prompt. Remember that isolated worktrees do not see uncommitted changes in the main checkout.

## Product coherence and termination

### Several critics report the same gap and none closes it

**Cause:** the defect is a seam between owners.

**Fix:** route it to coherence.

### A system exists but nothing reaches it

**Cause:** piece critics judged local quality, not integration.

**Fix:** make the coherence survey hunt `dead-end` explicitly.

### The loop never ends

**Cause:** no plateau, budget, or scope rule.

**Fix:** apply `termination.md` and keep the gap honest.

### Parked work is started anyway

**Cause:** notes were stored as an unlabeled checklist.

**Fix:** quote the user, state negative scope, say the build can finish without it, and label notes as reference only.

## User trust

### The user stops reading updates

**Cause:** every wait or scheduled tick produced narration.

**Fix:** interactive commentary at meaningful intervals; scheduled reports only for a landed wave, failed/replaced wave, decision, or completion.
