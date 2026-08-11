# Fresh-context critic protocol

The critic is a new Codex subagent launched after the builder finishes. It must not inherit the builder's narrative.

## Spawn boundary

Use `fork_turns: "none"` or the smallest useful context fork. Supply only:

- repository and contract paths;
- piece name and owned files;
- named benchmark;
- review states and observation commands;
- pass score and verdict schema;
- prior whole-product directive only when it is itself the subject of verification.

Do not include the builder's final message, commit messages, suspected defects, or expected answer. Tell the critic not to edit. Use a project-defined read-only custom critic when available.

## Prompt

```text
You are a harsh, independent critic. You did not build this. Do not read builder reports or commit messages. Do not edit files. Judge only the running product and captured evidence.

PIECE: <name>
OWNED FILES: <files>
BENCHMARK: <named product and moment>
PASS SCORE: <score>

STEP 1 — Before opening this repository or product, write down from memory exactly what the benchmark does in the equivalent moment: cues, timing, sequence, feedback and user experience.

STEP 2 — Drive the real product. Run <commands>, inspect <states>, and use the appropriate viewer or browser tool on every artifact. Write a new read-only probe if the standard sheet cannot measure the property. Never infer behavior from source alone.

STEP 3 — Blind A/B. Write two unlabelled descriptions of the same moment, one from ours and one from the reference. Pick the experience you would prefer. The benchmark wins by default unless ours genuinely deserves the choice.

STEP 4 — Return exactly one JSON object matching the verdict contract. Name one biggest gap, one actionable directive, and measured observations. Seven is normal for competent work. If you can name a user-visible gap, pass is false.
```

## Verdict contract

```json
{
  "score": 0,
  "pass": false,
  "reference": "specific benchmark behavior",
  "blindPick": "ours|benchmark|tie",
  "biggestGap": "one sentence",
  "directive": "one specific next action with an observable check",
  "evidence": ["measured observation"]
}
```

The primary agent validates types and required fields. If formatting is wrong, use `followup_task` on the same critic and request corrected JSON only. Do not rerun the expensive observation.

Accept only when `pass` is true, score meets the threshold, and `blindPick` is not `benchmark`.

## Carry

Send an earned rejection back to the same builder with `followup_task`:

```text
ROUND <N>. A fresh critic rejected the running product.
Score: <score>
Blind pick: <pick>
Biggest gap: <gap>
Directive: <directive>
Observed: <evidence>

Close this gap first. Do not redesign. Stay inside your ownership. Run the gates and recapture the named states.
```

If the original builder cannot continue, spawn a replacement `worker` with the same ownership and carry. Never send a piece back with a list of unrelated findings.

## Multiple critics

Use more than one only when a mistaken verdict would be expensive. Give critics distinct lenses—correctness, performance, accessibility, security, real-device behavior—instead of cloning the same prompt. Keep standing security and accessibility lenses as separate pieces or scheduled checks.
