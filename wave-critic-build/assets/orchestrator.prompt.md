# The orchestrator tick prompt

The scheduled prompt that drives the whole build. Fire it into a **persistent
session** (so it resumes the same conversation each time) on an hourly cron.

Everything in it is a procedure, not a request. It started at ~900 characters
and grew to ~5,400 as the failure modes revealed themselves — each paragraph
below exists because its absence cost a stall. Delete a paragraph only after you
have decided you can afford the failure it prevents.

Substitute `<ANGLE_BRACKETS>`. Keep the STEP numbering: agents follow numbered
procedures far more reliably than prose.

**How to stand it up** — locating `WFDIR`, choosing the wake mechanism, the
bootstrap tick — is `references/orchestrator-setup.md`. For what this looks like
once it has been running for days, with every slot filled, see
`orchestrator.example.md`; the density there is the part a template cannot show.

Remember what you are writing: **the tick prompt is the loop's only memory.** The
session that runs the next tick may never have seen this project. Anything the
tick needs that the last session merely *remembered* belongs in this file.

---

```
<PROJECT> build loop — hourly. Repo <owner/repo>, branch <branch>.
WFDIR resolves per tick — do not pin it (the path embeds a session id and goes
stale on exactly the restart you need to detect):
  <the resolve command for your harness, e.g.
   SLUG=$(pwd | sed 's|[^A-Za-z0-9]|-|g')   # EVERY non-alphanumeric becomes "-", not just "/"
   WFDIR=$(ls -dt ~/.claude/projects/$SLUG/*/subagents/workflows | head -1)>
Sanity-check it: newest run in $WFDIR against `date -u`. A newest run that is days
old means the glob found a dead session dir, NOT that the wave is dead.

STEP 0 — <only if the user asked for a published conversation archive; delete
this step if they have not>. Run `node tools/session.mjs` before anything else.
It refreshes the conversation archive — the prompts that are building this
product, which are closer to the source than the code is. It exits non-zero if a
message body was truncated; if that happens fix the tool rather than committing
a mangled archive. Commit the refresh with whatever else the tick produces.

Do NOT trust any run id written here — resolve it: RUN=$(ls -t $WFDIR | head -1).
Current run: <what you believe is running>.

STEP 1 — PROVE the wave is alive. Two checks; the second has never been wrong:
  date -u
  ls -lt --time-style=+%H:%M:%S $WFDIR/$RUN/agent-*.jsonl | head -3
  ps -eo etime,comm | grep -w <agent process name>
(a) Newest agent transcript mtime older than ~25 minutes = dead. USE `ls -t`; a
    plain `ls | tail` sorts ALPHABETICALLY and once hid the only live agent
    behind eleven finished ones.
(b) ELAPSED of the main agent process. DECISIVE. If it has been alive for LESS
    time than the gap since the last agent write, the container restarted and
    every in-flight agent is dead, however recent the mtimes look. Two agents
    whose last write is the IDENTICAL second is the same signature. Do NOT grep
    for it inside a `--sort=-pcpu | head -4` list — the browser outranks it and
    it will not appear.
Never judge by files existing or browser process counts: sub-agents run
IN-PROCESS inside the main agent process, so `ps aux | grep <agent>` shows
nothing for a perfectly healthy wave. Both mistakes have cost silent stalls of
11.5 and 2.5 hours.

Count what has finished:
  node -e "const fs=require('fs');let s=0,r=0;for(const l of fs.readFileSync(process.argv[1],'utf8').trim().split('\n')){try{const e=JSON.parse(l);if(e.type==='started')s++;if(e.type==='result')r++;}catch{}}console.log(s,r)" $WFDIR/$RUN/journal.jsonl
Concurrency is <N> on this <M>-core box.

STEP 2 — If DEAD: RESUME, DO NOT RELAUNCH.
  Workflow({scriptPath:"<script>", resumeFromRunId:"<the dead RUN>", args:<the SAME args object, byte-for-byte>})
Completed agent calls return from cache instantly and only the killed agents
re-run, carry intact. Re-pass the EXACT args value the run was launched with,
verbatim — the cache is keyed on each agent call's prompt, and identical args
into an unedited script are what keep those prompts identical. (The script
parses object or JSON-string args and throws on anything else; the historical
three-day carry starvation came from a script that read a stringified args
without parsing it.)
RESUME IS SAME-SESSION ONLY. If this tick is not running in the session that
launched the dead run (fresh-session Routine, replaced session), do not try it:
go straight to the journal-rescue below and relaunch fresh with the earned
verdicts as carry.
First run the gates, then commit and push whatever exists (say in the message if
it is unverified). Read the dead run's journal for results that already have a
`score` — those verdicts are EARNED and must never be re-bought; pass them
forward as `carry`.
IF A GATE FAILS INSIDE A FILE A DEAD AGENT WAS MID-WRITE ON, that is NOT
transient — the agent is not coming back to finish it, and the resumed agent
restarts that step from scratch. `git checkout --` those files rather than
committing something that cannot build.
Relaunch fresh ONLY if resume errors, and then pass the earned verdicts as carry.
AFTER ANY LAUNCH OR RESUME, VERIFY BEFORE WALKING AWAY: grep 'YOUR PIECE' and
'Observed:' out of each new agent transcript. The first confirms the piece
arrived, the second confirms the carry arrived (an 'Observed: undefined' means
it did not). A carry bug once dropped two of three pieces to null silently
while the wave reported itself started.
IF VERIFICATION FAILS: stop the run by its task id (TaskStop), fix the args or
carry, relaunch with the same carry. Never pkill — the agents share your
tooling's process names.

STEP 3 — If ALIVE: run the gates. If clean, commit and push, and do nothing else.
If a gate fails ONLY inside a file an agent is mid-write on, that is transient —
commit anything under tools/ that is ready and wait. On a harness that contends
for the machine (headless browsers, GPU, heavy compile), do NOT run captures
while agents are active — the output is false evidence; a curl-and-SQL harness
may observe mid-wave freely. Never `pkill` on any pattern matching the capture
command — the agents run that same command.

If I ask for something while a wave or pass is in flight: touch only files no
piece owns. If the request needs owned files, TaskStop the run, do the work,
then RESUME it — same session, same args; completed agents come back from
cache. That is cheaper than fighting a builder for its files.
If a Stop hook forces a commit while a wave is alive: run the typecheck first,
and never commit files a live agent owns.

STEP 4 — If FINISHED:
  a. Run the gates weakest-first, and fix anything broken. Typecheck-clean has
     passed on a build that did not boot; the smoke run is the real gate.
  b. Capture the full review sheet and LOOK at the output with the Read tool.
     Never trust an agent's summary.
  c. Update the ledger with the REAL verdicts — the critic's own measured words,
     not a paraphrase — then re-render the board. The board's artifact URL is
     <url> — republish WITH that url parameter; publishing by file path alone
     from a replaced session mints a new link and strands the human's bookmark.
  d. Commit, push, open a PR, and MERGE IT IN THE SAME TICK, then resync local
     to the merged main. Nobody is coming to review — an open PR here is not
     "awaiting review", it is a stalled loop (the recorded run's first PR sat
     open 27 hours and warped a whole day of ticks around watching it). Merge
     every wave.
  e. Launch the next thing, in this order:
       - any piece whose blocker has just landed, carrying its prior verdict
       - the COHERENCE PASS if pieces have merged since the last one. It must run
         ALONE — whole-repo ownership, so no build wave in flight.
       - the next queued pieces
  f. Standing gaps no single piece owns, for the next coherence pass:
       <list them here, and keep this list current across ticks>
  g. Unjudged surfaces — shipped, passing every gate, never actually judged:
       <the mobile build, the screen-reader path, the cold start, the error
        states — whatever no critic has ever opened. They pass because the gates
        drive the surface the harness drives. When the board is otherwise green,
        each is owed a critic round with its own brief and its own benchmark.>

<PARKED WORK — one block per item, or delete this section if there is none.>
<THING> — PARKED. DO NOT START IT.
The user raised it on <date> and then said, on the same day: "<their exact words>".
So it is NOT triggered by the board going green, NOT part of the definition of
done, and NOT something to raise again. It waits for the user to ask for it in
their own words. Do not bring it up, do not start it early, do not fold pieces of
it into other work. If the board goes fully green and this has not been asked for,
the build is finished — say so and stop.
The notes below exist only so the work is not re-derived when the user does ask.
They are reference, not instructions to act on.
  - <the real scope, the traps, the counts — what you already worked out>
  - <the questions to put to the user at that time, not before>

Keep waves SHORT (two pieces, two rounds) and rely on resume rather than on a
wave surviving. Stop when every piece in the ledger is "pass" or has been
escalated under the termination policy: a piece whose score moved less than 0.5
across two rounds does not get another round — it gets escalated to me, with the
gap stated.

If I ask "is it still running?" — or any status question — run STEP 1 and answer
from its output, never from memory or from files existing. This loop once told
its human "the builders are both running" twice while the wave had been dead for
ten hours; the human's second ask was what caught it, not the monitoring.

Message me only when a wave lands, a wave had to be restarted, something needs a
decision, or the build is finished.
```

---

## Why each rule is there

| Rule | The failure it prevents |
|---|---|
| Args re-passed verbatim on resume | The cache is per agent call (prompt + opts): identical args to an unedited script keep prompts identical; an unparsed stringified args once starved every builder of carry for three days |
| Resume is same-session only | A replaced session burns its tick on a resume that can only error |
| Status questions run STEP 1 first | The loop told its human "running" twice over a 10-hour corpse |
| TaskStop → fix → relaunch when verification fails | The recorded run caught a carry TypeError 40 seconds after launch and saved the wave this way |
| Mid-wave user requests: unowned files only, or TaskStop-work-resume | The orchestrator edited a live builder's file and a live wave's script; the second invalidated the resume cache and re-bought a round |
| Merge in the same tick | The first PR sat open 27 hours; a day of ticks was structured around watching it |
| Resolve the run id, never trust the prompt | The prompt is stale the moment a wave relaunches |
| `ls -t`, not `ls \| tail` | Alphabetical sort hid the only live agent behind eleven finished ones |
| Liveness by **process age** | Files and browsers outlive the agents that made them — 11.5h stall |
| Resume, don't relaunch | A relaunch re-buys verdicts that were already earned |
| Byte-identical args | The resume cache misses on any difference, silently |
| `git checkout --` a dead agent's half-written file | The resumed agent restarts that step; the fragment is dead weight |
| Grep the new transcripts | A silent carry bug built one piece of three and reported success |
| No captures while agents are active | Contended cores produce frames that are false evidence |
| Never `pkill` the capture pattern | The orchestrator and the agents share that command |
| Coherence runs alone | Whole-repo and strict ownership cannot both be true |
| Look at the output yourself | The builder's summary is the most persuasive, least reliable artifact |
| Plateau escalation | Otherwise the loop never terminates (see framework §9) |
| Resolve `WFDIR`, never pin it | The path embeds a session id; a restart makes it stale and the tick launches a duplicate wave |
| Name the unjudged surfaces | They pass every gate — the gates only drive the surface the harness drives |
| Park work in a block, quoting the user | Otherwise it gets started when the board goes green, or raised every tick, or re-derived from scratch |
| Label parked notes "reference, not instructions" | An unlabelled findings list reads as a checklist, and a loop with spare capacity works it |
| "The build is finished — say so and stop" | A termination policy with one permanently-open item never terminates |
