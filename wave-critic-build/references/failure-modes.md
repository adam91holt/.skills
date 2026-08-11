# Failure modes

Every entry here was paid for. Read this before your first long run; come back to
it whenever something is odd and you cannot name why.

They are grouped by what the failure *feels like from the outside*, because that
is how you will meet them.

---

## "It's been quiet for a while"

### Silent multi-hour stall
**Cause.** Liveness judged by whether files exist, or by grepping for the agent
process. Output files and browser profiles outlive the agents that made them, and
sub-agents often run in-process so the grep finds nothing for a healthy wave.
**Fix.** Judge by the **age of the main agent process** against the gap since the
last agent write. See `orchestrator.md`.
**Cost when it bites:** 11.5 hours in one recorded case, 2.5 in another.

### A false "dead" verdict
**Cause.** `ls | tail` sorts alphabetically, not by time — it hid the only live
agent behind eleven finished ones.
**Fix.** `ls -t`. Always.

### The agent process is nowhere in the process list
**Cause.** Grepping inside a `--sort=-pcpu | head -N` list. A headless browser
outranks it.
**Fix.** `ps -eo etime,comm | grep -w <agent>`, unsorted and unfiltered.

### The liveness command errors and the tick carries on regardless
**Cause.** GNU flags on a BSD box — `ls --time-style` does not exist on macOS.
An agent reads a failed check as *no evidence of death*.
**Fix.** Fix the portability when you write the prompt, and make a check that
cannot run fail loudly rather than fall through. See `orchestrator-setup.md`.

---

## "It ran, but it built the wrong thing"

### A wave rebuilds work that was already finished
**Cause.** `args` arrived as a JSON string rather than an object, `args.pieces`
read `undefined`, and the script fell through to its defaults. It reported itself
started and looked healthy for ninety minutes.
**Fix.** Parse both shapes, and **throw on anything unparseable rather than
defaulting**. A misrouted wave must be a loud failure.

### One piece of three gets built, silently
**Cause.** A `carry` field hand-authored as a string where the schema says array.
`.join()` threw inside a pipeline stage, which drops that item to `null` and skips
its remaining stages — no error surfaces.
**Fix.** Normalise carry defensively; **grep the new agent transcripts** for the
piece name and the carried observations after every launch.

### A resume re-runs everything
**Cause.** The args did not match byte-for-byte, so the cache missed.
**Fix.** Pass the identical args object. Keep the workflow script
manifest-driven so it is never edited between waves.

### A resumed wave cannot compile
**Cause.** A dead agent was mid-write on a file. That is *not* transient — it is
not coming back, and the resumed agent restarts that step from scratch.
**Fix.** `git checkout --` the half-written files before resuming.

### Two waves running at once
**Cause.** `WFDIR` was pinned in the tick prompt, but the path embeds a session
id. The orchestrator session restarted, the pinned path went stale, the tick found
no runs and launched a second wave alongside the one still building. The stale path
goes bad at precisely the moment the check exists to catch.
**Fix.** Resolve `WFDIR` by glob every tick, and sanity-check the newest run's
mtime against `date -u` — a newest run that is days old means the glob found a
dead session directory, not that the wave is dead.

---

## "The reviews look great and the product doesn't"

### Every critic returns ~8/10 and a compliment
**Cause.** No calibration in the critic prompt.
**Fix.** State the numbers: *"7 is a normal score for competent work. Our product
is new; the default expectation is that the benchmark wins. Only pick ours if it
genuinely deserves it."*

### A critic scores 9 but still picks the benchmark
**Cause.** Nothing — this is the critic contradicting itself, and it is common.
**Fix.** Gate on all three signals agreeing:
`pass && score >= PASS && blindPick !== 'benchmark'`.

### Verdicts are prose, not measurements
**Cause.** The review sheet does not actually show this piece, so the critic falls
back to impressions.
**Fix.** Add an instrument that makes the property measurable. A verdict without a
number cannot become the next round's acceptance test.

### The critic praises something that is not in the build
**Cause.** It read the builder's report.
**Fix.** *"Do not read the builder's report or the commit messages."* State it in
the prompt every time.

### Confident nonsense in a verdict
**Cause.** Captures taken while other agents were contending for cores. Contended
frames are false evidence, which is worse than no evidence.
**Fix.** Never capture during a wave. Bound concurrency to cores, not ambition.

### A defect survives every automated check for weeks
**Cause.** The harness bypasses the layer the defect lives in. A `setInput()` that
writes virtual input short-circuits the device path; a mirrored key mapping then
passes everything. In the recorded case the AI drove correctly the whole time
because *its* maths was right, while a comment above it asserted the opposite
convention and the keyboard mapping had been written to match the comment.
**Fix.** At least one instrument must drive the product the way a real user does.

### The probe stops measuring the thing it measures
**Cause.** Calling the harness's step/render latched the product into a bench mode.
**Fix.** Write "this probe only reads" at the top of the probe, and mean it.

### An entire surface reaches "done" having never been judged
**Cause.** The gates only drive the surface *the harness drives*. A touch layer, a
screen-reader path or a cold-start route shipped straight to main passes typecheck,
smoke and capture indefinitely, because no captured state and no ledger row has
ever pointed at it.
**Fix.** Keep a standing list of unjudged surfaces in the tick prompt, and give
each one a round of its own — its own brief, its own benchmark, its own critic —
before the board is allowed to read as green.

---

## "The parts are good and the whole isn't"

### A defect reported by five critics and closed by none
**Cause.** It lives between owners. Every critic can see it; no owner can reach it.
**Fix.** That is the coherence pass's job. See `coherence-pass.md`.

### Systems that exist and are never called
**Cause.** Piece-level critics judge the piece, not whether anything reaches it.
**Fix.** Make the coherence survey hunt `dead-end` explicitly — handlers with no
emitter, emitters with no listener, routes with no link, flags with no reader.

### A seam you closed last wave is back
**Cause.** You closed it by hand instead of promoting the value to one owner.
**Fix.** A number two modules must agree on is an interface, not a tuning
constant.

### A shared constant that still drifts
**Cause.** Something downstream rebuilds the old literal. In the recorded case the
constructor set the shared value and the next frame put the old one back.
**Fix.** A shared constant with a second copy downstream is not shared, it is
decorated. Grep for the literal, not just the symbol.

### A builder's files get edited under it
**Cause.** A coherence pass ran while a wave was in flight. Whole-repo ownership
and strict ownership cannot both be true; the builder loses silently.
**Fix.** Serialise them. Never overlap.

---

## "It works but it never ends"

### The loop runs forever
**Cause.** No termination policy.
**Fix.** `termination.md`. Plateau rule, round budget, escalation.

### A piece stops improving
**Cause.** Usually the piece's vocabulary cannot express what the critic wants.
**Fix.** Add a piece, widen a boundary, or escalate. Another round will produce
another variation on the same inadequate move.

### The builder redesigns every round
**Cause.** The carry did not say not to.
**Fix.** *"Close that gap first. Do not start a redesign."*

### Work the user parked gets started anyway
**Cause.** The loop had folded it into its definition of done, so the board going
green read as the trigger. Or the parked item's research notes sat under a heading
with no label, and a list of findings reads as a checklist.
**Fix.** A parked block that quotes the user, states the scope as negatives, says
explicitly that the build can finish without it, and labels the notes *reference,
not instructions to act on*. See `orchestrator-setup.md`.

### The board is green and the loop will not call it finished
**Cause.** A termination policy plus one permanently-open item it can never close —
usually something parked, which by definition will not close until the user asks.
**Fix.** Say it in the prompt: *if the board goes fully green and this has not been
asked for, the build is finished — say so and stop.*

---

## Process hygiene

### `pkill` takes out the live wave
**Cause.** The orchestrator and the agents run the same capture command.
**Fix.** Never kill on a pattern that matches agent tooling.

### The repo grows by tens of megabytes a day
**Cause.** Committing a raw session archive, or gzipping it. Compressed output
changes wholesale on every append so git stores a new blob each time.
**Fix.** Plain text, append-only, long tool output truncated with a marker saying
how much was cut. Never truncate a human turn. Scrub anything credential-shaped
before it reaches the repo.

### The human stops reading the updates
**Cause.** The orchestrator narrates every tick.
**Fix.** Message only when a wave lands, a wave had to be restarted, a decision is
needed, or it is finished.
