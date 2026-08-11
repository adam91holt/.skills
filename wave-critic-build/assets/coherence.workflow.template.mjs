/**
 * coherence.workflow.template.mjs — survey → smooth → judge, domain-independent.
 *
 * The counterweight to the build waves.
 *
 * Every other agent in a wave is deliberately boxed in: strict file ownership is
 * what lets eight of them edit one repo at once without trampling each other.
 * The cost is real and it compounds — nobody owns the space *between* the
 * pieces. Two agents each pick a defensible yellow, each passes its own critic,
 * and the product ends up looking like it was made by people who never met.
 *
 * So this one runs ALONE and owns EVERYTHING. It must never be launched while a
 * build wave is in flight: whole-repo ownership and strict file ownership cannot
 * both be true at the same time, and the builder loses that race silently.
 *
 *   Workflow({
 *     scriptPath: "<repo>/tools/coherence.workflow.mjs",
 *     args: { manifest: "<repo>/tools/pieces.json", rounds: 2, prior: "<last directive>" }
 *   })
 */

export const meta = {
  name: 'coherence-pass',
  description: 'Use the product end to end and smooth the seams between pieces into one work',
  whenToUse: 'Between build waves, once the parallel builders have landed and merged. Never during one.',
  phases: [
    { title: 'Survey', detail: 'fresh agent uses the whole product and ranks the seams' },
    { title: 'Smooth', detail: 'one agent, whole-repo ownership, closes them' },
    { title: 'Judge', detail: 'fresh critic scores the product as a single work' },
  ],
};

const input = (() => {
  if (!args) throw new Error('coherence: no args. At minimum {manifest} is required.');
  if (typeof args !== 'string') return args;
  try {
    return JSON.parse(args);
  } catch (err) {
    throw new Error(`coherence: args were a string but not valid JSON: ${String(err)}`);
  }
})();

if (!input.manifest) throw new Error('coherence: args.manifest is required (path to pieces.json).');

const MANIFEST = await agent(
  `Read the JSON file at ${input.manifest} and return its "project" object verbatim as structured output. ` +
    `Do not summarise or omit anything. Drop only keys named "$comment".`,
  {
    label: 'manifest',
    phase: 'Survey',
    effort: 'low',
    schema: {
      type: 'object',
      required: ['name', 'repo', 'benchmark'],
      properties: {
        name: { type: 'string' },
        repo: { type: 'string' },
        benchmark: { type: 'string' },
        passScore: { type: 'number' },
        contract: { type: 'string' },
        types: { type: 'string' },
        gates: { type: 'array', items: { type: 'string' } },
        observe: { type: 'array', items: { type: 'string' } },
        rules: { type: 'array', items: { type: 'string' } },
      },
    },
  },
);

if (!MANIFEST) throw new Error('coherence: could not read the manifest; refusing to run blind.');

const P = MANIFEST;
const PASS_SCORE = P.passScore ?? 8.5;
const MAX_ROUNDS = input.rounds || 2;

const COMMON = `
You are working in the repo at ${P.repo} — ${P.name}.

Read ${P.repo}/${P.contract ?? 'CONTRACT.md'} in full first${P.types ? `, then ${P.repo}/${P.types}` : ''}.

How this product was built, and why you exist: it was built by many agents
working in parallel, each owning a disjoint set of files, each judged alone by a
critic who only ever looked at that one piece. That produced strong pieces. It
cannot, by construction, produce a coherent product — no agent has ever been
responsible for the space between the pieces, and no critic has ever been asked
whether the whole thing feels like one work by one team.

That is your entire job.

Driving the real product — this is how you see it, never by reading code and
imagining the result:
${(P.observe ?? []).map((o) => `    ${o}`).join('\n')}
LOOK at the captured output with the Read tool.
`;

const SEAM_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['seams', 'wholeProductVerdict'],
  properties: {
    wholeProductVerdict: {
      type: 'string',
      description: 'Does this feel like one product by one team, or a bag of good parts? Be specific.',
    },
    seams: {
      type: 'array',
      description: 'Ranked worst-first. A seam is a discontinuity BETWEEN pieces, not a flaw within one.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'kind', 'evidence', 'fix', 'severity'],
        properties: {
          title: { type: 'string' },
          kind: {
            type: 'string',
            enum: ['visual', 'timing', 'tone', 'feedback', 'language', 'input', 'continuity', 'dead-end'],
          },
          evidence: {
            type: 'string',
            description: 'What you OBSERVED, with the capture or trace that shows it. Not a code reading.',
          },
          fix: { type: 'string', description: 'The specific change, naming files.' },
          severity: { type: 'number', description: '1-5, 5 = a user would notice in the first minute' },
        },
      },
    },
  },
};

const VERDICT = {
  type: 'object',
  additionalProperties: false,
  required: ['score', 'pass', 'blindPick', 'biggestGap', 'directive', 'evidence'],
  properties: {
    score: { type: 'number', description: `0-10 for the product AS A WHOLE. ${PASS_SCORE}+ matches the benchmark.` },
    pass: { type: 'boolean' },
    blindPick: { type: 'string', enum: ['ours', 'benchmark', 'tie'] },
    biggestGap: { type: 'string' },
    directive: { type: 'string' },
    evidence: { type: 'string' },
  },
};

function surveyPrompt(round, prior) {
  return `${COMMON}
── SURVEY ROUND ${round} ──

Use the whole product, front to back, as a user would meet it: the first frame
after load, every entry point, the main task, the edge states, the finish, and
whatever comes after. Use the harness to reach each of those states and LOOK at
every one.

You are hunting SEAMS — discontinuities between pieces that no single-piece
critic could ever have seen:

- Visual: two modules that picked different accents, different corner radii,
  different fonts, different shadow language. A gradient in one panel and a flat
  fill in another. Anything that says "two authors".
- Timing: one transition holds 0.9s and another holds 0.4s; something snaps where
  everything else eases. Does the product have ONE rhythm?
- Tone: is it the same voice in the navigation, the labels, the errors and the
  empty states? One product, or three different jokes?
- Audio / feedback: does everything that changes state also acknowledge it, and
  vice versa? A state change with no feedback partner is a seam.
- Language: is the same thing called the same name everywhere — in the UI, the
  docs, the API and the code?
- Input: does a control mean the same thing in every state? Can you get stuck?
- Continuity: does state survive the transitions? Does what you selected show up
  everywhere it should?
- Dead-end: a state with no way out, a screen that never appears, a system built
  but never wired to anything that can reach it.

That last one matters most. Find the things that were BUILT BUT NEVER CONNECTED.
Ninety percent of parallel-agent work fails here: the piece exists, is good, and
nothing in the running product ever calls it. Look for handlers with no emitter,
emitters with no listener, routes with no link, flags with no reader, and
branches nothing can trigger.

${prior ? `The last judge said:\n${prior}\nStart by checking whether that is fixed.\n` : ''}
Rank worst-first by what a user meets soonest and notices hardest. Do not report
flaws that live entirely inside one piece — those have their own critics. Do not
fix anything. Survey only.`;
}

function smoothPrompt(survey, round) {
  return `${COMMON}
── SMOOTH ROUND ${round} ──

You own the WHOLE REPO. No file ownership restrictions apply to you — you are the
only agent running. That is deliberate: the seams below exist precisely because
they fall between the boxes every other agent was confined to.

A fresh user just went through the whole product and reported this:

WHOLE-PRODUCT VERDICT: ${survey.wholeProductVerdict}

SEAMS, worst first:
${survey.seams
  .map(
    (s, i) =>
      `${i + 1}. [${s.kind}, severity ${s.severity}] ${s.title}\n   evidence: ${s.evidence}\n   suggested fix: ${s.fix}`,
  )
  .join('\n')}

Fix them, worst first. Where two pieces disagree, do not split the difference —
pick the better one and make the other match it, then say which you picked and
why. If the right fix is to promote a value into a shared constant so it cannot
drift again, do that: a seam you close by hand reopens next wave. A number that
two modules must agree on is not a tuning constant, it is an interface.

Watch for the half-shared case, which is worse than not sharing at all: a shared
constant with a second copy downstream of it is not shared, it is decorated.

You are allowed, and encouraged, to DELETE. A system built but never reachable is
worse than no system: it costs runtime, it costs the next agent's reading time,
and it makes the repo lie about what the product is. Wire it up or take it out.

Hard rules that still bind you:
${(P.rules ?? []).map((r) => `- ${r}`).join('\n')}

Before you finish you MUST run, from ${P.repo}:
${(P.gates ?? []).map((g) => `    ${g}`).join('\n')}
Then capture the full review sheet and LOOK at it. Typecheck-clean is a weaker
gate than it feels — it has passed on a build that did not boot. The smoke run is
the real gate, because it is the one that proves the product still starts.`;
}

function judgePrompt(round) {
  return `${COMMON}
── WHOLE-PRODUCT JUDGEMENT, ROUND ${round} ──

You are a harsh critic with fresh eyes. You have never seen this project. You do
not get the builder's summary and you must not read their report — you use the
product.

STEP 1 — Before you look at anything in this repo, write down from memory what it
feels like to sit down with ${P.benchmark} for ninety seconds: the first screen,
finding your way, doing the main task, the edges, finishing. Not the graphics —
the FEEL of the whole thing. Its rhythm, its confidence, how it never once makes
you wonder what to press. Write that FIRST, because after you have looked at ours
you will unconsciously grade on a curve.

STEP 2 — Now drive our product through every one of those same beats. Capture and
READ the output. Do not reason about what the code produces.

STEP 3 — Blind A/B. Put our moment beside the ${P.benchmark} moment it
corresponds to, and say plainly which one you would rather be using. Judge the
WHOLE, not the pieces: a product of eight excellent parts that do not agree with
each other loses to one of seven good parts that do.

STEP 4 — Verdict. Score the product as a single work. ${PASS_SCORE}+ means "I
would believe this shipped as part of ${P.benchmark}". Name the SINGLE biggest gap
in one sentence, then a directive specific enough to act on without asking a
question.

Be genuinely harsh. 7 is a normal score for competent work. The question is not
"is this impressive for the effort" — it is "is this ONE product, and is it as
good as the one it is measured against".`;
}

// ── run ────────────────────────────────────────────────────────────────────

let prior = input.prior || null;
const history = [];

for (let round = 1; round <= MAX_ROUNDS; round++) {
  const survey = await agent(surveyPrompt(round, prior), {
    label: `survey r${round}`,
    phase: 'Survey',
    schema: SEAM_SCHEMA,
  });

  if (!survey) {
    log(`round ${round}: survey agent died — stopping rather than smoothing blind`);
    break;
  }

  log(`round ${round}: ${survey.seams.length} seam(s); worst = ${survey.seams[0]?.title ?? 'none'}`);

  if (survey.seams.length === 0) {
    log('no seams reported — going straight to judgement');
  } else {
    await agent(smoothPrompt(survey, round), { label: `smooth r${round}`, phase: 'Smooth' });
  }

  const verdict = await agent(judgePrompt(round), { label: `judge r${round}`, phase: 'Judge', schema: VERDICT });

  if (!verdict) {
    log(`round ${round}: judge died — no verdict, treating the round as unproven`);
    break;
  }

  history.push({ round, seams: survey.seams.length, worst: survey.seams.slice(0, 5), verdict });
  log(`round ${round}: ${verdict.score}/10, blind pick "${verdict.blindPick}" — ${verdict.biggestGap}`);

  // Same three-signal gate as the wave: a judge that scores 9 while still
  // picking the benchmark has contradicted itself, and the whole-product
  // verdict is where a self-contradicting pass costs the most.
  if (verdict.pass && verdict.score >= PASS_SCORE && verdict.blindPick !== 'benchmark') {
    log(`coherence passed at round ${round}`);
    return { passed: true, rounds: round, history };
  }

  prior = `score ${verdict.score}/10. biggest gap: ${verdict.biggestGap}. directive: ${verdict.directive}`;
}

return { passed: false, rounds: history.length, history, lastDirective: prior };
