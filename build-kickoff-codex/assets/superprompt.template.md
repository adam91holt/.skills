# Codex multi-agent build kickoff template

Fill every `<PLACEHOLDER>`. Keep the paragraph order. Write in the user's voice and address Codex directly.

```text
I want you to build <THE THING WITH CONCRETE NOUNS> at the level of <NAMED BENCHMARK>. It should be <TWO OR THREE QUALITY WORDS>, with every part at <BENCHMARK>-quality—from <AXIS 1> to <AXIS 2>.

Use $wave-critic-build-codex. Before any implementation subagent starts, establish Phase 0: <DETERMINISTIC HARNESS>; one command that captures <NAMED REVIEW STATES>; an architecture contract encoded as types; a live ledger and progress page; and, if this will run unattended, proof that every required command succeeds under the current Codex sandbox and permission policy. If a new approval or user decision is required, stop and record it rather than bypassing it.

Break <THE THING> into the smallest independently judgeable pieces—you decide the pieces. Assign disjoint file ownership. Use `worker` subagents for independent pieces in parallel. Every worker must be told that other agents share the workspace, that it owns only its named files, and that it must not revert, stage, commit or broadly reformat other agents' work. The primary agent alone integrates.

For each piece, wait for its builder to finish, then launch a separate critic with fresh context. Do not pass the builder's report or commit messages. The critic first writes down from memory what <BENCHMARK> does in the equivalent moment, then <DRIVES THE REAL PRODUCT> and reads <CAPTURED OUTPUT>. It compares ours against the benchmark blind, picks one, and returns: score, pass, reference, blindPick, the single biggest gap, one precise directive, and measured evidence. If ours loses, send that verdict back to the same builder with: close this gap first; do not redesign.

<TERMINATION CLAUSE>

Between waves, after every builder is done, run one whole-repo coherence worker alone. It may cross ownership boundaries to close visual, timing, tone, feedback, language, input, continuity and dead-end seams. Then launch a fresh whole-product critic. Never overlap this pass with piece builders.

Keep <LEDGER PATH> and <PROGRESS PAGE> current from the critics' actual words. <RUN-MODE CLAUSE>

Do this in <STACK> so it <RUNS WHERE>. Use Codex subagents explicitly, wait for all required results, validate the running product, and stop under the rule above.
```

## Termination clauses

### Plateau—recommended

```text
Keep improving while evidence moves. If a piece's score changes by less than 0.5 across two rounds, do not buy another round; escalate it to me with the critic's gap verbatim. If the directive requires files outside the piece, create a new piece, widen ownership deliberately, or send it to coherence.
```

### Round budget

```text
Give each piece at most <N> builder/critic rounds. If it has not passed, stop at its honest score and record the gap verbatim.
```

### Time budget

```text
Run until <DATE/TIME WITH TIMEZONE>. Then stop, leave the workspace coherent, and report every piece, score and open gap. Do not publish or merge unless I separately authorized it.
```

### Wowed or nothing

```text
Continue until I explicitly stop the task or every critic genuinely prefers ours to <BENCHMARK>. This has no guaranteed natural endpoint.
```

## Run-mode clauses

### One wave

```text
Run one wave, update the ledger, report the evidence, and wait for me.
```

### Supervised

```text
Continue wave by wave in this Codex task. Give me concise commentary at meaningful boundaries and ask only when a decision changes scope or authority.
```

### Unattended

```text
First run and land one wave manually. Then, when Codex automation tools are available, create a scheduled task inside this same Codex task that reads tools/tick.prompt.md and performs one idempotent tick per wake. Keep the computer on, the desktop app running, and the project available. Persist all state in repository files; do not depend on subagent ids or private transcripts surviving between wakes. Report only when a wave lands, a wave fails or is restarted, a decision is required, or the build finishes.
```
