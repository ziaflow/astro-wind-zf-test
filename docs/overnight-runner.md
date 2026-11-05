# Overnight Task Runner & Multi-Model Scheduling Guide

This setup allows you to execute multi-hour, overnight, or recurring tasks across small atomic chunks without hitting context window exhaustion or rate limits.

---

## Architecture Overview

```
                      +-----------------------------+
                      |       task_queue.json       |
                      | (State ledger on disk)      |
                      +--------------+--------------+
                                     |
                                     v
                       scripts/overnight-runner.mjs
                      (Model rotation & Cooldown)
                                     |
                                     +--------------------+
                                     |                    |
                                     v                    v
                          agentapi new-conversation    agentapi new-conversation
                          (--model=flash)              (--model=flash_lite)
```

1. **State Persistence**: Tasks and their execution status (`pending`, `in_progress`, `completed`, `failed`) are stored on disk in [task_queue.json](../task_queue.json).
2. **Fresh Context per Task**: Instead of letting one long conversation grow unbounded, `agentapi` spins up a brand new agent session for each task.
3. **Model Rotation**: The runner alternates across `flash`, `flash_lite`, and `pro` to balance token quotas and reduce the likelihood of rate limits.
4. **Quota Cooldown**: A configurable cooldown period (e.g. 30–60s) between tasks gives rate limits time to reset automatically.

---

## Quick Reference Commands

| Command | Description |
| :--- | :--- |
| `npm run queue` | View all pending, in-progress, and completed tasks |
| `npm run queue:run` | Start unattended overnight execution loop across all pending tasks |
| `npm run queue:once` | Execute only the next pending task with fresh conversation |
| `node scripts/overnight-runner.mjs --add "Task description" --model flash` | Add a new task to the queue |
| `node scripts/overnight-runner.mjs --run --cooldown 60 --model flash_lite` | Run with custom cooldown and model tier override |

---

## Optional: Registering as an Antigravity Sidecar

To have Antigravity automatically run the queue runner on a scheduled cron cadence (e.g. every 30 minutes between 10 PM and 6 AM):

Place the following configuration in `~/.gemini/config/sidecars/overnight-batch-runner/sidecar.json`:

```json
{
  "builtin": "schedule",
  "args": [
    "CRON_TZ=America/Phoenix */30 22-06 * * *",
    "node",
    "c:/Users/jerem/astro-wind-zf-test/scripts/overnight-runner.mjs",
    "--once"
  ],
  "restart_policy": "always",
  "display_name": "AstroWind Overnight Queue Runner",
  "description": "Runs one pending task from task_queue.json every 30 minutes overnight."
}
```

