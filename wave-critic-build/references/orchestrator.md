# The orchestrator loop

A persistent session woken on a schedule, running a **procedure, not a request**.
It is the only thing in the system with continuity, and its job is to keep the
loop alive across an infrastructure that will kill it.

The tick prompt itself is `assets/orchestrator.prompt.md`. This file explains why
each rule is there, so you can adapt rather than copy blindly.

- **Standing one up for the first time** — prerequisites, locating `WFDIR`,
  choosing how it wakes, the bootstrap tick: `orchestrator-setup.md`.
- **What a live one looks like** on day four, every slot filled:
  `assets/orchestrator.example.md`.

One idea underpins the whole design and is worth holding while you read the rest:
**the tick prompt is the loop's only memory.** Waves die, sessions are replaced,
containers restart. The repo and the prompt survive. So the prompt carries its
state inline — current run, queue, standing gaps, parked decisions — and is
written to be correct when fired into a session that has never seen the project.

---

## The shape

```
STEP 0 — publish the session archive (only if the user asked for one)
STEP 1 — PROVE the wave is alive
STEP 2 — if DEAD: RESUME, do not relaunch
STEP 3 — if ALIVE: run the gates, commit, push, do nothing else
STEP 4 — if FINISHED: verify → look → update the ledger → merge → launch the next
```

Numbered steps, not prose. Agents follow numbered procedures far more reliably,
and a numbered procedure is something you can amend surgically when a new failure
mode appears — which it will.

Expect this prompt to grow. A real one went from ~900 characters to ~5,400 over
six days, and every added paragraph was paid for by a failure. Delete a paragraph
only once you have decided you can afford the failure it prevents.

---

## Step 1 — Liveness, and why it is hard

Judging liveness wrong is the single most expensive mistake available to an
orchestrator, because the failure is *silent*: the loop reports "still running"
forever and nobody notices for hours.

Three things that look like evidence and are not:

**Files existing.** Output files, temp dirs and browser profiles all outlive the
agents that made them. A directory full of fresh-looking artifacts proves nothing.

**Process greps.** Sub-agents frequently run *in-process* inside the parent, so a
`ps aux | grep <agent>` shows nothing for a perfectly healthy wave. And when you
do grep, do not do it inside a `--sort=-pcpu | head -N` list — a headless browser
outranks the agent process and it will not appear at all.

**Alphabetical listings.** `ls | tail` sorts alphabetically, not by time. That once
hid the only live agent behind eleven finished ones and produced a false "dead"
verdict. Use `ls -t`.

### What actually works

```bash
date -u
ls -lt --time-style=+%H:%M:%S $WFDIR/$RUN/agent-*.jsonl | head -3
ps -eo etime,comm | grep -w <agent process name>
```

**(a) Transcript mtime.** Newest agent transcript older than ~25 minutes = dead.

**(b) The age of the main agent process. This is the decisive one.** If it has
been alive for *less* time than the gap since the last agent write, the container
restarted and every in-flight agent is dead — however recent the file timestamps
look. A second signature of the same thing: two agents whose last write lands on
the *identical second*.

Also: **do not trust a run id written in the tick prompt.** It is stale the moment
a wave relaunches. Resolve it: `RUN=$(ls -t $WFDIR | head -1)`.

### Status questions get the procedure, not a recollection

When the human asks *"is it still running?"*, that question **is** STEP 1 — run
the liveness checks and answer from their output. The recorded run answered
"the builders are both running" twice from inference (new files on disk, Chrome
processes alive) while the wave had been dead for ten hours; in its own words
afterwards: *"You asking twice is what caught it, not my monitoring."* The human
poke is often the only stall detector that survives everything — never spend it
on a remembered answer.

---

## Step 2 — Resume, never relaunch

```js
Workflow({ scriptPath: "<same script>",
           resumeFromRunId: "<the dead run>",
           args: <the SAME args object, byte-for-byte> })
```

Completed agent calls replay from cache instantly; only the killed ones re-run,
carry intact. A suspend then costs the in-flight agents rather than the whole wave.

**The args must match byte-for-byte** or the cache misses and you buy the entire
wave again. This is also why the workflow script should be manifest-driven and
never edited between waves: an edited script is a script whose resume never hits.
Pass args as a **real JSON object**, never a JSON-encoded string — the recorded
run passed strings throughout, and against the original script that meant carry
never reached a single builder for three days.

**Resume is same-session only.** Only the session that launched a run can resume
it. A tick firing in a replaced or fresh session must not try — it goes straight
to the rescue path: read the dead run's journal for earned verdicts, relaunch
fresh with them as `carry`. The recorded run relaunched fresh with identical args
three times before resume entered its repertoire on day four; each relaunch
re-bought finished builder/critic pairs. Put resume in the *first* tick prompt,
not the fourth day's.

And a quiet consequence of the cache: the manifest is read by an `agent()` call,
so a resumed wave replays the **cached** manifest. Edits to `pieces.json` between
death and resume have no effect until the next fresh wave — which is what keeps
every downstream prompt byte-identical, so leave it be.

Two sharp edges:

**A dead agent's half-written file is not transient.** If a gate fails inside a
file an agent was mid-write on when it died, the agent is not coming back to
finish it — the resumed agent restarts that step from scratch. `git checkout --`
those files rather than committing something that cannot build.

**Earned verdicts must be rescued before relaunching.** If resume errors and you
must relaunch fresh, read the dead run's journal for results that already carry a
`score` and pass them forward as `carry`. A verdict costs a full critic agent.

---

## After any launch or resume: verify before walking away

Grep the new agent transcripts for the piece name and for the carried
observations. The first confirms the right piece was dispatched; the second
confirms the carry arrived.

This exists because of a specific silent failure: `args` arrived as a JSON string
rather than an object, `args.pieces` read `undefined`, the script fell through to
its defaults, and ninety minutes went into rebuilding pieces that were already
done — while every carried directive was dropped on the floor. The wave reported
itself started and looked healthy throughout.

> **Anything that can silently mis-route a wave must throw rather than default.**

---

## Step 3 — While a wave is alive, do almost nothing

Run the gates, commit, push, and stop.

**Do not run captures while agents are active.** Cores that are serving two
headless browsers cannot serve a third, and the output you get is false evidence —
which is worse than no evidence, because a critic will reason confidently from it.

**Never kill on a pattern that matches the tooling the agents run.** The
orchestrator and the agents share the capture command; a `pkill` on it takes out
the wave you are trying to nurse.

If a gate fails only inside a file a *live* agent is mid-write on, that is
genuinely transient. Commit what is ready elsewhere and wait.

---

## Step 4 — Landing a wave

```
a. Run the gates, weakest-first, and fix anything broken.
b. Capture the full review sheet and LOOK at it yourself.
c. Update the ledger with the REAL verdicts — the critic's own words.
d. Commit, push, PR, merge, resync local to the merged main.
e. Launch the next thing.
```

**(b) is not optional.** The builder's summary is the most persuasive and least
reliable artifact in the system, and the orchestrator is the last place a human
sees anything. Look at the output.

**(e) has an order**: any piece whose blocker just landed (carrying its prior
verdict) → the coherence pass if anything merged since the last one → the next
queued pieces. And the coherence pass runs **alone**.

Keep a running list in the tick prompt of **standing gaps no single piece owns**,
and carry it forward across ticks. That list is the coherence pass's backlog, and
nothing else in the system remembers it.

---

## Two things the board will not tell you

Both belong in the tick prompt, and both are invisible to a green ledger.

### Unjudged surfaces

A surface that shipped without ever facing a critic — the mobile build, the
screen-reader path, the cold start, the error states. These pass every gate, for a
reason that is structural rather than accidental:

> **The gates only drive the surface the harness drives.**

So a touch layer that shipped straight to main off a bug report can sit there for
weeks, typechecking, smoke-testing, and captured in no frame anyone looked at.
The ledger says nothing because it has no row for it.

List them explicitly. When the board is otherwise green, each is owed a round with
its own brief and its own benchmark — *thumbs on glass, one-handed, against the
benchmark's phone app* is a different critic from the one that judged the desktop
view, and it needs to be told so.

### Parked work

The user raises something, thinks better of it, and says *park that*. Write it
into the prompt in a block of its own, immediately. Three failures otherwise:

| Failure | What it looks like |
|---|---|
| The loop **starts it** | It folded the idea into its definition of done and picked it up when the board went green |
| The loop **raises it every tick** | Which trains its human to stop reading the messages |
| The analysis is **re-derived** | Parked work is usually parked *after* someone found out it was harder than it looked; that hour gets paid twice |

The block needs three parts: the verdict **with the user's own words quoted**, the
scope stated as negatives (not triggered by, not part of done, not to be raised —
plus an explicit *the build can finish without this*), and the reference notes
**labelled as reference, not instructions**. That last label is load-bearing: an
unlabelled list of findings under a heading reads as a checklist.

Full template and the reasoning: `orchestrator-setup.md`.

---

## Gates, ordered by strength

| Gate | Strength | What it proves |
|---|---|---|
| Typecheck / lint | Weak | The modules still agree about their interfaces |
| Smoke run | **Real** | It still boots and runs |
| Look at the captured output | **Truth** | It is what you think it is |

State the order explicitly everywhere, because agents reliably stop at the
cheapest green light. **A typecheck has passed on a build that did not boot.**

---

## Designing for an infrastructure that kills you

Assume the container suspends without warning — every 35–90 minutes is a realistic
figure. The adaptations generalise:

- **Keep waves short.** Two pieces, two rounds. Rely on resume, not on survival.
- **Commit whatever exists on every tick**, and say in the message when it is
  unverified.
- **Publish the conversation.** In a project where nobody hand-wrote the code, the
  prompts are closer to the source than the source is. Refresh and commit an
  archive of them every tick. Truncate long tool output with a marker rather than
  gzipping — compressed output changes wholesale on every append and git can only
  store a new blob each time, while an append-only text file deltas almost
  perfectly. Never truncate a human turn, and scrub anything credential-shaped.
- **Message the human rarely**: when a wave lands, when a wave had to be
  restarted, when something needs a decision, when it is finished. Nothing else.
  An orchestrator that narrates every tick trains its human to stop reading.
