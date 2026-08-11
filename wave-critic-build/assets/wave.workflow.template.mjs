/**
 * wave.workflow.template.mjs — the builder/critic wave, domain-independent.
 *
 * Copy this into <repo>/tools/ and DO NOT EDIT IT. Everything project-specific
 * lives in the manifest it reads (see pieces.example.json). That separation is
 * deliberate: the manifest changes every wave, and a script you edit every wave
 * is a script whose `resumeFromRunId` cache never hits.
 *
 *   Workflow({
 *     scriptPath: "<repo>/tools/wave.workflow.mjs",
 *     args: {
 *       manifest: "<repo>/tools/pieces.json",   // required
 *       pieces:   ["list", "detail"],           // which ids to run this wave
 *       rounds:   2,
 *       carry:    { list: <a prior verdict> }   // verdicts earned in a dead run
 *     }
 *   })
 *
 * RESUME: pass the SAME args object byte-for-byte with resumeFromRunId. Finished
 * agents replay from cache; only the killed ones re-run.
 */

export const meta = {
  name: 'build-wave',
  description: 'Build and adversarially review a wave of pieces against a named benchmark',
  whenToUse: 'Any parallel build wave. Pass {manifest, pieces:[ids], rounds:N, carry:{}} as args.',
  phases: [
    { title: 'Build', detail: 'one owner agent per piece, strict file ownership' },
    { title: 'Judge', detail: 'fresh critic drives the real product and compares against the benchmark' },
  ],
};

// ── args ───────────────────────────────────────────────────────────────────
//
// `args` arrives as an object or as a JSON string depending on how the workflow
// was invoked. Parsing both matters more than it looks: when this read
// `args.pieces` directly, a stringified payload silently produced `undefined`,
// the script fell through to its defaults, and a wave spent ninety minutes
// rebuilding pieces that were already done — while every carried directive was
// dropped on the floor. A misrouted wave must be a LOUD failure, so anything
// unparseable throws rather than defaulting.

const input = (() => {
  if (!args) throw new Error('wave: no args. At minimum {manifest, pieces} is required.');
  if (typeof args !== 'string') return args;
  try {
    return JSON.parse(args);
  } catch (err) {
    throw new Error(`wave: args were a string but not valid JSON: ${String(err)}`);
  }
})();

if (!input.manifest) throw new Error('wave: args.manifest is required (path to pieces.json).');

// Workflow scripts have no filesystem access, so the manifest is read by an
// agent whose only job is to hand it back as structured data. One cheap call,
// and it keeps the script free of any project-specific text.
const MANIFEST = await agent(
  `Read the JSON file at ${input.manifest} and return its contents verbatim as structured output. ` +
    `Do not summarise, reformat, reorder or omit anything. Drop only keys named "$comment".`,
  {
    label: 'manifest',
    phase: 'Build',
    effort: 'low',
    schema: {
      type: 'object',
      required: ['project', 'pieces'],
      properties: {
        project: {
          type: 'object',
          required: ['name', 'repo', 'benchmark'],
          properties: {
            name: { type: 'string' },
            repo: { type: 'string' },
            benchmark: { type: 'string' },
            passScore: { type: 'number' },
            contract: { type: 'string' },
            types: { type: 'string' },
            state: { type: 'string' },
            gates: { type: 'array', items: { type: 'string' } },
            observe: { type: 'array', items: { type: 'string' } },
            rules: { type: 'array', items: { type: 'string' } },
          },
        },
        pieces: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name', 'owns', 'shots', 'brief'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              owns: { type: 'string' },
              shots: { type: 'string' },
              brief: { type: 'string' },
            },
          },
        },
      },
    },
  },
);

if (!MANIFEST) throw new Error('wave: could not read the manifest; refusing to launch blind.');

const P = MANIFEST.project;
const PASS_SCORE = P.passScore ?? 8.5;
const MAX_ROUNDS = input.rounds || 2;
const CARRY = input.carry || {};

// ── the shared preamble every agent gets ───────────────────────────────────

const COMMON = `
You are working in the repo at ${P.repo} — ${P.name}.

BEFORE YOU DO ANYTHING: read ${P.repo}/${P.contract ?? 'CONTRACT.md'} in full — it is
the contract between the many agents working here in parallel${
  P.types ? `— then ${P.repo}/${P.types}, which encodes that contract as real types` : ''
}.

Where the project is right now:
${P.state ?? '(not stated — treat the contract as the only source of truth)'}

Hard rules:
${(P.rules ?? []).map((r) => `- ${r}`).join('\n')}

Before you finish you MUST run, from ${P.repo}:
${(P.gates ?? []).map((g) => `    ${g}`).join('\n')}
Gates are not interchangeable and are listed weakest-first. A typecheck has
passed on a build that did not boot; the smoke gate is the one that proves the
product still starts. Long gates should be run in the background and polled —
do not assume they have hung.

Seeing the real product — this is how you observe it, never by reading code and
imagining the result:
${(P.observe ?? []).map((o) => `    ${o}`).join('\n')}
LOOK at the captured output with the Read tool. Never reason about what the code
probably produces — look at what it did produce.
`;

// ── the verdict ────────────────────────────────────────────────────────────

const VERDICT = {
  type: 'object',
  additionalProperties: false,
  required: ['score', 'pass', 'reference', 'blindPick', 'biggestGap', 'directive', 'evidence'],
  properties: {
    score: { type: 'number', description: `0-10. ${PASS_SCORE}+ means genuinely indistinguishable from the benchmark.` },
    pass: { type: 'boolean', description: 'true ONLY if you cannot name a gap that matters' },
    reference: { type: 'string', description: 'The specific benchmark behaviour you judged against' },
    blindPick: { type: 'string', enum: ['ours', 'benchmark', 'tie'] },
    biggestGap: { type: 'string', description: 'THE single biggest gap, one sentence. Empty only if pass.' },
    directive: { type: 'string', description: 'Exactly what the builder must change next. Specific and actionable.' },
    evidence: {
      type: 'array',
      items: { type: 'string' },
      description: 'What you actually OBSERVED — measurements from captures/traces, not code readings.',
    },
  },
};

/**
 * A verdict's `evidence` is an array in the schema, but a verdict handed in as
 * `carry` is hand-authored and arrives however the author typed it. `.join` on a
 * string is a TypeError, and a TypeError here does not fail loudly — it throws
 * inside a pipeline stage, which drops that piece to null and skips it. A wave
 * would launch, report itself started, and quietly build one piece out of three.
 */
function evidenceLine(evidence) {
  if (!evidence) return '';
  return Array.isArray(evidence) ? evidence.join(' | ') : String(evidence);
}

// ── prompts ────────────────────────────────────────────────────────────────

function buildPrompt(piece, round, last) {
  const feedback = last
    ? `
── ROUND ${round}. A critic used the previous build and rejected it. ──
Score ${last.score}/10. Blind A/B against ${P.benchmark}: ${last.blindPick}.
Biggest gap: ${last.biggestGap}
Directive: ${last.directive}
Observed: ${evidenceLine(last.evidence)}
Close that gap first. Do not start a redesign.
`
    : '';

  return `${COMMON}

── YOUR PIECE: ${piece.name} ──
YOU OWN (and may only edit): ${piece.owns}
${piece.brief}
${feedback}

If your module is new, you must also register it in the application entry point —
that is the ONE file outside your ownership you may touch, and only to add your
import and one registration line. Nothing else in it.

Work until the piece is genuinely excellent, then verify with the gates above.
Look at your own captured output before declaring done — capture the states
"${piece.shots}" into /tmp/build-${piece.id} and Read them.

Return a short report: what you changed, what you could not do inside your
ownership, and anything another module must do for this piece to land.`;
}

function judgePrompt(piece, round, dir) {
  return `${COMMON}

You are a HARSH, INDEPENDENT CRITIC. You did not build this. Do not read the
builder's report or the commit messages. Judge only what the running product does.

── PIECE UNDER REVIEW: ${piece.name} (${piece.owns}) ── round ${round}

STEP 1 — Write the reference from memory, BEFORE looking at our product at all.
From your knowledge of ${P.benchmark}, write down precisely what this piece looks
and behaves like there. Concrete and specific: exact cues, timings, what happens
step by step, what the user sees and feels. Name the exact moment you are using
as your reference. Do NOT look at our product yet.

STEP 2 — Use our product for real.
Capture the states "${piece.shots}" into ${dir} and READ every artifact with the
Read tool. Actually look. Then drive it over time to check behaviour, not just
appearance. Write your own capture script if the standard states do not show
what you need — the harness API is in the contract. Never judge from source alone.

STEP 3 — Blind A/B.
Write two unlabelled descriptions of the same moment: ours, and the ${P.benchmark}
reference from step 1. Pick which is better as a user would experience it. Our
product is new; the default expectation is that ${P.benchmark} wins. Only pick
ours if it genuinely deserves it.

STEP 4 — Verdict.
Score 0-10, where ${PASS_SCORE}+ means "I would believe this shipped as part of
${P.benchmark}". Name the SINGLE biggest gap in one sentence. Then a specific,
actionable directive — not "make it better" but a named defect with a measurement
attached, precise enough that the builder can tell whether they fixed it without
asking you a question.

Be genuinely harsh. 7 is a normal score for competent work. If you can name a gap
a user would notice, it fails.`;
}

// ── run ────────────────────────────────────────────────────────────────────

const byId = new Map(MANIFEST.pieces.map((p) => [p.id, p]));
const ids = input.pieces?.length ? input.pieces : MANIFEST.pieces.map((p) => p.id);

const missing = ids.filter((id) => !byId.has(id));
if (missing.length) throw new Error(`wave: no such piece(s) in the manifest: ${missing.join(', ')}`);

const selected = ids.map((id) => byId.get(id));

log(`Wave: ${ids.join(', ')} — up to ${MAX_ROUNDS} rounds each, pass at ${PASS_SCORE}.`);
for (const id of Object.keys(CARRY)) log(`  carrying forward a prior verdict for ${id}`);

// pipeline, not parallel: piece A may be in round 3 while piece B is in round 1.
// A barrier between build and judge would waste the fast piece's wall clock.
const results = await pipeline(selected, async (piece) => {
  let verdict = CARRY[piece.id] || null;
  let round = 0;
  const history = [];

  while (round < MAX_ROUNDS) {
    round++;

    await agent(buildPrompt(piece, round, verdict), {
      label: `build:${piece.id}${round > 1 ? ` r${round}` : ''}`,
      phase: 'Build',
    });

    verdict = await agent(judgePrompt(piece, round, `/tmp/review-${piece.id}-r${round}`), {
      label: `judge:${piece.id} r${round}`,
      phase: 'Judge',
      schema: VERDICT,
    });

    if (!verdict) {
      log(`${piece.id}: critic returned nothing on round ${round}; stopping this piece.`);
      break;
    }

    history.push({ round, score: verdict.score, blindPick: verdict.blindPick, gap: verdict.biggestGap });

    // Three independent signals that all have to agree. A critic that scores 9
    // while still picking the benchmark has contradicted itself.
    const accepted = verdict.pass && verdict.score >= PASS_SCORE && verdict.blindPick !== 'benchmark';
    log(
      `${piece.id} r${round}: ${verdict.score}/10, blind pick "${verdict.blindPick}" — ` +
        `${accepted ? 'PASSED' : `sent back: ${verdict.biggestGap}`}`,
    );

    if (accepted) return { piece: piece.id, name: piece.name, rounds: round, passed: true, verdict, history };

    // Plateau guard — see the framework doc, §9 Termination. Two rounds of
    // movement smaller than half a point means more rounds will not help, and
    // the gap belongs in front of a human or in the coherence pass.
    if (history.length >= 2) {
      const [a, b] = history.slice(-2);
      if (Math.abs(b.score - a.score) < 0.5) {
        log(`${piece.id}: score plateaued (${a.score} → ${b.score}); escalating rather than re-running.`);
        return { piece: piece.id, name: piece.name, rounds: round, passed: false, plateaued: true, verdict, history };
      }
    }
  }

  return { piece: piece.id, name: piece.name, rounds: round, passed: false, verdict, history };
});

const done = results.filter(Boolean);
log(`Wave complete: ${done.filter((r) => r.passed).length}/${done.length} passed.`);

return {
  passed: done.filter((r) => r.passed).map((r) => r.piece),
  plateaued: done.filter((r) => r.plateaued).map((r) => r.piece),
  // Feed `outstanding` straight back in as the next run's `carry`.
  outstanding: done
    .filter((r) => !r.passed)
    .map((r) => ({
      piece: r.piece,
      score: r.verdict?.score,
      gap: r.verdict?.biggestGap,
      directive: r.verdict?.directive,
      evidence: r.verdict?.evidence,
    })),
  detail: done,
};
