# Phase 0 — The five preconditions

Build all five before you spawn a single builder agent. Each one tends to get
retrofitted instead, and every retrofit costs a wave of work that has to be
redone against the thing you should have had first.

---

## 1. A machine-drivable control surface (the harness)

One global object, or one CLI, that can put the product into **any state** and
report **ground truth** about it.

```js
window.__APP = {
  ready: boolean,
  reset(opts),        // { seed, fixture, user, now } — a fresh, identical run
  goto(state),        // jump straight to any state worth looking at
  step(seconds),      // advance the model WITHOUT waiting or drawing
  snapshot(),         // the whole state as plain, stable JSON
  stats(),            // the counters a perf critic needs
  flush(),            // settle pending async so an observation is stable
}
```

Three properties, all load-bearing:

**Deterministic.** Seeded randomness, frozen clock, deterministic id generation in
anything that decides an outcome. Same seed plus same inputs gives the same result,
byte for byte. This is what makes an observation reproducible and turns a bug
report into *a seed and a timestamp* rather than an anecdote. It is also what lets
you prove an optimisation changed nothing: run the same seed at two settings and
diff the snapshots.

**Time-simulated.** Advance the model without waiting. A critic must not spend 90
seconds of wall clock to reach the final lap, or 30 minutes to reach the state
that only appears after a retention job runs.

**State-addressable.** Jump to any state on the review sheet, and dump the whole
state as JSON. If reaching a state requires a scripted sequence, that sequence
belongs in the harness, not in each critic's head.

### The rule people skip

> **A harness hides the class of bug that lives in the layer it replaces.**

A `setInput()` that writes the virtual input short-circuits the device path, so a
mirrored key mapping survives every automated check. A test client that calls the
handler directly never exercises the middleware. A fixture loader that writes rows
directly never exercises the migration.

So: **at least one instrument must drive the product the way a real user does** —
real key events, real HTTP through the real stack, real browser clicks — and
assert on the outcome. Everything else can use the fast path.

Per-archetype designs are in `harness-recipes.md`.

### Everything the harness also needs

| Artifact | Why |
|---|---|
| A **smoke** command with a non-zero exit | The only gate that proves the product still starts |
| A **`--list`** of every state on the review sheet | Otherwise nobody knows what can be looked at |
| An **`--only a,b --out dir`** selector | Critics capture just their piece; full sheets are slow |
| A **trace** over time, not just snapshots | Some defects exist only as a shape across time |
| A **determinism check** | Same seed, two runs or two settings, diff the snapshots |

---

## 2. A review sheet

A fixed, named set of states captured on every run. Not "take some screenshots" —
a named list, versioned with the code.

> **A feature with no shot is a feature no reviewer will ever see.**

When you add a feature, you add a state to the sheet. When a critic needs
something the sheet does not show, it writes a new probe — and that probe gets
kept (see "Instruments" below).

**Compose each state deliberately.** A recipe that can land somewhere useless
will. Drive to the state on purpose, let animations and async settle, then
capture. A capture that steers blind from a standing start eventually photographs
the wrong thing entirely and hands a critic false evidence — and a critic reasoning
from false evidence produces confident, expensive nonsense.

Typical sheets:

- **Game**: grid, countdown, racing, drift, boost, pack, overhead, off-road,
  pause, finish, results, far
- **App**: each screen × `{ empty, loading, loaded, error, permission-denied,
  dense, mobile, dark }`
- **Service**: each scenario, including unauthenticated, wrong tenant, malformed
  body, conflicting write, rate-limited, downstream-timeout
- **Pipeline**: each input slice × each stage, including the slices meant to be
  dropped, deduplicated or quarantined

The pattern in the last three: most products have a good happy path and a set of
states nobody has ever looked at. The sheet is what makes them visible.

### Instruments

The standard sheet finds standard problems. Tell critics explicitly:

> Write your own capture script if the standard states do not show what you need.

Then keep the good ones. A mature project accumulates a dozen bespoke probes —
telemetry timelines, distribution summaries, "the same frozen moment at every
quality setting, honestly timed", "count what is actually on screen", "drive it
with real key events". These are where the verdicts that actually move a product
come from.

One caution worth writing into the contract: **observation can change the system.**
A probe that calls the harness's step/render may latch the product into a bench
mode where the thing being measured stops happening. If a probe must only *read*,
say so at the top of the probe.

---

## 3. A written contract, encoded as types

`CONTRACT.md` is the agreement between agents that will never speak to each other.
Copy `assets/CONTRACT.template.md`. It carries:

- the golden rules (determinism, runtime constraints, budget, "leave it running")
- the **file ownership table** — one module per row, disjoint globs
- the execution / lifecycle / ordering model
- the interface between modules — every event or call, who emits, who listens
- **shared values that two modules must agree on**, and which file owns each
- the design language and voice, concretely enough that two agents who never meet
  make the same call
- a definition of done

**Encode it as real types** so a cross-module break fails the typecheck rather than
waiting for a code review that is never going to happen. A contract that exists
only in prose is one agents drift from and no tool catches.

Keep it current. It is read in full by every builder, every critic and every
coherence pass, so a stale paragraph costs a round every time it is read.

---

## 4. A named external benchmark

Not "high quality". Not "polished". A **specific shipped product** the critic can
recall in detail.

The benchmark does two jobs: it gives the critic something concrete to write down
from memory before it looks at yours, and it makes the blind A/B possible.

Pick one where the reference behaviour is widely known and richly specified —
a shipped game, a well-known app's specific view, an API with a published error
taxonomy. Name the *moments* you will compare, not just the product.

---

## 5. A ledger

One row per piece: `id, name, scope, state, rounds, verdict, gap`. A plain JSON
file, rendered to a static board.

Two rules:

- Update it from the critics' **actual verdicts**, never their summaries.
- Record the gap **verbatim**, in the critic's own measured words.

A board is worth reading precisely when it says *"the item slot is empty for 87% of
a race"* rather than *"items need work"*. It is also the only place the honest
state of the project lives — the agents' own reports are systematically optimistic.

Render it to one self-contained HTML file and publish it — in Claude Code, the
**Artifact tool** is the mechanism: publishing the same file path again redeploys
to the same URL, so the board's link stays stable for the whole build. The
recorded run's board went up nineteen minutes into day one and was redeployed on
every wave. A build nobody can watch is a build nobody trusts.
