# <PROJECT> — Architecture Contract

**Read this fully before editing anything.** Many agents work on this repo in
parallel. The single rule that keeps that from exploding: **you edit only the
files you own.**

This file is the contract between agents that will never speak to each other. It
is read in full by every builder, every critic and every coherence pass. Keep it
current — a stale contract costs a round every time it is read.

---

## 1. What this is

<One paragraph: what the product is, who it is for, and the NAMED benchmark it is
measured against. Not "high quality" — a specific shipped product the critics can
recall in detail.>

Target quality bar is **<BENCHMARK>**. Not "good for a side project". If the team
that shipped <BENCHMARK> would flag it, it is not done.

<How it runs: build system, deployment shape, runtime constraints.>

---

## 2. Golden rules

1. **Own your files.** The ownership table (§5) is authoritative. Never edit a
   file another module owns. If you need something from it, use the event bus or
   the shared context.
2. **Never break the harness (§8).** The automated critics drive the product
   through it. Break it and your work cannot be judged, so it will be reverted.
3. **Deterministic.** Seeded randomness, frozen clock, deterministic ids in
   anything that decides an outcome. Same seed and same inputs produce the same
   result, byte for byte.
4. **<Runtime constraint>** — e.g. no network at runtime, no asset files, offline-capable.
5. **<Budget>** — e.g. 60fps on a mid laptop; p95 under 200ms; bundle under 500KB.
6. **Leave it running.** Every commit must leave the product working. Verify with
   the smoke gate before you finish.
7. **<Language-specific trap that has already cost a build.>** Every repo grows
   one. Write it down the first time it costs a green build, not the second.

---

## 3. Execution / lifecycle model

<How a unit of work flows through the system. For a game: the two clocks. For a
service: request lifecycle and middleware order. For an app: mount, hydrate,
route change, teardown.>

Reserve explicit ordering slots so ordering is predictable rather than emergent:

| order | stage |
|---|---|
| 10 | ... |
| 20 | ... |

---

## 4. The shared context

<The one object constructed once and passed to every module. What is on it, who
writes each slot, what everyone may read.>

Read freely; only the owning module writes to its own slot.

---

## 5. File ownership

**Edit only your row.** Shared files at the bottom need coordination.

| Module | Owns | Provides |
|---|---|---|
| **core** | `src/core/*` | engine, loop, harness, config |
| **<module>** | `src/<module>/**` | ... |
| *shared* | this file, `tools/**` | coordinate before editing |

Globs must be **disjoint**. Overlap is the one failure mode parallel agents
cannot recover from.

Need a change in someone else's file? Either emit an event they already listen
for, or state the request in your final report so the orchestrator routes it.

### The one exception: the coherence pass

Strict ownership is what lets many agents edit this repo at once, and it has a
cost nothing above can pay: **no row in that table owns the space between the
rows.** Two agents each pick a defensible accent, each passes its own critic, and
the product ends up looking like it was made by people who never met.

So the coherence pass runs one agent with **whole-repo ownership** and no
restrictions, judged by a critic who scores the product as a single work rather
than as a piece. It runs between waves and **never during one** — whole-repo
ownership and strict ownership cannot both be true at the same time, and the
builder loses that race silently.

If you are a wave builder, this is not your exception. It is not available to you,
and asking for it is the same as asking to edit someone else's file.

---

## 6. The interface between modules

<The event bus / message contract / public API. List every event or call: name,
payload, who emits, who listens.>

Keep the table complete. An event with no listener is a `dead-end` seam and the
coherence pass will find it — eleven of them in one recorded case, one of which was
why an alarm state had no alarm.

---

## 7. State shapes

<The core domain objects, field by field. The types file is the machine-readable
version of this section; keep them in step.>

---

## 8. The test harness

**This is how every critic sees your work. Do not break it.**

```js
window.__APP = {
  ready, reset(opts), goto(state), snapshot(), stats(), flush(), ...
}
```

<Document every method: what it does, what it returns, what it must never do.>

Critics are explicitly encouraged to write their own probes against this API when
the standard review sheet does not show what they need.

---

## 9. Shared values that two modules must agree on

**A number that two modules must agree on is not a tuning constant, it is an
interface.** List them here and point at the one file that owns each. A shared
constant with a second copy downstream of it is not shared, it is decorated.

| Value | Owned by | Read by |
|---|---|---|
| ... | ... | ... |

---

## 10. Design language / voice

<The look, the tone, the copy rules — concretely enough that two agents who never
meet make the same call. Name exact tokens, not adjectives.>

- **Palette anchor**: `#......`, `#......`, `#......`
- **Type**: what names things vs what describes things, and nothing in between
- **Motion**: the one rhythm — durations and easings, stated as numbers
- **Voice**: active, specific, from the user's side of the screen

---

## 11. Definition of done for any piece

- Meets the budget in §2.
- Looks and behaves intentionally in every state a user can reach.
- Has feedback for every state change — no silent transitions.
- The smoke gate passes.
- Nothing in the console. No warnings, no errors.
