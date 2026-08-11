# A live tick prompt, populated

`orchestrator.prompt.md` is the template. This is what one looks like **in
flight**, on day four of a real build — every slot filled, the queue current, the
standing gaps accumulated, one item parked.

The project here is ATLAS, an issue tracker benchmarked against Linear. Nothing
about the shape is web-app specific; swap the gates and the benchmark and it is
the same document for a game, a service or a pipeline.

Read it for the *density*, which is the part that is hard to get from a template:
a live tick prompt is mostly state, because it is the loop's only memory.

---

```
ATLAS build loop — hourly. Repo acme/atlas (PRIVATE), branch claude/atlas-issue-view.
WFDIR resolves per tick — do not pin it:
  SLUG=$(pwd | sed 's|/|-|g')
  WFDIR=$(ls -dt ~/.claude/projects/$SLUG/*/subagents/workflows | head -1)
Sanity-check it: `ls -t $WFDIR | head -1` against `date -u`. A newest run that is
days old means the glob found a dead session dir, NOT that the wave is dead.
Launching a second wave on that mistake has happened twice.

EVERY TICK, before anything else: `node tools/session.mjs`. It refreshes
docs/session/prompts.md and docs/session/session.jsonl — the conversation that is
building this product, which the user asked to be published and kept current. It
exits non-zero if a message body was truncated; if that happens fix the tool
rather than committing a mangled archive. Commit the refresh with whatever else
the tick produces.

Do NOT trust any run id written here — resolve it: RUN=$(ls -t $WFDIR | head -1).
Current run: search+keyboard wave = wf_c81f0a24-9e2.

STEP 1 — PROVE the wave is alive. Two checks; the second has never been wrong:
  date -u
  ls -lt --time-style=+%H:%M:%S $WFDIR/$RUN/agent-*.jsonl | head -3
  ps -eo etime,comm | grep -w claude
(a) Newest agent-*.jsonl mtime older than ~25 minutes = dead. USE `ls -t`; a plain
    `ls | tail` sorts ALPHABETICALLY and once hid the only live agent behind
    eleven finished ones.
(b) ELAPSED of the main `claude` process. DECISIVE. If claude has been alive for
    LESS time than the gap since the last agent write, the container restarted and
    every in-flight agent is dead, however recent the mtimes look. Two agents whose
    last write is the IDENTICAL second is the same signature. Do NOT grep for
    claude in a `--sort=-pcpu | head -4` list — Chrome outranks it and it will not
    appear.
Never judge by files existing or Chrome counts: subagents run IN-PROCESS inside the
main claude process, so `ps aux | grep claude` shows nothing for a healthy wave.
Both mistakes have cost silent stalls, once of 11.5 hours.

Count: node -e "const fs=require('fs');let s=0,r=0;for(const l of fs.readFileSync(process.argv[1],'utf8').trim().split('\n')){try{const e=JSON.parse(l);if(e.type==='started')s++;if(e.type==='result')r++;}catch{}}console.log(s,r)" $WFDIR/$RUN/journal.jsonl
Concurrency is 2 on this 4-core box.

STEP 2 — If DEAD, RESUME, DO NOT RELAUNCH:
  Workflow({scriptPath:"tools/wave.workflow.mjs", resumeFromRunId:"<the dead RUN>", args:<the SAME args object, byte-for-byte>})
Completed agent() calls return from cache instantly and only the killed agents
re-run, carry intact. Args must match exactly or the cache misses and you buy the
whole wave again. First `npx tsc --noEmit`, then commit and push whatever exists
(say in the message if unverified). Read the dead run's journal for results that
already have a `score` — those verdicts are earned and must never be re-bought;
pass them forward as carry.
IF TYPECHECK FAILS INSIDE A FILE A DEAD AGENT WAS MID-WRITE ON, that is NOT
transient — the agent is not coming back to finish it, and the resumed agent
restarts that step from scratch. `git checkout --` those files rather than
committing a build that cannot compile.
AFTER ANY LAUNCH OR RESUME, VERIFY: grep 'YOUR PIECE' AND 'Observed:' out of each
new agent transcript. The first confirms the piece arrived, the second confirms
the carry did. A carry bug once dropped two of three pieces to null silently while
the wave reported itself started.

STEP 3 — If ALIVE: `npx tsc --noEmit`. If clean, commit and push. Do NOT run
`node tools/capture.mjs` while agents are active — four cores cannot serve three
headless browsers and the screenshots come out as false evidence a critic will
reason confidently from. Never pkill on any pattern matching "capture.mjs"; the
agents run that same command.

STEP 4 — If FINISHED:
  a. `npx tsc --noEmit`, then `node tools/capture.mjs --smoke`. Typecheck-clean has
     passed on a build that did not boot; smoke is the real gate.
  b. `node tools/capture.mjs` and LOOK at the PNGs with Read. Never trust an
     agent's summary.
  c. Update tools/progress.state.json with the real verdicts — the critic's own
     measured words, not a paraphrase — then `node tools/progress.mjs`.
  d. Commit, push, PR (base main, draft false), merge, then
     `git fetch origin main && git reset --hard origin/main && git push --force-with-lease`
     (merges are squashed, so ff-only will refuse).
  e. Remaining work, in order:
       - SEARCH re-judge. It scored 6.0 because ranking never read the recency
         field that indexing had been writing since wave 2 — an issue touched an
         hour ago sorted below one from March on equal text score. That wiring now
         exists; its job is to prove the top hit is the right one on the four
         seeded corpora, not to redesign the index.
       - KEYBOARD re-run, which regressed to 340ms p95 for the command palette
         when fuzzy matching moved onto the main thread.
       - Then closing verdicts on wave 1 (list density, issue detail, filters,
         empty states), merged long ago and never judged.
  f. Standing gaps no single piece owns, for the next coherence pass:
       - focus ring is three different colours across list, detail and modal;
       - optimistic updates roll back silently on failure in two of five mutations,
         so the row just reverts with no toast;
       - "archived" and "closed" are used interchangeably in copy and are different
         states in the schema.
  g. Also unjudged: tools/mobile.mjs passes, but no critic has ever used this on a
     phone. The responsive layer shipped straight to main off a bug report. When the
     board is otherwise green, a critic whose whole brief is the phone build —
     thumbs on glass, one-handed reach, against Linear's iOS app — is owed a round.
     Same for the screen-reader path, which no critic has ever opened.

RENAME TO "BEACON" — PARKED. DO NOT START IT.
The user raised it on 2026-05-14 and then said on the same day: "Just park the
rename until I ask for it." So it is NOT triggered by the board going green, NOT
part of the definition of done, and NOT something to raise again. It waits for the
user to ask for it in their own words. Do not bring it up, do not start it early,
do not fold pieces of it into other work. If the board goes fully green and the
rename has not been asked for, the build is finished — say so and stop.
The notes below exist only so the work is not re-derived when the user does ask.
They are reference, not instructions to act on.
  - It is NOT a sed. `grep -ri atlas` returns 90 hits outside docs/session, in four
    classes:
    1. PRODUCT NAME `ATLAS` / `atlas` — 31 hits across 14 files. These are the ones
       that rename: README.md, ARCHITECTURE.md, index.html, package.json,
       package-lock.json, src/ui/brand.tsx, src/ui/shell.tsx, tools/*.workflow.mjs,
       tools/progress.template.html, tools/session.mjs, and the three docs pages.
    2. `Linear` — ~120 hits. KEEP EVERY ONE. That is the design benchmark the whole
       critic loop is built on ("write the Linear reference from memory before
       looking"). A blind sed guts the project's design rationale.
    3. `atlas` the DATABASE CLUSTER and `atlas-migrate` the CLI. KEEP. Different
       noun that happens to share the string; renaming it breaks deploys.
    4. FILESYSTEM AND REPO PATHS — `/home/user/atlas`, `-home-user-atlas`,
       `github.com/acme/atlas`. KEEP unless the repo is genuinely renamed; changing
       them breaks tools/session.mjs and the workflow scripts.
  - The wordmark is the real work, not the text. src/ui/brand.tsx carries its own
    letterforms for A T L S; "BEACON" needs B E C O N, of which only C and O exist.
  - Two things to ask the user at that time, not before: whether to rename the
    GitHub repo (github.com redirects a renamed repo, but any deploy URL does not,
    so existing links 404); and whether the CLI binary renames with it, which is a
    breaking change for everyone who has it installed.

Keep waves SHORT (two pieces, two rounds) and rely on resume rather than on a wave
surviving. Stop when every piece in tools/progress.state.json is "pass" or has been
escalated under the termination policy: a piece whose score moved less than 0.5
across two rounds does not get another round — it gets escalated to me, with the
gap stated.

Message me only when a wave lands, a wave had to be restarted, something needs a
decision, or the build is finished.
```

---

## What to notice

| In the example | Why it is there |
|---|---|
| `WFDIR` resolved per tick, not pinned | The path embeds a session id and goes stale on the restart it exists to detect |
| "Current run: … wf_c81f0a24-9e2" **and** "do not trust any run id written here" | The written value is a hint for the human reading it; the resolved one is the truth |
| Every rule carries its cost — *"once hid the only live agent behind eleven finished ones"* | A rule without its cost gets deleted as noise by a later tick tidying the file |
| 4e items say **why** each is next and what it must prove | Otherwise the re-judge round redesigns the thing instead of closing the gap |
| 4f is a list of *seams*, not bugs | No piece owns them. This list is the coherence pass's entire backlog |
| 4g names surfaces nothing has judged | They pass every gate, because the gates drive the surface the harness drives |
| The parked block quotes the user verbatim | A paraphrased decision gets re-litigated; a quoted one does not |
| "the build is finished — say so and stop" | A termination policy with one permanently-open item never terminates |
| "They are reference, not instructions to act on" | Without this line, a loop with spare capacity works the list |

## What to strip when you copy it

The gate commands (`npx tsc --noEmit`, `capture.mjs`), the benchmark, the piece
names, and every number. Keep the structure, the ordering, and the rules that
carry costs — those are domain-independent and were all paid for.
