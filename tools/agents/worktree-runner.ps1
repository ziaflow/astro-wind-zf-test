param(
    [string]$TaskId = "manual"
)

$ErrorActionPreference = "Stop"
$BranchName = "agent/task-$TaskId"
$BaseDir = [System.IO.Path]::Combine($env:TEMP, "antigravity-worktrees")
$WorktreePath = [System.IO.Path]::Combine($BaseDir, $BranchName)

if (-not (Test-Path $BaseDir)) {
    New-Item -ItemType Directory -Path $BaseDir -Force | Out-Null
}

try {
    git fetch origin main
} catch {
    Write-Host "Warning: Could not fetch origin main. Proceeding with local state."
}

git worktree add -B "$BranchName" "$WorktreePath" origin/main

Write-Host "Worktree active at: $WorktreePath"
