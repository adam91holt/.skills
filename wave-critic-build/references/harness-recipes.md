# Harness recipes

The harness is precondition #1 and the one everything else rests on. Without it,
critics review code — and code review cannot catch *the drift sparks don't
change colour at tier 2*.

Three properties, in every archetype:

1. **Deterministic** — seeded randomness, frozen clock, deterministic ids. Same
   inputs, same result, byte for byte.
2. **Time-simulated** — advance the model without waiting. A critic must not
   spend 90 seconds of wall clock to reach the last lap.
3. **State-addressable** — jump straight to any state worth looking at, and dump
   the whole state as plain JSON.

Plus one rule that is easy to skip and expensive to skip:

> **Your harness will hide the class of bug that lives in the layer it replaces.**
> At least one instrument must drive the product the way a real user does.

In the case study, steering was mirrored for weeks because `setInput()` wrote the
virtual input and short-circuited the exact device path that was broken. The fix
was a probe that dispatches **real key events** and measures which way the vehicle
actually went. See `worked-example.md`.

---

## Real-time game / simulation

```js
window.__GAME = {
  ready: boolean,
  reset(opts),                 // { seed, level, actor, ... } — a fresh, identical run
  step(seconds),               // fixed steps, NO rendering. Fast.
  render(),                    // draw one frame
  advance(seconds),            // step + render, for capture sequences
  seek(phase),                 // jump to 'countdown' | 'racing' | 'results'
  setInput(partial),           // sticky until changed
  press(name),                 // one-shot edge input
  snapshot(),                  // all actor + world state, plain JSON
  stats(),                     // draw calls, triangles, sim ms, render ms
}
```

- Split the clock in two: `fixedUpdate(dt)` at a constant rate decides outcomes;
  `update(dt, alpha)` only interpolates for display. Anything that affects who
  wins goes in the first; anything that affects how it looks goes in the second.
- `step()` must be pure — no `requestAnimationFrame`, no wall-clock reads. That
  is what makes screenshots reproducible on a software renderer.
- Report sim time and render time **separately** in `stats()`, or a sim spike and
  a draw spike are indistinguishable and nobody can fix either.

**Capture harness**: boot a dev server, load in headless Chromium, drive through
the global, screenshot. Fast-forward with `step()` and only render the last
moment plus a short settle for springs and easings to land.

---

## Web application

```js
window.__APP = {
  ready: boolean,
  reset({ seed, fixture, user, now }),  // seeded data, frozen clock, a known user
  goto(state),                          // 'list-empty' | 'detail-editing' | 'checkout-error'
  snapshot(),                           // route + store state + open dialogs, plain JSON
  stats(),                              // render count, bundle-relevant counters, query count
  flush(),                              // settle all pending async so a screenshot is stable
}
```

- **`flush()` is not optional.** Without it every screenshot races the network
  layer and half your review sheet is spinners. The critic's evidence must be
  what the product *settled* on.
- Freeze the clock and seed id generation, or "same fixture" still produces
  different timestamps, different sort orders and a diff on every run.
- Your review sheet is `named screens × states`:
  `{ empty, loading, loaded, error, permission-denied, dense, mobile, dark }`.
  Most products have a good `loaded` and four states nobody has ever seen.
- Capture the **accessibility tree** alongside the screenshot. It costs one line
  and it is the only artifact that lets a critic judge semantics rather than
  pixels.
- The real-user-path instrument here is a Playwright script that clicks, types
  and tabs — never `goto()` — and asserts on the outcome.

---

## Service / API

The harness is a test client, and determinism is a database problem.

```
harness.reset({ seed, fixture, now })   // truncate, load fixture, freeze clock, seed ids
harness.call(scenario)                  // named request → { status, body, headers, ms, queries, logs }
harness.snapshot()                      // full DB state as sorted, stable JSON
```

- Deterministic ids and a frozen clock, or every response diff is noise.
- The review sheet is a set of **named scenarios**, and it must include the
  unhappy ones: unauthenticated, wrong tenant, malformed body, conflicting
  write, rate-limited, downstream-timeout. Most APIs have a good happy path and a
  set of error responses nobody has ever read.
- Capture `queries` and `ms` per scenario. Without them, a perf critic has to
  guess, and a guessing critic writes vague directives.
- Benchmark: a specific published API with a real error taxonomy (Stripe is the
  usual one). The critic writes down *how Stripe would have responded to this
  exact request* before it looks at yours.
- Standing extra critics: **security** and **backwards compatibility**. Both are
  lenses no feature owner will ever apply to their own work.

---

## Data pipeline

```
harness.run({ seed, corpus, now })   // fixed input corpus → every intermediate, not just the output
harness.snapshot(stage)              // rows, schema, null profile, distribution summary per stage
```

- The review sheet is `named input slices × stages` — including the slices that
  are meant to be dropped, deduplicated or quarantined. A pipeline's real
  behaviour lives in what it *discards*, and nothing else in the system reports
  that.
- Snapshot the **shape**, not just the rows: row counts, null rates,
  cardinalities, min/max per column. A critic can judge a distribution; it cannot
  judge ten million rows.
- Determinism means stable ordering. Sort every snapshot, or every diff is noise
  and the loop learns nothing.

---

## What every harness needs on top

| Artifact | Why |
|---|---|
| A **smoke** command with a non-zero exit | The only gate that proves the product still starts |
| A **`--list`** of every state on the review sheet | Otherwise nobody knows what can be looked at |
| An **`--only a,b --out dir`** selector | Critics capture just their piece; full sheets are slow |
| A **trace** over time, not just snapshots | Some defects only exist as a shape across time |
| A **determinism check** | Same seed, two runs (or two quality tiers), diff the snapshots. This is what stops an optimisation silently changing behaviour |

Write the harness API into the contract, and tell critics explicitly:

> Write your own capture script if the standard states do not show what you need.

The standard sheet finds standard problems. The bespoke probes are where the
verdicts that actually move a product come from.
