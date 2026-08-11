# Termination

Decide the rule before the first wave. "Continue until a critic is wowed" has no guaranteed endpoint against a shipped benchmark.

## Piece state machine

```text
queued → building → judging → passed
                         ↘ revise
                         ↘ plateaued
                         ↘ scope-decision
                         ↘ budget-exhausted
                         ↘ blocked-on-authority
```

Treat a piece as closed when one applies:

- **Pass:** the critic cannot name a meaningful user-visible gap and all acceptance signals agree.
- **Plateau:** score movement is less than 0.5 across two rounds.
- **Scope:** the directive needs files or vocabulary outside the piece.
- **Budget:** round, time or token budget is exhausted.
- **Authority:** the next step needs permission the user has not granted.

Record the final gap and evidence for every non-pass state.

## Absence versus defect

A defect is something the owner can change. An absence is something the piece cannot express. Signals include:

- the directive names another owner's files;
- repeated rounds produce the same gap in new words;
- the required event, route, content type, hazard, error category, or platform surface does not exist;
- the same gap appears in several pieces.

Respond by creating a new piece, deliberately widening ownership, routing a seam to coherence, or asking the user for a product decision. Do not buy another round automatically.

## Project completion

Finish when:

- every piece is passed or honestly escalated;
- the final coherence pass and whole-product critic ran;
- gates and observable output were inspected;
- the ledger is current;
- no parked work is counted as incomplete;
- no unauthorized publication action remains implicit.

The human decides whether recorded gaps are acceptable. The loop's job is to make that decision informed, not to manufacture a green board.
