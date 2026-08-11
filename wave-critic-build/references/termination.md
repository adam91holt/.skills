# Termination — deciding how it ends

**Decide this before you start.** It is the one part of the design that cannot be
retrofitted comfortably, because by the time you need it you have a loop that is
producing real value and no principled reason to stop it.

---

## The loop as usually specified does not terminate

"Keep going until a critic is wowed", measured against a shipped benchmark, is an
asymptote rather than a finish line. Critics keep finding real things, because
each fix hands the next critic a better product to be harsh about.

The numbers from a real run: six days, roughly 90 builder/critic pairs, 17 pieces.
**Zero passed** against a bar of 8.5. Scores climbed steadily from 5.5 toward 7.5
and the whole-product judgement reached 7.0. Every round produced specific,
measured, actionable findings.

That is the loop **working**. It is also a project with no end date, and if you
have not decided in advance what "done" means, you will either stop arbitrarily or
not stop at all.

---

## A workable policy

```
A piece is DONE when any of:
  (a) the critic cannot name a gap                       → pass
  (b) score plateaus: Δ < 0.5 across two rounds          → escalate, do not re-run
  (c) the gap names something outside the piece's scope  → new piece, or coherence
  (d) the round budget for this piece is spent           → ship at score, record the gap
```

`(a)` is the ideal and the rarest. `(b)` and `(d)` are what turn an infinite loop
into a project.

**Record the gap in the ledger either way.** An honest board that says *7.0, and
here is exactly what is wrong* is far more useful — to you and to anyone
evaluating the work — than one that says *passed*. It also means resuming later is
cheap: the next wave starts from a measured directive rather than a rediscovery.

The wave template implements `(b)` directly: two rounds of movement under half a
point returns `plateaued: true` instead of buying another round.

---

## The absence-vs-defect signal

Watch for the moment a critic stops failing a piece for something it did *wrong*
and starts failing it for something it *cannot express*.

A real ledger entry at that transition:

> Both pieces are now failing on an **absence rather than a defect**. The
> performance piece can only change resolution, so it runs out of moves. The
> course piece can only change shape, because nothing in the track vocabulary can
> touch a player — proven by the stun function having exactly one caller in the
> entire codebase.

When a piece's *vocabulary* cannot express what the critic is asking for, more
rounds cannot help. Another round will produce another variation on the same
inadequate move, and the score will sit still while the tokens burn.

That is a **scope decision, not an iteration**. The responses are:

- **Add a piece** that owns the missing vocabulary (a hazard system, a content
  tier, an event type), then re-run the blocked piece carrying its verdict.
- **Widen an ownership boundary** so one owner can build the thing and use it.
- **Send it to the coherence pass** if the missing thing lives between owners.
- **Escalate to the human** if it is a product decision rather than a technical
  one.

The tell is usually in the critic's own evidence: a proposed fix that names a file
outside the piece's ownership, or a measurement showing a capability exists but
has no caller.

---

## Detecting a stalled loop early

| Signal | What it means |
|---|---|
| Score moves < 0.5 over two rounds | Plateau. Escalate rather than re-run |
| The same gap appears in several pieces' verdicts | It is a seam. Coherence, not another wave |
| The directive names a file the piece does not own | Vocabulary gap. Change the scope |
| Every critic returns 8-ish with a compliment | Calibration is missing from the critic prompt |
| Rounds increase but the ledger's gap text barely changes | The builder is redesigning instead of closing the named gap. Check "do not start a redesign" is in the carry |
| Critic evidence is prose without numbers | The review sheet does not show this piece. Add an instrument |

---

## Budgets

If you have a token or time budget, express it as a hard ceiling in the
orchestrator, not as a hope. Scale depth to it: a fixed fleet size when the budget
is known, or a loop that checks remaining budget before buying another round.

And spend it where it converts. Rounds one through three of a piece move the score
most; rounds five and six of a plateaued piece move it least. When budget is
tight, prefer **one more piece at three rounds** over **one more round on six
pieces**.

---

## What "done" honestly looks like

For most projects the end state is not "everything passed". It is:

- every piece either passed or was escalated with its gap recorded,
- the coherence pass ran after the last merge and its seams are closed,
- the board tells the truth about where it stands,
- and a human has looked at the product and decided the remaining gaps are
  acceptable.

That last one is the only real terminator. The loop's job is to make that decision
cheap and well-informed, not to make it for you.
