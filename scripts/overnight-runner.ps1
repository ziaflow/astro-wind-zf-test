<#
.SYNOPSIS
  PowerShell wrapper for the Antigravity Overnight Task Runner.

.DESCRIPTION
  Executes or monitors task_queue.json across Antigravity agents, rotating models
  (flash, flash_lite, pro) and starting fresh sessions with cooldowns.

.EXAMPLE
  .\scripts\overnight-runner.ps1 -Status
  .\scripts\overnight-runner.ps1 -Run
  .\scripts\overnight-runner.ps1 -Once
  .\scripts\overnight-runner.ps1 -Add "Run full integration tests" -Model "flash"
#>

param(
    [switch]$Status,
    [switch]$Run,
    [switch]$Once,
    [string]$Model,
    [int]$Cooldown,
    [string]$Add
)

$scriptPath = Join-Path $PSScriptRoot "overnight-runner.mjs"

$nodeArgs = @($scriptPath)

if ($Status) {
    $nodeArgs += "--status"
} elseif ($Add) {
    $nodeArgs += "--add"
    $nodeArgs += $Add
    if ($Model) {
        $nodeArgs += "--model"
        $nodeArgs += $Model
    }
} elseif ($Run -or $Once) {
    if ($Run) { $nodeArgs += "--run" }
    if ($Once) { $nodeArgs += "--once" }
    if ($Model) {
        $nodeArgs += "--model"
        $nodeArgs += $Model
    }
    if ($Cooldown) {
        $nodeArgs += "--cooldown"
        $nodeArgs += $Cooldown
    }
} else {
    $nodeArgs += "--status"
}

node @nodeArgs
