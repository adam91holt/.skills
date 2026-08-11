# Codex native build-wave procedure

Fill every placeholder and execute as the primary Codex agent. This is a procedure, not a JavaScript workflow.

```text
Use $wave-critic-build-codex in <REPO>.

Read <CONTRACT>, <MANIFEST>, <LEDGER> and <WAVE_STATE> completely. Update the task plan. Confirm Phase 0 and the termination rule before spawning implementation agents.

WAVE: <PIECE IDS>
ROUND: <N>

STEP 1 — Validate the wave.
- Confirm every selected piece exists and its ownership is disjoint from every other active writer.
- Confirm the review states and commands exist.
- Confirm no whole-repo coherence worker is active.
- Mark the wave state as building.

STEP 2 — Spawn builders.
Spawn one `worker` per piece. Give each:
- repository and contract paths;
- exact owned files;
- current brief and carry;
- gates and piece capture commands;
- completion criteria;
- this exact warning: "You are not alone in this codebase; other agents are editing other files. Do not revert, stage, commit, or broadly reformat their work. Adapt to concurrent edits and report cross-owner needs to the primary agent."

Do not ask workers to integrate or commit. Wait for all writers. Use collaboration status tools, not OS process greps. Give concise progress commentary while waiting.

STEP 3 — Inspect builder completion.
For each piece, verify the worker stayed within ownership and reported its changed files and gates. Route cross-owner needs to the backlog. Do not fix them silently inside the wrong piece.

STEP 4 — Spawn critics only after writers stop.
Launch a new non-writing critic per piece with fresh or minimal inherited context. Do not pass builder reports or commit messages. Provide only repo, contract, piece, ownership, benchmark, review states, observation commands, pass score and verdict schema. Serialize capture-heavy critics if resources contend.

STEP 5 — Validate verdicts.
Require exact JSON fields: score, pass, reference, blindPick, biggestGap, directive, evidence. Ask the same critic to correct malformed JSON without rerunning observation.

Accept only if pass is true, score >= <PASS_SCORE>, and blindPick is not benchmark.

STEP 6 — Carry or close.
For a rejection, send the verdict to the same builder with `followup_task`: "Close this measured gap first. Do not redesign. Stay inside ownership." If the builder is unavailable, spawn a replacement worker with the same ownership and carry.

Apply the termination rule after every verdict. Mark pass, plateaued, scope-decision, budget-exhausted or blocked-on-authority honestly.

STEP 7 — Land the wave.
After all agents stop, inspect the workspace and user changes. Run gates weakest to strongest, capture the real product, and inspect the output. Update ledger and wave state from critics' exact evidence. The primary agent alone stages or commits, and only when authorized.

STEP 8 — Route the next action.
If pieces merged, schedule coherence before another overlapping write wave. Otherwise select the next independent pieces. Report only the landed wave, failure/replacement, required decision, or completion.
```

## Builder prompt body

```text
You are the worker for <PIECE> in <REPO>.
You own only: <FILES>.
You are not alone in this codebase; other agents are editing other files. Do not revert, stage, commit, or broadly reformat their work. Adapt to concurrent edits and report cross-owner needs to the primary agent.

Read <CONTRACT> completely, then <TYPES> if present.
Current product state: <STATE>
Brief: <BRIEF>
Prior verdict: <CARRY OR NONE>

Close the prior measured gap first; do not redesign. Implement only inside ownership. Run <GATES> and capture <REVIEW STATES> into <DIR>. Inspect the real output.

Return: changed files, verification evidence, cross-owner needs, and anything not completed. Do not stage or commit.
```
