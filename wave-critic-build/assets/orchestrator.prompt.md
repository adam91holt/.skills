# The orchestrator tick prompt

The scheduled prompt that drives the whole build. Fire it into a **persistent
session** (so it resumes the same conversation each time) on an hourly cron.

Everything in it is a procedure, not a request. It started at ~900 characters
and grew to ~5,400 as the failure modes revealed themselves — each paragraph
below exists because its absence cost a stall. Delete a paragraph only after you
have decided you can afford the failure it prevents.

Substitute `<ANGLE_BRACKETS>`. Keep the STEP numbering: agents follow numbered
procedures far more reliably than prose.

---

```
<PROJECT> build loop — hourly. Repo <owner/repo>, branch <branch>.
WFDIR=<absolute path to the workflow run directory>

EVERY TICK, before anything else: `node tools/session.mjs`. It refreshes the
conversation archive — the prompts that are building this product, which are
closer to the source than the code is. It exits non-zero if a message body was
truncated; if that happens fix the tool rather than committing a mangled archive.
Commit the refresh with whatever else the tick produces.

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
re-run, carry intact. Args must match exactly or the cache misses and you buy the
whole wave again.
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
arrived, the second confirms the carry arrived. A carry bug once dropped two of
three pieces to null silently while the wave reported itself started.

STEP 3 — If ALIVE: run the gates. If clean, commit and push, and do nothing else.
If a gate fails ONLY inside a file an agent is mid-write on, that is transient —
commit anything under tools/ that is ready and wait. Do NOT run captures while
agents are active (the cores cannot serve three headless browsers, and the output
is false evidence), and never `pkill` on any pattern matching the capture command
— the agents run that same command.

STEP 4 — If FINISHED:
  a. Run the gates weakest-first, and fix anything broken. Typecheck-clean has
     passed on a build that did not boot; the smoke run is the real gate.
  b. Capture the full review sheet and LOOK at the output with the Read tool.
     Never trust an agent's summary.
  c. Update the ledger with the REAL verdicts — the critic's own measured words,
     not a paraphrase — then re-render the board.
  d. Commit, push, open a PR, merge it, then resync local to the merged main.
     Merge every wave.
  e. Launch the next thing, in this order:
       - any piece whose blocker has just landed, carrying its prior verdict
       - the COHERENCE PASS if pieces have merged since the last one. It must run
         ALONE — whole-repo ownership, so no build wave in flight.
       - the next queued pieces
  f. Standing gaps no single piece owns, for the next coherence pass:
       <list them here, and keep this list current across ticks>

Keep waves SHORT (two pieces, two rounds) and rely on resume rather than on a
wave surviving. Stop when every piece in the ledger is "pass" or has been
escalated under the termination policy: a piece whose score moved less than 0.5
across two rounds does not get another round — it gets escalated to me, with the
gap stated.

Message me only when a wave lands, a wave had to be restarted, something needs a
decision, or the build is finished.
```

---

## Why each rule is there

| Rule | The failure it prevents |
|---|---|
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
