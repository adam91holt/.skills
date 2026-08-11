---
name: build-kickoff-codex
description: Interview the user about a large thing they want built, then write the Codex-native kickoff prompt that launches benchmarked multi-agent build waves with fresh-context critics, explicit file ownership, observable evidence, coherence passes, and a termination rule. Use when the user asks to write a super prompt, turn an idea into a Codex build prompt, start a large multi-agent build, prepare an overnight build, or launch a project at the quality of a named product. Do not use to run the build itself; use wave-critic-build-codex for execution.
---

# Write a Codex build kickoff prompt

Produce the launch artifact, not the product. Interview briefly, write one prompt in the user's voice, save it when a target repository is available, print it in full, and stop. Let `$wave-critic-build-codex` run the build in a fresh Codex task.

## Interview first

Never write the prompt from a one-line ask alone. Obtain four decisions in one short round. Use a structured user-input tool when one is available in the active mode; otherwise ask the four questions directly. Do not invent tool names that are not exposed in the active Codex harness.

1. Ask for a named, shipped benchmark. Offer three plausible products and recommend one. Reject adjectives such as "polished" as the only answer; ask once more which real product a critic should compare side by side.
2. Ask how the run should operate:
   - one wave, then user review;
   - supervised in the current Codex task;
   - unattended through a scheduled task that returns to the same Codex task.
3. Ask how it ends. Recommend the plateau rule. Also offer a per-piece round budget, a wall-clock budget, or "wowed or nothing" with a clear warning that the last choice has no natural terminator.
4. Ask for the stack and runtime surface. Prefer the surface with the strongest deterministic, machine-drivable capture story when the user has no preference.

Ask one follow-up round only when the thing itself is unclear, existing code needs protection, or scope exclusions are material. Two rounds is the ceiling.

## Write the prompt

Read `assets/superprompt.template.md` and fill every placeholder. Read `references/anatomy.md` before removing a structural clause. Read `references/examples.md` when a complete Codex-native example would help.

Write 300–500 words in the user's first-person voice, addressed to Codex. Include all of these:

- the named benchmark and two opposing quality axes;
- Phase 0 before any implementation: deterministic harness, review sheet, contract/types, ledger, and an unattended permission check;
- decomposition delegated to Codex by judgeability, not by arbitrary architecture seams;
- explicit permission to use subagents and delegate independent pieces in parallel;
- disjoint file ownership and the shared-workspace rule: workers must not revert or stage other agents' edits;
- `worker` subagents for implementation and a new fresh-context critic after each build round;
- critics that inspect the running product and captured artifacts, never builder summaries;
- memory-first benchmark description, blind A/B, one measured gap, and a precise directive;
- verdict carry through a follow-up to the same builder, with "close that gap first; do not redesign";
- a whole-repo coherence pass that runs alone between waves;
- a live ledger and progress page;
- the selected termination rule;
- an unattended instruction only when selected: test one wave manually, then use a scheduled task in the same Codex task and keep all state in repository files.

Use only Codex vocabulary. The native control surface is subagent orchestration (`spawn_agent`, `wait_agent`, `followup_task`, `list_agents`), planning, repository state, and scheduled tasks when automation tools are available. Do not invent a generic workflow runtime, private session paths, loop slash commands, or resume-cache semantics.

## Account for Codex safety boundaries

For unattended work, make the prompt require a manual first wave and a proven permission envelope. Scheduled runs cannot pause for fresh approval in the ordinary way; commands that need new approval should fail visibly and be recorded as a decision, not bypassed. Keep the project available on disk and the desktop app running for local scheduled work.

Do not tell the build to push, merge, deploy, publish, or message external systems unless the user explicitly authorized that action. A request to build does not automatically authorize publication.

## Hand it over

When the target repository is known and writable, write the filled prompt to `tools/kickoff.prompt.md` with `apply_patch`. Also print it in full so the user can review it.

Finish with one line:

> Start a fresh Codex task at the repository root and paste this prompt. Keep the explicit subagent instruction and invoke `$wave-critic-build-codex` if automatic skill selection is uncertain.

Do not fire the prompt unless the user asks.

## Companion skill

Use `$wave-critic-build-codex` when the user wants the loop executed rather than the kickoff prompt written.
