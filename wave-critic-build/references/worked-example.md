# Worked example — a browser kart racer, built in 6 days

The run this skill is derived from. It is included for the receipts: real numbers,
real verdicts, and the mistakes, so you can calibrate what to expect rather than
guessing.

Public repo, including every prompt that produced it:
**<https://github.com/adam91holt/mario.cone>**

---

## The setup

**The ask**, in one message, on day one. Almost everything in this skill was
implied by it:

> Build a Mario Kart-type game involving road cones, planes, helicopters, diggers,
> trains, trucks and cars at the level of Mario Kart. […] Break the game into the
> smallest pieces that can be improved and judged on their own — you decide what
> the pieces are, not me. Fan out sub-agents […] have a separate sub-agent with
> fresh context check the actual rendered result and play the real game — never
> the builder's summary. That separate sub-agent should be a really harsh critic
> […] It should literally compare them side by side blind and say which one is
> better, and when ours loses, name the single biggest gap and send the builder
> back in. No fixed number of rounds. Between major waves, spawn one fresh agent
> to play the whole game and smooth everything into one coherent thing. Keep a
> simple live progress page updated as you work so I can watch it evolve.

The only other design instruction in six days was *"We should use typescript"*,
eight minutes later. Everything after that was operational.

**The five preconditions, as instantiated:**

| # | Precondition | What it was |
|---|---|---|
| 1 | Harness | `window.__GAME` — `reset/step/render/advance/setInput/seek/snapshot/stats`. Simulation in `fixedUpdate(dt)` at 120 Hz against a seeded RNG; no `Math.random()`, no wall-clock reads |
| 2 | Review sheet | 12 named frames: grid, countdown, racing, drift, boost, pack, overhead, offroad, pause, finish, results, far |
| 3 | Contract | `ARCHITECTURE.md` — ownership table, execution order slots, event bus, art direction, definition of done — encoded in `src/types.ts` |
| 4 | Benchmark | Mario Kart 8 Deluxe |
| 5 | Ledger | `progress.state.json` → one self-contained `progress.html`, published on every push |

**The pieces (17):** feel, camera, track, look, cast, fx, items, ai, hud, world,
audio, flow, menus, courses, themewire, perf, coherence.

**Scale:** ~90 builder/critic agent pairs. 126 human turns, of which roughly 100
were the loop waking *itself* on an hourly schedule. Zero lines of hand-written
TypeScript.

---

## What the verdicts actually looked like

This is the level to aim for. Each of these became the next round's acceptance
test.

> The menu stage casts no contact shadow: ground luminance under the digger's
> tracks reads **96.9 against 42.4** for the asphalt beside it. The same machine
> on the race grid a quarter-second later is correctly 30% darker.

> The player's item slot is empty for **87% of a race** — 3 draws in 145 seconds,
> one unbroken 63.7-second stretch with nothing.

> The rocket start is inverted. Pressing accelerate *on* the green — a 0.1s
> reaction window — gives 1.38s of boost and 119.3 m in two seconds. Holding
> through the final beat, which is Mario Kart's actual rocket window, gives
> nothing and 41.5 m.

> The quality governor sat at its top rung for **331 seconds at roughly 4 fps**
> without a single change, because its warm-up gate is counted in rendered frames
> and the number it reads under-reports a GPU-bound frame by twentyfold.

> The drift ground signature fails in both halves at once. The sparks are a comb
> of near-parallel constant-width needles lying in the road plane — the seven
> longest inside a 10 degree spread at aspect ratios of 9:1 to 25:1 — and the tyre
> smoke is six to eight separately countable grey slabs instead of a continuous
> rope.

---

## What the coherence pass found

Its first survey opened:

> A bag of very good parts, and the parts know it — several files carry comments
> apologising for the space they cannot reach across.

Fourteen seams. The three that justify the whole pass:

1. **The game was set in two different typefaces either side of the starting
   flag.** The front end imitated the drawn display face in stacked text-shadows;
   the imitation did not survive a hand-off one second wide.
2. **Eleven events emitted every race into a room with no listeners** — which is
   why the wrong-way alarm had no alarm.
3. **Eight racers finishing 6.5 km inside 0.811 seconds of each other**, so the
   drift loop the menus call "the real game" was something a player had never once
   seen happen.

And the one that proves the structural argument: **five separate critics failed
five different pieces on missing contact shadows** — the menu stage, the world
geometry, the machines, the lowest quality rung, the carried items. Each was
correct inside its own module. None could fix it: the sun's shadow camera belonged
to `render` while the `castShadow` flags lived wherever each mesh was built.
Reported five times, closed zero times, until one agent owned the whole repo.

The smoothing round's real output was not local edits. It was new shared modules —
a theme file owning the plate, the curtain, the cursor, the prompt rail, the
circuit diagram and the finish hand-off's clocks — because *a seam you close by
hand reopens next wave*. The contract now carries the sentence: **a number that two
modules must agree on is not a tuning constant, it is an interface.**

---

## The bug that justifies the "real user path" rule

Steering was mirrored for the **first five days** — ~70 builder/critic pairs and
twelve named frames never caught it — and the harness **structurally could not**:
`setInput()` writes the virtual input and short-circuits the exact device path
that was broken. The AI drove correctly throughout — its maths was right — while
a comment above it asserted the opposite convention on every count, and the
keyboard mapping had been written to match the comment.

What caught it was not an instrument. On day five the user asked for a GitHub
Pages deploy, played the game for forty minutes, and reported it. `steercheck.mjs`
— the probe that dispatches **real key events** and measures which way the kart
actually went — was written *after* that report, to verify the fix. Two lessons,
not one: at least one instrument must drive the real input path, and a playable
deploy in front of the human is an instrument no harness replaces (see
`preconditions.md` §2).

---

## What it cost operationally

The container suspended without warning every 35–90 minutes, killing every
in-flight agent. The adaptations became the orchestrator design:

- Liveness by **main-process age**, after two silent stalls (11.5 h and 2.5 h)
  caused by trusting file timestamps and process greps.
- **Resume with byte-identical args**, verified across a real restart: two finished
  builders served from cache, only the two that died re-ran.
- **Short waves** — two pieces, two rounds.
- A tick prompt that grew from ~900 to ~5,400 characters, one paragraph per
  failure.

And the bill, measured on day six: **14.9B tokens** — 14.6B cache reads, ~297M
cache writes, 6.8M output — across 278 subagent transcripts and a 2.5GB session
archive. That is the number to weigh against "the setup is roughly a day; it
pays back over days" when deciding whether a project clears the bar for this
loop at all.

Two silent-corruption bugs also shaped the templates: `args` arriving as a JSON
string (which sent a wave to rebuild finished pieces for ninety minutes) and a
`carry` string where the schema said array (which dropped two of three pieces to
`null` while the wave reported itself started).

---

## Where it ended up

**Good, and not done.** Four circuits, seven machines with seven drivers, three
laps, drift with three mini-turbo tiers, items, a championship, a full front end,
phone controls. It races properly and it looks like a game.

Against the 8.5 bar: **17 pieces, 0 passed.** 11 failing, 6 awaiting a closing
verdict. Scores 5.5–7.5. Whole-game judgement 7.0.

That is not the loop failing — every round produced specific, measured findings
and each fix handed the next critic a better game to be harsh about. It is the
loop lacking a terminator, which is exactly why `termination.md` exists in this
skill and did not exist in that project.

The late-stage ledger entry that names the real ceiling:

> Both pieces are now failing on an **absence rather than a defect**. `perf` can
> only change resolution, so it runs out of moves. `courses` can only change
> shape, because nothing in the track vocabulary can touch a player — proven by
> `stunRacer` having one caller in the entire game.

That is a scope decision, not another round. Recognising it early is the single
highest-value thing this skill can give you that that project did not have.
