# <PROJECT> — Codex architecture and ownership contract

Read this file fully before editing. Codex subagents share the workspace. Edit only the files assigned to you, preserve concurrent work, and report cross-owner needs to the primary agent.

## 1. Product and benchmark

<Describe the product, intended user, runtime surface, and named shipped benchmark. Name the exact moments or scenarios used for comparison.>

Target quality is **<BENCHMARK>**, not "good for a generated project."

## 2. Golden rules

1. Own only the files in the ownership table.
2. You are not alone in the codebase. Do not revert, stage, commit, or broadly reformat other agents' work.
3. Preserve the deterministic harness and review states.
4. Keep randomness, clocks and identifiers deterministic where they affect output.
5. Leave the product bootable and pass the smoke gate.
6. Do not add runtime dependencies, publish, push, merge or deploy unless the primary agent has explicit authority.
7. <Project-specific trap or constraint.>

## 3. Lifecycle and ordering

<Describe request, render, simulation, pipeline or job lifecycle. Reserve explicit stage/order slots where order matters.>

| Order | Stage | Owner |
|---:|---|---|
| 10 | ... | ... |

## 4. Shared context

<Describe the shared object or public context, who writes each slot, and what all modules may read.>

Read freely. Write only the slot your module owns.

## 5. File ownership

Globs must be disjoint.

| Piece | Owns | Provides |
|---|---|---|
| core | `src/core/**` | harness, lifecycle, configuration |
| <piece> | `src/<piece>/**` | ... |
| primary-only | `CONTRACT.md`, `tools/pieces.json`, `tools/progress.state.json`, `tools/wave.state.json` | orchestration state and contract |

Need another owner's change? Do not make it. Report the exact interface or behavior required so the primary agent can route it.

### Coherence exception

The coherence smoother may edit the whole repository only when the primary agent has confirmed every piece writer is done. It runs alone. This exception never applies to a normal piece worker.

## 6. Public interfaces

<List calls, events, routes or messages; payload; emitter/caller; listener/owner.>

| Name | Shape | Produces | Consumes |
|---|---|---|---|
| ... | ... | ... | ... |

An emitter without a listener or a route without an entry point is a `dead-end` seam.

## 7. State shapes and machine checks

<List domain state and point to types, schemas, lint rules and tests that encode this contract.>

## 8. Harness and review sheet

<Document reset, state jump, simulated time, snapshot, counters, settle/flush, capture, smoke, trace and determinism commands.>

```text
<smoke>
<capture> --list
<capture> --only <states> --out <dir>
<capture> --all --out <dir>
<trace> --scenario <name>
<determinism-check>
```

Critics may add read-only probes when standard states do not expose a property. At least one probe must drive the real user path.

## 9. Shared values

A value multiple modules must agree on is an interface with one owner.

| Value | Definition owner | Readers |
|---|---|---|
| ... | ... | ... |

Remove downstream duplicate literals. A shared constant that gets overwritten by a local copy is not shared.

## 10. Design language and voice

<Use exact tokens and numeric timing rather than adjectives.>

- palette:
- type:
- spacing and shape:
- motion:
- feedback:
- voice:

## 11. Gates

Run weakest to strongest:

1. <typecheck/lint>
2. <focused tests>
3. <smoke/boot>
4. <piece capture>

## 12. Definition of done for a piece

- It stays within ownership or reports the required cross-owner work.
- Required gates pass.
- Named review states show the intended behavior.
- No console, log or schema errors are introduced.
- The critic verdict meets the acceptance rule, or the piece is honestly escalated.
- The worker returns changed files, verification evidence, and unresolved needs without staging or committing.
