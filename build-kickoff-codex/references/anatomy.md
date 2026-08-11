# Anatomy of a Codex kickoff prompt

Use this reference before cutting clauses from the template.

## Clause map

| Clause | Codex mechanism | Why it exists |
|---|---|---|
| "at the level of `<benchmark>`" | external reference | Prevents every critic from inventing its own standard |
| "you decide the smallest independently judgeable pieces" | primary-agent decomposition | Avoids pieces that are really cross-owner seams |
| "use `worker` subagents; one owner per disjoint file set" | `spawn_agent` with explicit ownership | Makes parallel writes survivable in Codex's shared workspace |
| "you are not alone; do not revert or stage others' work" | worker coordination rule | Prevents agents from treating concurrent edits as dirt to clean up |
| "wait for builders, then launch new critics with fresh context" | `wait_agent`, then `spawn_agent` with minimal or no inherited turns | Keeps builders from grading their own work or anchoring critics |
| "judge the running product and captures" | browser, simulator, test client, screenshots, traces | Replaces imagined behavior with evidence |
| "never the builder's summary" | context isolation | Removes the most persuasive and least reliable artifact |
| "write the benchmark from memory before opening ours" | critic prompt order | Prevents anchoring the reference downward |
| "blind A/B; pick one" | forced choice | Gives a signal that does not drift upward as easily as scores |
| "one measured gap and one directive" | verdict contract | Produces a next-round acceptance test |
| "send the verdict back to the same builder" | `followup_task` | Carries earned information without rebuilding context |
| "coherence pass runs alone" | serial whole-repo worker | Lets one owner close cross-piece seams without racing builders |
| "only the primary agent integrates" | primary-agent responsibility | Prevents commits or staging from accidentally collecting another worker's files |
| "ledger and progress page" | durable repository state | Survives compaction, scheduled wakes, and task restarts |
| "scheduled task in this same task" | Codex automation | Supports unattended heartbeats with conversational continuity |
| explicit termination | primary-agent gate | Turns an improvement asymptote into a project |

## Codex-specific rules

### Shared workspace

Codex subagents in a local collaboration share the same filesystem. Parallel writers therefore need disjoint ownership. Each worker prompt must say what it owns, that other agents are editing concurrently, and that it must not revert, stage, commit, or reformat files outside that ownership.

### Fresh critics

Create the critic after its builder finishes. Give it only the repository path, contract, benchmark, piece, capture commands, and verdict schema. Do not pass the builder's report. When available, use `fork_turns: "none"` or the smallest useful context fork.

### No generic workflow runtime

Do not rely on an external JavaScript workflow runtime. The primary Codex agent is the orchestrator. It spawns bounded agents, waits for results, validates verdicts, sends follow-up work, and records state in the repository.

### Scheduled runs

A scheduled task is a heartbeat, not a hidden agent process supervisor. Make every tick reconstruct its state from versioned files. Do not depend on agent IDs, private transcript directories, resume caches, or process names surviving between ticks.

### Approvals

Unattended runs use the configured sandbox and may be unable to obtain new approvals. Prove the commands during the manual wave, use the narrowest sufficient permissions, and turn a denied action into a visible decision in the ledger.

## The non-terminating clause

"Keep going until every critic is wowed" is an asymptote against a shipped benchmark. Prefer one of:

- plateau: less than 0.5 score movement across two rounds;
- a maximum number of rounds per piece;
- a wall-clock deadline;
- explicit human stop, with no promise that the build will finish on its own.
