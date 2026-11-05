#!/usr/bin/env node
/**
 * Overnight Task Runner for Antigravity (AGY) Agents
 * 
 * Manages chunked overnight execution by reading task_queue.json,
 * rotating models (flash -> flash_lite -> pro) to distribute quota,
 * and spawning fresh conversations using Antigravity's agentapi.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync, execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const QUEUE_FILE = path.join(ROOT_DIR, 'task_queue.json');

// Discover agentapi binary path
function getAgentApiPath() {
  const home = os.homedir();
  const winPath = path.join(home, '.gemini', 'antigravity', 'bin', 'agentapi.bat');
  if (fs.existsSync(winPath)) {
    return winPath;
  }
  const nixPath = path.join(home, '.gemini', 'antigravity', 'bin', 'agentapi');
  if (fs.existsSync(nixPath)) {
    return nixPath;
  }
  // Try system PATH
  try {
    const whichCmd = process.platform === 'win32' ? 'where agentapi' : 'which agentapi';
    const out = execSync(whichCmd, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim().split('\n')[0].trim();
    if (out && fs.existsSync(out)) return out;
  } catch {
    // ignore
  }
  return null;
}

// Load queue JSON
function loadQueue() {
  if (!fs.existsSync(QUEUE_FILE)) {
    console.error(`Queue file not found: ${QUEUE_FILE}`);
    process.exit(1);
  }
  try {
    const raw = fs.readFileSync(QUEUE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to parse ${QUEUE_FILE}:`, err.message);
    process.exit(1);
  }
}

// Save queue JSON
function saveQueue(data) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Show status
function printStatus(queue) {
  const tasks = queue.tasks || [];
  const pending = tasks.filter(t => t.status === 'pending');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const completed = tasks.filter(t => t.status === 'completed');
  const failed = tasks.filter(t => t.status === 'failed');

  console.log('\n=============================================');
  console.log(`📋 Antigravity Overnight Queue Status`);
  console.log(`   Pending:     ${pending.length}`);
  console.log(`   In Progress: ${inProgress.length}`);
  console.log(`   Completed:   ${completed.length}`);
  console.log(`   Failed:      ${failed.length}`);
  console.log(`   Total:       ${tasks.length}`);
  console.log('=============================================\n');

  tasks.forEach((t) => {
    const badge = t.status === 'completed' ? '✅' :
                  t.status === 'in_progress' ? '🔄' :
                  t.status === 'failed' ? '❌' : '⏳';
    console.log(`${badge} [${t.id}] (${t.model_tier || 'auto'}) ${t.title}`);
  });
  console.log('');
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Execute single task via agentapi
function executeTask(task, queue, agentApiBin, modelOverride = null) {
  const model = modelOverride || task.model_tier || 'flash';
  console.log(`\n------------------------------------------------------------`);
  console.log(`🚀 Starting Task: [${task.id}] "${task.title}"`);
  console.log(`   Assigned Model: ${model}`);
  console.log(`------------------------------------------------------------`);

  // Update status to in_progress
  task.status = 'in_progress';
  task.started_at = new Date().toISOString();
  saveQueue(queue);

  // Construct self-contained prompt
  const fullPrompt = [
    `You are executing an automated unattended overnight task for AstroWind.`,
    `Task ID: ${task.id}`,
    `Task Title: ${task.title}`,
    `Description & Objective:`,
    task.prompt,
    ``,
    `INSTRUCTIONS:`,
    `1. Complete the task thoroughly.`,
    `2. If any tests, checks, or files are updated, verify them.`,
    `3. When finished, write a short summary of what was done.`,
    `4. Conclude your turn cleanly.`
  ].join('\n');

  const args = [
    'new-conversation',
    `--model=${model}`,
    `--title=[Overnight] ${task.title}`,
    fullPrompt
  ];

  console.log(`Invoking agentapi: ${agentApiBin} new-conversation --model=${model}`);
  
  const result = spawnSync(agentApiBin, args, {
    stdio: 'inherit',
    shell: true,
    cwd: ROOT_DIR
  });

  if (result.status === 0) {
    task.status = 'completed';
    task.completed_at = new Date().toISOString();
    console.log(`\n✅ Task [${task.id}] launched and session completed.`);
  } else {
    task.retry_count = (task.retry_count || 0) + 1;
    const maxRetries = queue.settings?.max_retries_per_task ?? 2;
    if (task.retry_count >= maxRetries) {
      task.status = 'failed';
      console.error(`\n❌ Task [${task.id}] failed after ${task.retry_count} attempts.`);
    } else {
      task.status = 'pending';
      console.warn(`\n⚠️ Task [${task.id}] encountered an error (exit code ${result.status}). Retrying next round.`);
    }
  }

  saveQueue(queue);
}

// Add new task
function addTask(title, prompt, modelTier = 'flash', priority = 'normal') {
  const queue = loadQueue();
  const newId = `task-${String(queue.tasks.length + 1).padStart(3, '0')}`;
  const newTask = {
    id: newId,
    title,
    category: 'custom',
    status: 'pending',
    priority,
    model_tier: modelTier,
    prompt: prompt || title,
    created_at: new Date().toISOString(),
    completed_at: null,
    retry_count: 0,
    notes: ''
  };
  queue.tasks.push(newTask);
  saveQueue(queue);
  console.log(`✅ Added new task: [${newId}] "${title}" (model: ${modelTier})`);
}

// Main run loop
async function runLoop(options) {
  const agentApiBin = getAgentApiPath();
  if (!agentApiBin) {
    console.error('❌ Could not locate agentapi binary. Ensure Antigravity is installed in ~/.gemini/antigravity/bin.');
    process.exit(1);
  }

  const queue = loadQueue();
  const rotation = queue.settings?.default_model_rotation || ['flash', 'flash_lite', 'pro'];
  const cooldownSecs = options.cooldown ?? queue.settings?.cooldown_seconds_between_tasks ?? 30;
  let rotationIndex = 0;

  console.log(`Found agentapi at: ${agentApiBin}`);
  console.log(`Model rotation sequence: ${rotation.join(' -> ')}`);
  console.log(`Cooldown between tasks: ${cooldownSecs} seconds`);

  while (true) {
    const currentQueue = loadQueue();
    const pendingTasks = currentQueue.tasks.filter(t => t.status === 'pending');

    if (pendingTasks.length === 0) {
      console.log('\n🎉 No pending tasks remaining in queue. Exiting.');
      break;
    }

    const nextTask = pendingTasks[0];
    const selectedModel = options.modelOverride || nextTask.model_tier || rotation[rotationIndex % rotation.length];
    rotationIndex++;

    executeTask(nextTask, currentQueue, agentApiBin, selectedModel);

    if (options.once) {
      console.log('\n--once flag specified. Exiting after single execution.');
      break;
    }

    const remaining = currentQueue.tasks.filter(t => t.status === 'pending').length;
    if (remaining > 0) {
      console.log(`\n⏳ Cooling down for ${cooldownSecs}s before next task (${remaining} remaining)...`);
      await sleep(cooldownSecs * 1000);
    }
  }
}

// CLI argument parser
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--status') || args.includes('-s')) {
    const queue = loadQueue();
    printStatus(queue);
    return;
  }

  if (args.includes('--add')) {
    const idx = args.indexOf('--add');
    const title = args[idx + 1];
    if (!title) {
      console.error('Error: --add requires a task title. E.g.: --add "Run test suite"');
      process.exit(1);
    }
    const modelArg = args.includes('--model') ? args[args.indexOf('--model') + 1] : 'flash';
    addTask(title, title, modelArg);
    return;
  }

  const isRun = args.includes('--run');
  const isOnce = args.includes('--once');

  if (isRun || isOnce) {
    const modelOverride = args.includes('--model') ? args[args.indexOf('--model') + 1] : null;
    let cooldown = null;
    if (args.includes('--cooldown')) {
      cooldown = parseInt(args[args.indexOf('--cooldown') + 1], 10);
    }
    await runLoop({ once: isOnce, modelOverride, cooldown });
    return;
  }

  console.log(`
Usage: node scripts/overnight-runner.mjs [options]

Options:
  --status, -s               View current queue status and task list
  --run                      Run all pending tasks in sequence with model rotation and cooldown
  --once                     Run only the next pending task, then exit
  --model <tier>             Override model for all tasks (e.g. flash, flash_lite, pro)
  --cooldown <seconds>       Override cooldown wait time between tasks (default: 30)
  --add "<title>"            Add a new pending task to the queue
`);
  const queue = loadQueue();
  printStatus(queue);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
