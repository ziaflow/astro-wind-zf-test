---
name: overnight-task-runner
description: Manage and execute long-running or overnight tasks broken into atomic chunks across model tiers (flash, flash_lite, pro) to manage context limits and quota.
---

# Antigravity Overnight Task Runner

This skill allows Antigravity agents to manage, break down, and process long-running projects overnight by utilizing a persistent queue and spinning up fresh sessions with model rotation.

## When to Use
- Breaking down a large feature, migration, or refactor into manageable atomic tasks.
- Running background or overnight tasks without risking context window blowup or rate limit halts.
- Queueing tasks to execute sequentially across model tiers (`flash`, `flash_lite`, `pro`).

---

## 1. Inspecting the Task Queue

To view current tasks and their status:
```bash
npm run queue
# or
node scripts/overnight-runner.mjs --status
```

---

## 2. Adding Tasks to the Queue

You or the agent can add new tasks directly via the CLI:
```bash
node scripts/overnight-runner.mjs --add "Implement unit tests for blog pagination" --model flash
```
Or by appending an object to `task_queue.json`:
```json
{
  "id": "task-003",
  "title": "Upgrade Astro dependencies and verify build",
  "category": "maintenance",
  "status": "pending",
  "priority": "normal",
  "model_tier": "flash",
  "prompt": "Run pnpm outdated / npm outdated, inspect version deltas, test a dry-run build, and document findings.",
  "created_at": "2026-11-04T19:00:00Z",
  "completed_at": null,
  "retry_count": 0,
  "notes": ""
}
```

---

## 3. Running the Overnight Loop

- **Execute All Pending Tasks (Sequential Overnight Run)**:
  ```bash
  npm run queue:run
  # or
  node scripts/overnight-runner.mjs --run --cooldown 30
  ```
  The runner will:
  1. Pick the first pending task.
  2. Spawn a fresh Antigravity agent session using `agentapi new-conversation --model=<model>`.
  3. Wait for completion, update task status in `task_queue.json`, and pause for the cooldown period to let quotas regenerate.
  4. Automatically rotate through `flash` -> `flash_lite` -> `pro` if not explicitly locked.

- **Execute Only the Next Pending Task**:
  ```bash
  npm run queue:once
  ```

---

## 4. Best Practices for Task Prompts
- **Atomic scope**: Each task should be doable in 5–15 minutes (e.g. 1 component, 1 test suite, 1 schema migration).
- **Self-contained**: Include file paths, commands to run, and the expected artifact or verification step.
- **Verification step**: Explicitly tell the task to verify changes (e.g. `npm run check`, `npm test`) before completing.

