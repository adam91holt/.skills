# The kickoff prompt template

Fill the `<ANGLE_BRACKETS>` from the interview. Keep the paragraph order — it runs
*what* → *how it's split* → *how it's judged* → *when it ends* → *how it's kept
whole* → *how I watch it* → *triggers*, and each paragraph assumes the one before.

Aim for **250–500 words**. Long enough to carry every clause, short enough that
nothing gets skimmed. The original was 257; the clauses this template adds that
it lacked — Phase 0, explicit ownership, the reporting rule, and (for
unattended runs) the scheduler paragraph — take a filled template to roughly
370–490. The scheduler paragraph earns its ~70 words: the original run lost
67.5 hours to a scheduler that died with its container.

Write it in the **user's voice**: first person, imperative, addressed to Claude.

---

## The template

```
I want you to build <THE THING, WITH ITS CONCRETE NOUNS> at the level of
<NAMED BENCHMARK>. It should be <QUALITY BAR: two or three real adjectives>,
with every single thing done at <BENCHMARK>-quality — from <AXIS 1> to
<AXIS 2> to anything you could think of.

Before you spawn a single builder: stand up the harness. I need <a way to drive
this thing into any state and dump ground truth about it, deterministically>,
one command that captures <every state worth looking at, by name>, a test
runner wired to the same seeded determinism, and the progress page below.
Don't start building until those exist — retrofitting them costs a wave of
work that gets thrown away.

Break <THE THING> into the smallest pieces that can be improved and judged on
their own — you decide what the pieces are, not me. Each piece owns its own
files and nobody else touches them. Fan out sub-agents and have sub-agents
tackle each one individually. You should /loop on each piece and have a separate
sub-agent with fresh context check <THE REAL OBSERVABLE OUTPUT> and <USE THE
REAL PRODUCT THE WAY A USER WOULD> — never the builder's summary — to ensure it
<MEETS THE BAR>. That separate sub-agent should be a really harsh critic, and if
it isn't <BAR>, it should keep going.

The critic writes down what <BENCHMARK> does from memory before it opens ours at
all, then compares them side by side blind and says which one is better. When
ours loses, it names the single biggest gap — one, not a list — with a
measurement I could check myself, and sends the builder back in to close exactly
that. Once a gap is closed, turn its measurement into an automated test that
runs with every build, so it can never quietly come back.

<TERMINATION CLAUSE — pick one from below>

<UNATTENDED ONLY — include this paragraph when Q2 said unattended; drop it for
supervised runs:>
Run the loop from a scheduler that survives restarts — in a remote environment
that means a server-side Routine that fires hourly and can wake a suspended
container, never an in-session timer, which dies with the container. Every
tick, prove the wave is actually alive from the age of the main agent process
before doing anything else — files existing proves nothing — and resume dead
runs instead of relaunching them so finished work comes back from cache. If I
ask whether it's running, check first, then answer.

Between major waves, spawn one fresh agent to <USE THE WHOLE THING END TO END>
and smooth everything into one coherent thing. It owns the whole repo, it can
delete anything that is built but unreachable, and it runs alone.

Keep a simple live progress page updated as you work so I can watch it evolve —
one row per piece, its score, and the critic's own words about what's still
wrong. <MESSAGE ME ONLY WHEN: a wave lands, a wave had to be restarted,
something needs a decision, or it's finished.>

Do this in <STACK> so it <RUNS WHERE>. /loop until it's <BAR>. Fan out
sub-agents and ultracode.
```

---

## The termination clause — pick one

Ask the user (Q3), then paste the matching clause. This is the paragraph most
often left out, and the only one whose absence means the build never ends.

**(a) Plateau rule — recommended.**
```
Don't stop until each critic is genuinely wowed comparing ours against
<BENCHMARK>. But if a piece's score moves less than half a point across two
rounds, don't give it another round — escalate it to me with the gap named. More
rounds cannot fix a piece whose vocabulary can't express what the critic wants.
```

**(b) Round budget.**
```
Give each piece at most <N> rounds with the critic. If it hasn't passed by then,
ship it at whatever score it reached and record the critic's gap verbatim on the
progress page. An honest board that says 7.0 and exactly what's wrong is worth
more to me than one that says passed.
```

**(c) Time budget.**
```
Run until <TIME / DATE>. Then stop, land whatever exists on main, and give me
the board: every piece, its score, and the single biggest gap still open.
```

**(d) Wowed or nothing — the original.**
```
Don't stop until each critic is utterly wowed with the quality when compared
with <BENCHMARK>. No fixed number of rounds.
```
> Tell the user plainly what (d) means: judged against a shipped product it is an
> asymptote, not a finish line. A real run on this clause went six days and ~90
> builder/critic pairs with **zero** pieces passing, scores rising the whole time.
> That is the loop working correctly and never stopping. Fine if they want it
> running until they say stop — a problem if they expected a "done".

---

## Filling the harder slots

**`<THE REAL OBSERVABLE OUTPUT>`** — what the critic *looks at*. Rendered frames
and captured clips; the actual HTTP responses including every unhappy path; the
rendered page at each breakpoint; the output snapshots and null profile. If you
cannot name this, the harness isn't real yet and the Phase 0 paragraph is doing
the most important work in the prompt.

**`<USE THE REAL PRODUCT THE WAY A USER WOULD>`** — *play the real game*, *drive
the real UI with real clicks and real key events*, *call the real endpoint over
HTTP*. This is deliberately redundant with the line above, and it is worth the
words: a harness hides the entire class of bug living in the layer it replaces. A
mirrored key mapping survives every automated check that uses `setInput()`.

**`<AXIS 1>` / `<AXIS 2>`** — the two dimensions of quality that would otherwise
be traded against each other. The original used *"from the racing feel to the
spectacle"* — mechanics and presentation, which pull in different directions.
Naming both stops the fleet optimising one and calling it done.

**`<QUALITY BAR>`** — real adjectives, and yes they earn their place, but only
because the benchmark is doing the actual work in the sentence next to them.
*Joyful* and *gorgeous* told the critics which failures to care about. On their
own, with no named product, they would have bought nothing.
