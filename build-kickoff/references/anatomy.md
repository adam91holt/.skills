# Anatomy of a kickoff prompt

This skill is derived from one prompt that worked — the opening turn of a build
that ran six days, ~90 builder/critic pairs, and produced a browser kart racer
with zero hand-written lines of code.

What follows is that prompt taken apart clause by clause: what each one bought,
which part of the `wave-critic-build` framework it maps to, and what happens when
it is missing. Read this before deciding a clause is filler.

The striking thing about the original is that it **encodes the entire framework in
natural language without naming any of it.** It never says "ownership globs" or
"blind A/B" or "coherence pass". It describes each one in a clause a person would
write anyway. That is the register to write in.

---

## The clause map

| The clause, as written | Framework | What it buys | Absent → |
|---|---|---|---|
| *"a Mario Kart-type game involving road cones, planes, helicopters, diggers, trains, trucks, and cars"* | The thing | **Concrete nouns.** Seven of them, and they became pieces | "a racing game" — the fleet invents scope, inconsistently |
| *"at the level of Mario Kart"* + *"Nintendo first-party quality"* | Precondition 4 | The **named benchmark**, stated twice in different words | Every critic returns 8/10 and a compliment |
| *"utterly perfect, joyful and gorgeous"* | Calibration | Tells the critic **which failures to care about** | Generic polish; nothing to fail against |
| *"from the racing feel to the spectacle to anything you could think of"* | Breadth | Two axes that **pull against each other**, plus an explicit catch-all | The fleet optimises one axis and declares done |
| *"Break the game into the smallest pieces that can be improved and judged on their own"* | Phase 1 | **Judgeability is the test of a piece** — the exact right criterion | Pieces that no single critic can evaluate |
| *"—you decide what the pieces are, not me"* | Phase 1 | **Delegated decomposition** | User-named pieces are usually *seams*, which no owner can close |
| *"Fan out sub-agents and have sub-agents tackle each one individually"* | Phase 2 | Parallelism, one owner per piece | One context does it serially and runs out |
| *"You should /loop on each piece"* | Phase 4 | The loop itself | One pass, no iteration |
| *"a separate sub-agent with fresh context"* | Critic role | **No anchoring.** It never saw the build | The builder marks its own homework |
| *"check the actual rendered result and play the real game"* | Preconditions 1–2 | **Observation over reading.** And *play* — the real input path, not the harness's | Code review, which cannot see a colour that never changed |
| *"never the builder's summary"* | The single most valuable line | Kills the most persuasive, least reliable artifact in the system | The loop converges on better *summaries* |
| *"a really harsh critic"* | Calibration | Explicit permission to fail the work | Uniform 8/10 |
| *"compare them side by side blind and say which one is better"* | Blind A/B | The **honest signal**. A critic can flatter a score; it struggles to flatter a forced choice | Praise uncorrelated with quality |
| *"when ours loses, name the single biggest gap"* | Verdict schema | **One** gap | Twelve findings; the three cheap ones get fixed |
| *"and send the builder back in"* | Carry | The verdict becomes the next round's brief | The measurement is earned and then thrown away |
| *"No fixed number of rounds"* | ⚠️ **Anti-termination** | Nothing. This is the one clause that cost | See below |
| *"Between major waves, spawn one fresh agent to play the whole game and smooth everything into one coherent thing"* | Phase 3 | The **coherence pass** — the thing most people skip | Good parts, incoherent whole; defects five critics report and none can close |
| *"Keep a simple live progress page updated as you work so I can watch it evolve"* | Precondition 5 | The **ledger**, and the human's only window | Nobody can see the state, including the person paying for it |
| *"Do this in ThreeJS so it runs in a browser"* | Harness | Fixes the stack, therefore the capture story | The fleet picks, and picks something uncapturable |
| *"/loop until it's utterly perfect. Fan out sub-agents and ultracode."* | Triggers | Actually **starts** it | A polite single-threaded attempt |

---

## The one clause that was wrong

> *"Don't stop until each critic is utterly wowed... No fixed number of rounds."*

Judged against a shipped, polished product, this is an **asymptote, not a finish
line**. The recorded run: six days, ~90 builder/critic pairs, **0 passes out of 17
pieces**, with scores climbing steadily from 5.5 toward 7.5 the entire time.

Nothing was broken. The critics were right to keep failing it; the gap to a
first-party Nintendo title is real and does not close in six days. The loop did
exactly what it was told, forever.

So ask the termination question up front, and offer the plateau rule as the
default: a piece whose score moves less than 0.5 across two rounds does not get
another round — it gets escalated with the gap named. That preserves the honesty
(no fake passes) while giving the thing an end.

There is a second signal worth writing into the prompt: when critics start failing
a piece for something **its vocabulary cannot express** — *"the courses have no
hazards, because nothing in the track system can touch a player"* — more rounds
are structurally incapable of helping. That is a scope decision, and it should
come to the human.

---

## Three things the original didn't have, that yours should

**A Phase 0 clause.** The original let the fleet start building and grow the
harness alongside it. It worked, but every retrofitted precondition cost a wave
that had to be redone. Say it explicitly: *stand up the harness, the capture
command and the progress page before spawning a single builder.*

**Disjoint ownership, stated.** *"Each piece owns its own files and nobody else
touches them."* Overlapping writes are the one failure mode parallel agents cannot
recover from, and it is one clause to prevent.

**The reporting rule.** *"Message me only when a wave lands, a wave had to be
restarted, something needs a decision, or it's finished."* Without it an
unattended build narrates every tick, and its human stops reading within a day —
which means the one message that needed a decision goes unread overnight.

---

## Register notes

**Write it as a person, not as a spec.** The original's power is that every clause
reads like something a demanding client would say. Agents follow that far better
than a numbered list of framework terms, because it carries *intent* alongside the
instruction — and intent is what generalises to the case the spec didn't cover.

**Say the same thing twice in different words** when it matters. *"At the level of
Mario Kart"* and *"Nintendo first-party quality"* are the same instruction. So are
*"check the actual rendered result"* and *"play the real game"*. Both survived into
every downstream prompt precisely because they were said twice.

**Keep the superlatives.** *Utterly perfect. Joyful. Gorgeous. Utterly wowed.*
They read as fluff and are not — they set the critic's threshold, and the critics
quoted them back. They only work because a named benchmark sits next to them; on
their own they are the adjective trap this skill's Q1 exists to avoid.

**Length: 250–450 words.** The original is 257 — which is worth sitting with,
because it carries fourteen distinct structural instructions in that space. Every
sentence does a job. Adding this skill's three missing clauses takes a filled
template to roughly 370–440, which is still short enough that none of it is
skimmed.
