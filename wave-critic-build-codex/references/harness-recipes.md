# Harness recipes

Every harness must be deterministic, time-simulated where time matters, state-addressable, and paired with at least one real-user-path probe.

## Real-time game or simulation

Expose reset, fixed-step advance, render, phase seek, virtual input, snapshot, and separate simulation/render timing. Keep outcome logic out of wall-clock rendering. Capture named frames plus short clips or traces for motion and feel. Add a probe that sends real device or key events.

Typical states: grid, countdown, racing, drift, boost, pack, off-road, pause, finish, results, distance view.

## Web application

Expose reset with fixture/user/time, route or state jump, snapshot, counters, and `flush()` to settle async work. Capture screenshots and accessibility trees across each screen multiplied by empty, loading, loaded, error, permission-denied, dense, mobile, and dark states.

Use a browser tool or Playwright script for a real flow with real clicks, typing, tabbing, and network behavior. Do not judge only through direct store mutations.

## Service or API

Use a test client that resets a seeded database, freezes time and IDs, sends named scenarios through real HTTP, and captures status, body, headers, timing, queries, logs, and post-request database state.

Include unhappy paths: unauthenticated, wrong tenant, malformed request, conflicting write, retries, rate limits, downstream failure, and timeout. Add security and backwards-compatibility critics as their own lenses.

## Data pipeline

Run a fixed corpus through every stage and capture stable rows, schema, row counts, null rates, cardinalities, ranges, dropped/quarantined records, and ordering. Snapshot intermediates, not just the final output.

Use a published schema or convention as the benchmark. Keep the input corpus small enough to review and rich enough to exercise every path.

## Required command surface

Provide project-specific equivalents of:

```text
<smoke>                         # non-zero on failure
<capture> --list
<capture> --only a,b --out dir
<capture> --all --out dir
<trace> --scenario name
<determinism-check>
```

The primary agent runs the full sheet only after all writing agents stop. Critics may run piece-specific captures in parallel only when resources do not contend.
