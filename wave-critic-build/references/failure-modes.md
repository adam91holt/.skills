# Failure modes

Every entry here was paid for. Read this before your first long run; come back to
it whenever something is odd and you cannot name why.

They are grouped by what the failure *feels like from the outside*, because that
is how you will meet them.

---

## "It's been quiet for a while"

### The loop stopped ticking entirely
**Cause.** The scheduler ended up living inside the session. The recorded
sequence: a `send_later` re-arm call failed **loudly** (the MCP server had
dropped) — that part was diagnosed in seconds — and the fatal move was the
fallback: an in-memory cron (`CronCreate`) accepted despite its own tool result
saying *"Session-only… dies when Claude exits"*. The container suspended; the
cron — re-created three times — never fired once. A `/loop` dies the same way,
and so did the 12-minute liveness cron: it cannot survive the thing it exists
to detect.
**Fix.** A **server-side Routine** (`create_trigger`) bound to the persistent
session — it fires server-side and revives a suspended container. And the
meta-rule: when a scheduling call fails, the replacement must be *more* durable
than what died; anything self-described as "session-only" is disqualified.
**Cost when it bites:** 67.5 hours of silence in the recorded run, bridged only
by the human asking "is it definitely still running?".

### The loop says "still running", and it is dead
**Cause.** A status question answered from inference — fresh-looking files,
browser processes alive — instead of from the liveness procedure. Both are
corpses that outlive their agents.
**Fix.** Any "is it running?" from the human triggers STEP 1 before answering.
The recorded run got this wrong twice across a single ten-hour corpse.

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
id. The loop's session was **replaced** (a persistent session keeps its id
across container restarts — replacement is the trigger, not restart), the
pinned path went stale, the tick found no runs and launched a second wave
alongside the one still building. The stale path goes bad at precisely the
moment the check exists to catch.
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
**Fix.** Never capture during a wave **on a harness that contends for the
machine** (headless browsers, GPU, heavy compile — a curl-and-SQL harness can
observe mid-wave freely). Bound concurrency to cores, not ambition.

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

### The first tick after a context compaction goes sideways
**Cause.** On a multi-day persistent session, compaction is inevitable (the
recorded run compacted after four days). Afterwards, MCP tool names may carry a
different prefix and any remembered path — WFDIR included — may be wrong; the
recorded run hit both within minutes.
**Fix.** Treat the first post-compaction tick as a fresh session: re-resolve
WFDIR by glob, re-discover MCP tools with ToolSearch, and trust only what the
tick prompt says, not what the session "remembers".

### A Stop hook commits half-written files mid-wave
**Cause.** A user-level Stop hook ("there are uncommitted changes — commit and
push") fires whenever the orchestrator finishes a reply, including while
builders are mid-flight. The recorded run committed live builders' half-written
modules five separate times this way.
**Fix.** Audit hooks before the first tick. Scope commit-forcing hooks out of
the build repo, or bind the tick rule: a hook-forced commit runs the typecheck
first and never includes files a live agent owns.

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
