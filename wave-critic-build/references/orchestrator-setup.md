# Standing the loop up

`orchestrator.md` explains what the tick prompt says and why. This file is the
setup procedure: how to get from "I have a manifest and a harness" to "it is
building unattended and I can close the laptop".

Budget an hour. Most of it is Step B and Step E.

---

## The one idea that decides every other choice

> **The tick prompt is the loop's only memory.**

Everything else in the system is disposable. Waves die. Sessions are suspended
and replaced. The container restarts and takes every in-flight agent with it.
What survives is the repo and the prompt.

So write the prompt for the worst case: **a fresh agent, with no history of this
project, woken into a repo it has never seen, must run a correct tick from the
prompt alone.** That is why a live tick prompt looks so unlike a normal
instruction — it carries the current run, the queue, the standing gaps and the
parked decisions inline. It is not verbose. It is the state file.

Test for whether yours is written correctly:

> If this prompt fired into a brand-new session that had never seen the project,
> would the tick still be correct?

If the answer depends on something the last session remembers, that thing belongs
in the prompt.

---

## Before the first tick

Do not schedule anything until all of these are true. A loop started early does
not idle politely — it builds, and you throw the work away.

| # | Have | Check |
|---|---|---|
| 1 | The five preconditions of Phase 0 | `references/preconditions.md` |
| 2 | A manifest with disjoint ownership globs | `assets/pieces.example.json` |
| 3 | The wave script in `tools/`, unedited | `assets/wave.workflow.template.mjs` |
| 4 | One wave launched **by hand** and landed | You need to have watched it once |
| 5 | Gate commands that run clean on a fresh clone | Typecheck, smoke, capture |
| 6 | A ledger file the loop can write | `tools/progress.state.json` or equivalent |

**Number 4 is not optional.** The orchestrator's whole job is judging whether a
wave is alive, resuming it, and landing it. You cannot write that procedure for a
system you have not yet watched run once, and every attempt to skip this step
produces a tick prompt that describes an imagined failure mode rather than the
real one.

---

## Step A — Put the prompt in the repo, not in the scheduler

Write the tick prompt to a file the loop can read **and edit**:

```
tools/tick.prompt.md
```

Then the scheduled message is a pointer, and it never changes again:

```
Read tools/tick.prompt.md and execute it. It is a procedure, not a request.
```

This one indirection buys three things:

- **The prompt is versioned.** You can see when a rule was added and what stall
  it was paid for.
- **The loop can amend its own instructions durably.** A tick that discovers a
  new failure mode edits the file and commits it, and the next tick — in a
  different session — inherits the lesson. A prompt pasted into a scheduler is
  frozen; a prompt in the repo learns.
- **You can edit it between ticks** without touching the schedule, which matters
  because you will, most days.

If your scheduler only accepts inline text, keep the file anyway and paste from
it. The file is the source.

---

## Step B — Resolve WFDIR

`WFDIR` is the directory holding the workflow run directories. Liveness checks
read it every tick, so getting it wrong disables the loop's only real safety
mechanism.

**The authoritative source is the Workflow tool result itself.** It reports its
transcript directory and run id when you launch. Take the path from there on your
hand-launched wave (Step 4 above) and confirm it before writing it into the
prompt.

For Claude Code the layout is:

```
~/.claude/projects/<cwd with every "/" replaced by "-">/<session-uuid>/subagents/workflows/
└── wf_<run-id>/
    ├── agent-<id>.jsonl        ← liveness is read from these mtimes
    ├── agent-<id>.meta.json
    └── journal.jsonl           ← one line per agent start/result; earned scores live here
```

So for a project at `/home/user/atlas`, `WFDIR` ends up as
`~/.claude/projects/-home-user-atlas/<session-uuid>/subagents/workflows`.

Derive it, then **verify it is the live one**:

```bash
SLUG=$(pwd | sed 's|/|-|g')
WFDIR=$(ls -dt ~/.claude/projects/$SLUG/*/subagents/workflows 2>/dev/null | head -1)
ls -t "$WFDIR" | head -3          # should show wf_* run dirs, newest first
```

### The trap: WFDIR contains a session id

The path embeds the *session* that launched the workflow. Be precise about what
invalidates it, because the recorded run shows both sides: a **persistent
session keeps its id across container restarts and even context compaction** —
a pinned WFDIR there survived days of suspends — but the moment the loop runs
in a **replaced session** (a fresh-session Routine, a new session taking over,
a relaunched loop), the pinned path points at the dead session's directory. The
symptom is a tick that reports "no runs found" and cheerfully launches a
duplicate wave alongside the one still running. Since nothing guarantees the
session running a future tick is the one that launched the wave, treat the
pinned path as a hint and resolve the real one every tick.

Two ways to handle it, and you want both:

- **Resolve by glob each tick** (`ls -dt .../*/subagents/workflows | head -1`)
  rather than pinning a literal path.
- **Sanity-check the result against the clock.** `ls -t "$WFDIR" | head -1` then
  compare its mtime to `date -u`. A newest run that is days old means the glob
  found a stale session directory, not that the wave is dead.

The same staleness rule already applies to the run id — never trust one written
in the prompt, always `RUN=$(ls -t $WFDIR | head -1)`.

### Portability

The commands in the tick prompt template are GNU/Linux, because that is where
these loops usually run. On macOS:

| Linux | macOS |
|---|---|
| `ls -lt --time-style=+%H:%M:%S` | `ls -lTt`, or `stat -f '%Sm %N' -t '%H:%M:%S'` |
| `ps -eo etime,comm` | works as-is |

Fix these when you write the prompt, not when the first stall happens. A liveness
command that errors is read by an agent as "no evidence of death".

---

## Step C — Choose how it wakes

> **The scheduler must live outside the thing it schedules.** Anything that runs
> inside the session — an in-memory cron, a re-armed reminder chain, a `/loop` —
> dies in exactly the event it exists to detect.

This is the most expensive lesson in the recorded run, and it dwarfs every wave
stall: the loop went silent for **67.5 hours**, bridged only by the human asking
"is it definitely still running?". The chain: an hourly `send_later` re-arm
worked seven times, then one re-arm call failed (the MCP tool's name had changed
mid-session) and the chain was dead. The fallback was the harness cron — whose
own tool result says *"Session-only (not written to disk, dies when Claude
exits)"* — and the container suspended, taking the cron with it. So did the
12-minute liveness cron: *"it's in-memory, so it can't survive the thing it
exists to detect."* What fixed it, permanently, was a **server-side Routine**:
*"Routines are server-side — they survive suspension and wake the session,
unlike the in-memory cron. That's the actual fix."* It then fired hourly without
a miss for the rest of the build.

Durability hierarchy, most durable first:

| Mechanism | Session continuity | Survives suspend/restart | Verdict |
|---|---|---|---|
| **Server-side Routine** (`create_trigger`, claude-code-remote MCP) bound to the persistent session | Same session, full history | **Yes — fires server-side and revives the container** | **The default for anything unattended** |
| Server-side Routine, fresh session per fire | None — each tick starts cold | Yes | Works; every tick pays the cold-start, and resume is unavailable (see below) |
| `send_later` re-arm chain | Same session | The *pending* one survives — but every tick must successfully re-arm, and one failed call kills the loop silently | Acceptable short-term; know its failure mode |
| In-session cron (`CronCreate`) or `/loop 1h <pointer>` | Same session | **No — in-memory, dies with the container** | Supervised, same-day work only |
| System cron → CLI headless | Fresh session each tick | Yes | You own the box and want it outside the app |

Hourly is the right default (for Routines it is also the minimum interval). It
is long enough that a wave makes real progress between ticks and short enough
that a dead wave costs one hour, not a night.

> Whichever you pick, **write the prompt for the fresh-session case.** Even a
> persistent session loses its history to context compaction — the recorded run
> hit that on day four — and a prompt that quietly depends on continuity fails
> in the one scenario it exists to handle.

Two corollaries. The loop must be idempotent per tick: two ticks firing against
the same state — which happens after a restart — must not produce two waves;
that is what the STEP 1 liveness check protects. And **resume is same-session
only**: a wave can only be resumed from the session that launched it, so a
fresh-session tick that finds a dead run skips straight to journal-rescue —
read the earned verdicts out of the dead run's journal and relaunch with them
as `carry` — rather than discovering the constraint as an error.

---

## Step D — The bootstrap tick

Run the first tick **by hand, yourself**, with the wave already running, and read
what the agent does with it. You are not testing the build; you are testing
whether the procedure is followable.

Watch for the three tells that the prompt is not yet a procedure:

- **It asks you a question.** Some slot is empty. Fill it.
- **It reports rather than acts** — "the wave appears to be running" with nothing
  committed. The step's action verb is missing.
- **It skips to the cheapest gate.** If it typechecks and stops, the ordering of
  gates is not explicit enough. Say *weakest first, and the smoke run is the real
  gate* in the step itself, not in a preamble.

Then break it on purpose: kill the wave mid-flight and fire the tick again. It
should resolve the run, judge it dead by process age, and resume — not relaunch.
**If it relaunches, that is the single most expensive bug in the system** and you
want it now rather than at 3am, because a relaunch re-buys every verdict the dead
run already earned.

---

## Step E — Prove the loop, not just the wave

For the first few hours, check that the *loop* is healthy — a distinct question
from whether the wave is.

```bash
git log --oneline --since='3 hours ago' | head        # is it committing every tick?
ls -t $WFDIR | head -5                                # one run per wave, or duplicates?
```

Three failure signatures to look for:

| You see | It means |
|---|---|
| No commits for several ticks, no messages | The loop is stalling silently — usually a liveness check that errors |
| Two `wf_*` dirs created minutes apart | A tick launched a duplicate wave; the liveness check is not working |
| A message every single tick | The reporting rule is too loose; you will stop reading it within a day |

That last one is a real failure, not a cosmetic one. An orchestrator that
narrates every tick trains its human to ignore it, and then a genuine "this needs
a decision" message goes unread for a night.

---

## Keeping the prompt current

The tick prompt is a **living document**, and keeping it so is part of the loop's
job, not yours. Expect it to grow — a real one went from ~900 characters to
~5,400 over six days, and every paragraph was paid for by a failure.

Four things the loop should rewrite as it goes:

1. **The current run line** — what it believes is in flight.
2. **The queue in STEP 4e** — remaining work, in order, each with the reason it
   is next and the verdict it carries.
3. **The standing gaps in STEP 4f** — defects no single piece owns. Nothing else
   in the system remembers these; the coherence pass reads them as its backlog.
4. **Newly discovered failure modes** — as a numbered rule in the step where it
   bit, with the cost recorded. *"USE `ls -t`; a plain `ls | tail` sorts
   ALPHABETICALLY and once hid the only live agent behind eleven finished ones."*
   The cost is what stops a later tick from deleting the rule as noise.

Add one more heading once the board is mostly green:

**Unjudged surfaces.** A delivery surface that shipped without ever facing a
critic — the mobile build, the screen-reader path, the cold-start experience, the
error states. These pass every gate, because the gates test the surface the
harness drives. They have simply never been *judged*. Note them explicitly and
give each one a critic round when the board is otherwise green, or the loop will
declare victory over the only surface it ever looked at.

---

## Parking work

At some point the user will raise something, think better of it, and say *park
that*. Write it into the prompt immediately, in a block of its own, or one of
three things happens:

- the loop **starts it** when the board goes green, having folded it into its
  idea of done;
- the loop **raises it every tick** — the reporting failure above, now on a
  schedule;
- the analysis already done gets **re-derived from scratch** when the user
  finally does ask, because nothing kept it.

The block has three parts and needs all three:

```
<THING> — PARKED. DO NOT START IT.
The user raised it on <date> and then said, on the same day: "<their exact
words>". So it is NOT triggered by the board going green, NOT part of the
definition of done, and NOT something to raise again. It waits for the user to
ask for it in their own words. If the board goes fully green and this has not
been asked for, the build is finished — say so and stop.

The notes below exist only so the work is not re-derived when the user does ask.
They are reference, not instructions to act on.
  - <what you already worked out: the real scope, the traps, the counts>
  - <the questions to put to the user at that time, not before>
```

1. **The verdict, with provenance and the user's own words.** A parked item in
   your paraphrase gets re-litigated; quoted, it does not.
2. **The negative scope, stated as negatives.** Not triggered by, not part of
   done, not to be raised. Then say what *does* unpark it: the user asking, in
   their own words. And say explicitly that the build can finish without it —
   otherwise a loop with a termination policy hunts for the one item it can never
   close.
3. **The reference notes, labelled as reference.** This label is load-bearing. An
   unlabelled list of findings under a heading reads as a checklist, and a loop
   with spare capacity will work it.

The notes are worth keeping detailed, because parked work is usually parked
*after* someone found out it was harder than it looked. A rename that turns out
not to be a `sed` — product name, benchmark references that must be kept, domain
nouns that merely share the string, filesystem paths that would break tooling —
is an hour of analysis. Losing it costs that hour twice.

---

## Setup failure modes

| Symptom | Cause | Fix |
|---|---|---|
| The loop stops ticking entirely, for hours or days | The scheduler lived inside the session — an in-memory cron or a re-arm chain with one failed link | A server-side Routine. Cost when it bit: 67.5 hours, caught by the human, not the loop |
| The loop answers "still running" and it is dead | A status question answered from inference, not from the liveness procedure | Any "is it running?" runs STEP 1 first |
| Tick asks a question instead of acting | An unfilled slot in the prompt | Fill every `<angle bracket>` before scheduling |
| Duplicate waves running | `WFDIR` stale after a session restart | Resolve by glob, sanity-check against `date -u` |
| "No runs found", then a fresh launch | Same as above | Same as above |
| Liveness command errors, tick proceeds anyway | GNU flags on macOS | Fix portability; make an erroring check fail loudly |
| Loop relaunches instead of resuming | STEP 2 not explicit, or args not byte-identical | Test by killing a wave during bootstrap |
| Rules keep getting dropped from the prompt | Rules recorded without their cost | Record what each one cost when it was absent |
| Parked work gets started | No parked block, or notes not labelled as reference | The three-part block above |
| Nobody reads the loop's messages | It messages every tick | Wave landed / wave restarted / needs a decision / finished. Nothing else |
