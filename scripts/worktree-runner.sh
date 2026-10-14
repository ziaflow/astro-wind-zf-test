#!/usr/bin/env bash
set -euo pipefail

TASK_ID="${1:-manual}"
BRANCH_NAME="agent/task-$TASK_ID"
WORKTREE_PATH="/tmp/antigravity-worktrees/$BRANCH_NAME"

mkdir -p /tmp/antigravity-worktrees
git fetch origin main || true
git worktree add -B "$BRANCH_NAME" "$WORKTREE_PATH" origin/main

echo "Worktree active at: $WORKTREE_PATH"
