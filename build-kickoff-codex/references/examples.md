# Worked Codex kickoff prompts

## Web application benchmarked against Linear

Interview answers: Linear; unattended; plateau rule; Next.js and Postgres.

```text
I want you to build an issue tracker—list, detail, filters, search, keyboard-first command palette, and every empty, loading, permission and error state—at the level of Linear. It should be fast, quiet and precise, from list density to keyboard flow to slow-network behavior.

Use $wave-critic-build-codex. Before any feature worker starts, establish Phase 0: seeded fixtures, frozen time and deterministic ids; a harness that can jump to every state; one command that captures the review sheet; an architecture contract encoded as types; a truthful ledger and rendered progress page; and proof that every unattended command succeeds under the current Codex sandbox. If a required action needs approval, stop and record the decision instead of bypassing it.

Break the product into the smallest independently judgeable pieces—you decide the pieces. Give each a disjoint file set. Use worker subagents for independent pieces in parallel. Every worker prompt must say that other agents share the workspace, that it may edit only its files, and that it must not revert, stage or commit anyone else's work. The primary agent alone integrates.

For each piece, wait for the builder to finish, then launch a new critic with fresh context. Do not give that critic the builder's report or commit messages. The critic first writes down from memory what Linear does in the equivalent moment, then drives the real UI with real clicks and key events, reads the screenshots and accessibility output, and performs a blind A/B. It returns exact JSON: score, pass, reference, blindPick, biggestGap, directive and measured evidence. If ours loses, send only that verdict back to the same builder: close the gap first; do not redesign.

Stop rerunning a piece when its score moves less than 0.5 across two rounds. Escalate it with the gap verbatim. Between waves, after all builders are done, run one whole-repo coherence worker alone to find and close visual, timing, language, input, continuity and dead-end seams; then use a new whole-product critic.

Keep tools/progress.state.json and a self-contained progress page current. Run one complete wave manually first. Only after it lands cleanly, create a scheduled task in this same Codex task to execute one idempotent tick per hour from tools/tick.prompt.md. Keep all continuity in repository files and report only a landed wave, a failed/restarted wave, a decision, or completion.
```

## API benchmarked against Stripe

The same structure applies, but the observable product is named request scenarios over real HTTP. Replace screenshots with request/response captures, query counts, logs, timings, and database snapshots. Keep unhappy paths, security, idempotency, and backwards compatibility as explicit critic lenses.

## What stays fixed

Keep the named benchmark, delegated judgeable decomposition, disjoint ownership, fresh critic, real observation, memory-first comparison, one measured gap, carry, coherence, ledger, permission envelope, and termination rule.

Change only the nouns, benchmark, observation commands, quality axes, stack, and run mode.
