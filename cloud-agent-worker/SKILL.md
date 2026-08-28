---
name: cloud-agent-worker
description: >
  Dispatch work to a cloud coding agent (Cursor background agents, Claude Code cloud
  sessions, or Codex cloud tasks) and wait for it to finish. Use when the user asks to
  hand a task to a cloud agent, run something on a repo in the background, kick off a
  background agent, check on one that is already running, follow up on one, or wait for
  one to complete. Triggers: cloud agent, background agent, Cursor agent, Codex task,
  Claude cloud session, dispatch to the cloud, run this on a repo in the background.
---

# Cloud agent worker

Hand a task to a cloud coding agent and get the result back, without sitting on a browser
tab. One CLI over three providers.

```
bin/cloud-agent-worker
```

Everything prints **one JSON object on stdout**; progress goes to stderr. Exit code is
`0` finished, `1` failed or gave up waiting, `2` could not start.

## The one command that matters

```bash
bin/cloud-agent-worker run \
  --provider cursor --repo owner/name --branch main \
  --task "Add a --json flag to the doctor command and a test for it"
```

`run` dispatches and then **blocks until the agent finishes**. That is the point: a shell
that blocks is a shell whose completion means something, so run it in the background and
you get told when the work is actually done rather than when it was merely started.

If the user wants to keep working while it runs, launch it with `run_in_background` and
carry on — the completion notification carries the summary.

## Picking a provider

| | Reaches the repo by | Needs |
|---|---|---|
| `cursor` | cloning it itself | `--branch` — it validates the ref and refuses an empty one |
| `claude` | a checkout on this machine | `--cwd` (defaults to the current directory) |
| `codex` | a preconfigured environment | an environment already existing for that repo |

Run `providers` first if unsure — it reports which are signed in here.

Default is `cursor`, because it needs nothing local.

## The rest of the surface

```bash
bin/cloud-agent-worker providers                  # who is signed in on this machine
bin/cloud-agent-worker dispatch --provider ...    # start, print the id, do not wait
bin/cloud-agent-worker wait <sessionId>           # block on one already running
bin/cloud-agent-worker status <sessionId>         # read it once
bin/cloud-agent-worker send <sessionId> "..."     # follow up on a running agent
```

The provider is inferred from the id, so `wait`, `status` and `send` never need `--provider`:
Cursor mints `bc-…`, Codex `task_…`, Claude `session_…` or `cse_…`.

## Every parameter

All of it is set per call. Nothing is read from a config file, so what you pass is what runs.

### Choosing the work

| Flag | Applies to | Default | |
|---|---|---|---|
| `--provider <id>` | `run`, `dispatch` | `cursor` | `claude`, `cursor` or `codex` |
| `--repo <owner/name>` | `run`, `dispatch` | — | required except for `claude`, which uses the checkout |
| `--task "..."` | `run`, `dispatch` | — | required; the whole instruction, since it cannot ask you |
| `--branch <ref>` | `run`, `dispatch` | — | **Cursor requires it.** Codex takes it; Claude uses the checkout's branch |
| `--cwd <path>` | `claude` only | the current directory | the checkout to start from |

### Model and effort

| Flag | Default | |
|---|---|---|
| `--model <id>` | `opus` · `grok-4.6` · `gpt-5.6-sol` | per provider, in that order |
| `--effort <level>` | `high` everywhere | `low`, `medium`, `high`; Claude also `xhigh`, `max` |

Pinned rather than left to the account: an unpinned dispatch inherits whatever that
account's default happens to be that week, so the same task silently changes model between
one run and the next.

Each vendor spells it differently and the CLI absorbs that — Claude takes `--model` and
`--effort` flags, Cursor sends effort as a model parameter, Codex takes both as `-c`
config overrides. You pass the same two flags regardless.

### Behaviour

| Flag | Applies to | Default | |
|---|---|---|---|
| `--create-pr` | `run`, `dispatch` | off | opens a PR when done. Never assumed — it is a visible act on someone's repository |
| `--attempts <n>` | `codex` only | 1 | best-of-N |
| `--timeout <ms>` | `run`, `wait` | `7200000` (2h) | give up waiting |
| `--interval <ms>` | `run`, `wait` | `30000` | how often to poll |
| `--first-check <ms>` | `run`, `wait` | `20000` | how long before the first poll |
| `--stop-on-question` | `run`, `wait` | off | return on `needs_input` instead of waiting on |
| `--help` | any | — | the usage text |

Unknown flags are ignored rather than refused, so a typo shows up as a default being used —
check the `model` and `effort` echoed back in the JSON if a run behaves unexpectedly.

## States

`working` · `needs_input` · `ready` · `failed` · `idle`

`wait` returns on **ready** or **failed** only. It deliberately keeps waiting through
`needs_input`, because an agent that asks a question usually gets an answer and carries on —
stopping there once left a finished agent looking busy for hours. Pass `--stop-on-question`
when nobody is around to answer.

## Reading the result

On success the JSON carries `summary` — what the agent actually said it did, in its own
words. Codex adds a second paragraph with the diff stat and where to review or apply it,
because a Codex task hands back a diff as well as an answer.

Report the summary to the user. Do not re-derive what the agent did from the diff unless
they ask.

## When it will not start

The errors are meant to be read and acted on, not retried:

- **not signed in** — sign in with that vendor's own tool; the CLI reads the same
  credential files.
- **Cursor needs --branch** — pass the ref.
- **Codex has no environment for this repo** — one cannot be created from an API. The error
  names the environments that do exist and links to where to make another.

## Notes

Standalone: Node's own `fetch` and `child_process`, no dependencies and no build step. It
reads `~/.claude/.credentials.json`, `~/.config/cursor/auth.json` and `~/.codex/auth.json` —
the files those tools write for themselves — so being signed in to them is being signed in
to this. No credential is ever logged or put on a command line.
