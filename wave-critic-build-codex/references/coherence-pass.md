# Codex coherence pass

Strict file ownership makes parallel work possible and leaves nobody responsible for the space between pieces. Run coherence after a wave lands and before the next wave starts.

## Survey → smooth → judge

1. Spawn a fresh, non-writing survey agent. Give it the whole product, benchmark, review sheet, contract, ledger gaps, and seam schema. Require it to use the product end to end.
2. Wait for every other writer to finish.
3. Spawn one `worker` with whole-repo ownership. State that it is the only agent allowed to cross piece boundaries and the only writer currently running.
4. After smoothing finishes and gates pass, spawn a new fresh-context whole-product critic. Do not pass the smoother's report.
5. Carry the whole-product verdict into the next coherence round or ledger.

Never overlap smoothing with piece builders. Codex subagents share the workspace, so the race is immediate and silent.

## Seam taxonomy

| Kind | Question |
|---|---|
| visual | Do tokens, type, density, shape, color, light and shadow form one language? |
| timing | Does the product have one rhythm and easing vocabulary? |
| tone | Does every surface speak in one voice? |
| feedback | Does every state change acknowledge itself, and only once? |
| language | Is the same concept named the same way everywhere? |
| input | Do controls retain meaning across states, with no traps? |
| continuity | Does state survive transitions and appear everywhere it should? |
| dead-end | Is anything built but unreachable, emitted but unheard, or configured but unread? |

`dead-end` is the highest-value category. Hunt handlers without emitters, emitters without listeners, routes without links, flags without readers, and branches no real flow can trigger.

## Smoother licenses

Tell the whole-repo worker:

- Do not split the difference. Pick the better existing choice and make the other match.
- Delete unreachable systems when wiring them would add no user value.
- Promote shared values into one owner and remove downstream duplicate literals.
- Preserve unrelated user changes.
- Use `apply_patch` for edits and avoid destructive resets.
- Run all gates and the full review sheet before finishing.

If the survey finds no seams immediately after multiple pieces landed, verify that it actually traversed the whole product before accepting the result.

## Whole-product judgement

Change the critic question from feature quality to coherence:

> Write down from memory what it feels like to use `<benchmark>` for the first complete task. Then use ours through the same beats. Judge the whole: excellent parts that disagree lose to good parts that form one product.

Return the standard verdict with one biggest whole-product gap.
