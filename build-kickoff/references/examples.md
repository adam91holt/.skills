# Worked kickoff prompts

Three: the original that this skill is derived from, and two generated from the
template for domains that are not games.

---

## 1. The original — a browser kart racer

The opening turn of the build documented in `wave-critic-build`'s
`references/worked-example.md`. Six days, ~90 builder/critic pairs, zero
hand-written lines of code. Reproduced verbatim, including the clause that was
wrong.

```
I want you to build a Mario Kart-type game involving road cones, planes,
helicopters, diggers, trains, trucks, and cars at the level of Mario Kart. It
should be utterly perfect, joyful and gorgeous, with every single thing done at
Nintendo first-party quality—from the racing feel to the spectacle to anything
you could think of.

Break the game into the smallest pieces that can be improved and judged on their
own—you decide what the pieces are, not me. Fan out sub-agents and have
sub-agents tackle each one individually so that the game is utterly perfect. You
should /loop on each piece and have a separate sub-agent with fresh context check
the actual rendered result and play the real game—never the builder's summary—to
ensure it looks and feels Nintendo first-party. That separate sub-agent should be
a really harsh critic, and if it doesn't look and feel first-party, it should keep
going.

Don't stop until each critic is utterly wowed with the quality when compared with
the actual Mario Kart. It should literally compare them side by side blind and say
which one is better, and when ours loses, name the single biggest gap and send the
builder back in. No fixed number of rounds. Between major waves, spawn one fresh
agent to play the whole game and smooth everything into one coherent thing.

Keep a simple live progress page updated as you work so I can watch it evolve. Do
this in ThreeJS so it runs in a browser. /loop until it's utterly perfect. Fan out
sub-agents and ultracode.
```

**What it got right:** everything in the clause map — benchmark named twice,
decomposition delegated, fresh-context critic, *never the builder's summary*,
blind A/B, single biggest gap, coherence pass, live ledger, stack fixed, triggers
present — fourteen structural instructions in **257 words**.

**What it got wrong:** *"No fixed number of rounds"* — 0 passes out of 17 pieces
after six days, scores climbing the whole time. See `anatomy.md`.

**What it was missing:** the Phase 0 clause, explicit disjoint ownership, and the
reporting rule. All three were retrofitted later, each costing work.

---

## 2. Generated — an issue tracker, benchmarked against Linear

Interview answers: benchmark *Linear*; unattended for a week; plateau rule;
Next.js + Postgres, web.

```
I want you to build an issue tracker — list, issue detail, filters, search,
keyboard-first command palette, and the empty and error states for all of them —
at the level of Linear. It should be fast, quiet and precise, with every single
thing done at Linear-quality: from the keyboard model to the density of the list
to the way it behaves on a slow connection, and anything else you'd think of.

Before you spawn a single builder: stand up the harness. I need seeded fixtures, a
frozen clock, deterministic ids, a way to jump straight to any screen in any
state, and one command that screenshots every screen across empty, loading,
error, dense, mobile and dark. Plus the progress page below. Don't start building
until those exist — retrofitting them costs a wave of work that gets thrown away.

Break this into the smallest pieces that can be improved and judged on their own —
you decide what the pieces are, not me. Each piece owns its own files and nobody
else touches them. Fan out sub-agents and have sub-agents tackle each one
individually. You should /loop on each piece and have a separate sub-agent with
fresh context look at the actual captured screenshots and drive the real UI with
real clicks and real key events — never the builder's summary — to ensure it feels
like Linear. That sub-agent should be a really harsh critic, and if it doesn't, it
should keep going.

The critic writes down what Linear does from memory before it opens ours at all,
then compares them side by side blind and says which is better. When ours loses,
it names the single biggest gap — one, not a list — with a measurement I could
check myself, and sends the builder back to close exactly that. Once a gap is
closed, turn its measurement into an automated test that runs with every build,
so it can never quietly come back.

Don't stop until each critic is genuinely wowed against Linear. But if a piece's
score moves less than half a point across two rounds, don't give it another round
— escalate it to me with the gap named.

Between major waves, spawn one fresh agent to use the whole app end to end and
smooth everything into one coherent thing. It owns the whole repo, it can delete
anything built but unreachable, and it runs alone.

Run the loop from a scheduler that survives restarts — a server-side Routine
that fires hourly and can wake a suspended container, never an in-session
timer. Every tick, prove the wave is actually alive from the age of the main
agent process before doing anything else, and resume dead runs instead of
relaunching them so finished work comes back from cache. If I ask whether it's
running, check first, then answer.

Keep a simple live progress page updated as you work — one row per piece, its
score, and the critic's own words about what's still wrong. Message me only when a
wave lands, a wave had to be restarted, something needs a decision, or it's
finished.

Do this in Next.js against Postgres. /loop until it's Linear-quality. Fan out
sub-agents and ultracode.
```

---

## 3. Generated — a payments API, benchmarked against Stripe

Interview answers: benchmark *Stripe's API*; overnight; round budget of 4;
TypeScript service, HTTP.

Shorter, because a service has fewer surfaces — but every structural clause
survives. Note what changes: the observable output is **responses including every
unhappy path**, and the benchmark's *error taxonomy* is called out specifically,
because that is where API quality actually lives.

```
I want you to build a payments API — charges, refunds, idempotency, webhooks,
pagination, and the full error taxonomy — at the level of Stripe's API. It should
be predictable, honest and boring in the best way, with every single thing done at
Stripe-quality: from the shape of a successful response to what happens on the
fourteenth retry of a half-applied request.

Before you spawn a single builder: stand up the harness. I need a test client, a
seeded database, deterministic ids and a frozen clock, and one command that
captures every named request scenario — including all the unhappy ones — as
request/response pairs I can read. Plus the progress page below. Don't start
building until those exist.

Break this into the smallest pieces that can be improved and judged on their own —
you decide what the pieces are, not me. Each piece owns its own files and nobody
else touches them. Fan out sub-agents, one per piece. /loop on each piece and have
a separate sub-agent with fresh context read the actual captured responses and
call the real endpoints over real HTTP — never the builder's summary — to check it
against Stripe. That sub-agent should be a really harsh critic.

The critic writes down what Stripe returns for the equivalent call from memory —
status, body shape, error code, message register — before it opens ours at all,
then compares blind and says which is better. When ours loses it names the single
biggest gap, with the exact request that shows it, and sends the builder back.
Every closed gap becomes an automated test — the exact request, asserted — so it
can never quietly come back.

Give each piece at most 4 rounds. If it hasn't passed, ship it at its score and
record the critic's gap verbatim on the progress page. An honest board beats a
green one.

Between major waves, spawn one fresh agent to use the whole API as an integrator
would, and smooth it into one coherent thing — one error taxonomy, one pagination
convention, one naming register. It owns the whole repo and runs alone.

Run this overnight from a scheduler that survives restarts — a server-side
Routine, not an in-session timer. Each tick, prove the wave is alive from the
age of the main agent process, and resume dead runs rather than relaunching.

Keep a live progress page. Message me only when a wave lands, a wave had to be
restarted, something needs a decision, or it's finished.

TypeScript, HTTP, no framework magic. /loop until it's Stripe-quality. Fan out
sub-agents and ultracode.
```

---

## What stays fixed across all three

Every structural clause. The benchmark, delegated decomposition, disjoint
ownership, fresh-context critic, *never the builder's summary*, memory-first blind
A/B, single gap with a measurement, a termination rule, the coherence pass, the
ledger, the reporting rule, the triggers, the gap→test ratchet — and, for
anything unattended, the scheduler paragraph (survives restarts, liveness by
process age, resume-not-relaunch), which the original lacked and paid 67.5
silent hours for.

## What changes

Four things: the **nouns**, the **benchmark**, what the critic **looks at and
drives**, and the **quality axes** worth naming. That is the whole delta between a
kart racer and a payments API.
