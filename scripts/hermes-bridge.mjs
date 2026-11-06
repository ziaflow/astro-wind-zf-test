#!/usr/bin/env node
/**
 * Hermes-to-Antigravity Task Bridge
 *
 * Bridges the gap between Hermes (running 24/7 in Cloud/Telegram/CLI)
 * and Antigravity's local task execution queue (`task_queue.json`).
 *
 * Capabilities:
 * - Enqueue tasks from Hermes CLI / Telegram payloads with schema validation.
 * - Inspect queue status formatted for human chat or raw JSON.
 * - Trigger execution via Antigravity's overnight runner.
 * - Optional bidirectional sync with Supabase `agent_tasks` for remote cloud dispatch.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const QUEUE_FILE = path.join(ROOT_DIR, 'task_queue.json');

// Load .env quietly if present
dotenv.config({ path: path.join(ROOT_DIR, '.env'), quiet: true });

function loadQueue() {
  if (!fs.existsSync(QUEUE_FILE)) {
    return {
      $schema: './docs/task_queue_schema.json',
      version: '1.0',
      name: 'AstroWind Overnight Agent Queue',
      settings: {
        default_model_rotation: ['flash', 'flash_lite', 'pro'],
        cooldown_seconds_between_tasks: 30,
        max_retries_per_task: 2,
      },
      tasks: [],
    };
  }
  try {
    const raw = fs.readFileSync(QUEUE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[Hermes Bridge] Error parsing ${QUEUE_FILE}:`, err.message);
    process.exit(1);
  }
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf-8');
}

function generateTaskId(tasks) {
  const maxNum = tasks.reduce((max, t) => {
    const match = t.id && t.id.match(/^task-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  return `task-${String(maxNum + 1).padStart(3, '0')}`;
}

function validateTaskPayload(task) {
  if (!task.title || typeof task.title !== 'string' || task.title.trim().length === 0) {
    throw new Error('Task "title" is required and must be a non-empty string.');
  }
  if (!task.prompt || typeof task.prompt !== 'string' || task.prompt.trim().length === 0) {
    throw new Error('Task "prompt" is required and must be a non-empty string.');
  }
  const validModels = ['flash', 'flash_lite', 'pro', 'auto'];
  if (task.model_tier && !validModels.includes(task.model_tier)) {
    throw new Error(`Invalid model_tier "${task.model_tier}". Must be one of: ${validModels.join(', ')}`);
  }
  const validPriorities = ['low', 'normal', 'high', 'critical'];
  if (task.priority && !validPriorities.includes(task.priority)) {
    throw new Error(`Invalid priority "${task.priority}". Must be one of: ${validPriorities.join(', ')}`);
  }
}

function enqueueTask({
  title,
  prompt,
  category = 'web-engineer',
  model_tier = 'flash',
  priority = 'normal',
  notes = '',
}) {
  const queue = loadQueue();
  const id = generateTaskId(queue.tasks);

  const newTask = {
    id,
    title: title.trim(),
    category: category.trim(),
    status: 'pending',
    priority,
    model_tier,
    prompt: prompt.trim(),
    created_at: new Date().toISOString(),
    completed_at: null,
    started_at: null,
    retry_count: 0,
    notes: notes ? notes.trim() : 'Enqueued via Hermes Bridge',
  };

  validateTaskPayload(newTask);
  queue.tasks.push(newTask);
  saveQueue(queue);

  return newTask;
}

function getStatus({ filter = null, id = null } = {}) {
  const queue = loadQueue();
  let tasks = queue.tasks;

  if (id) {
    const found = tasks.find((t) => t.id === id);
    return found ? [found] : [];
  }

  if (filter) {
    tasks = tasks.filter((t) => t.status === filter);
  }

  return tasks;
}

function dispatchNext(modelOverride = null) {
  const runnerScript = path.join(__dirname, 'overnight-runner.mjs');
  const args = [runnerScript, '--once'];
  if (modelOverride) {
    args.push('--model', modelOverride);
  }

  console.log(`[Hermes Bridge] Invoking overnight runner: node ${args.join(' ')}`);
  const result = spawnSync('node', args, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    shell: true,
  });

  return result.status === 0;
}

async function syncWithSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('[Hermes Bridge] Supabase credentials not found in environment. Skipping cloud table sync.');
    return;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[Hermes Bridge] Checking Supabase for remote tasks in "agent_tasks" table...');
    const { data, error } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      if (error.code === '42P01') {
        console.log('[Hermes Bridge] Note: "agent_tasks" table does not exist in Supabase yet. Local queue is active.');
      } else {
        console.warn('[Hermes Bridge] Supabase query warning:', error.message);
      }
      return;
    }

    if (data && data.length > 0) {
      console.log(`[Hermes Bridge] Found ${data.length} pending task(s) in Supabase. Ingesting to local queue...`);
      for (const remoteTask of data) {
        const added = enqueueTask({
          title: remoteTask.title,
          prompt: remoteTask.prompt || remoteTask.description || remoteTask.title,
          category: remoteTask.category || 'cloud-dispatch',
          model_tier: remoteTask.model_tier || 'flash',
          priority: remoteTask.priority || 'normal',
          notes: `Ingested from Supabase agent_tasks (ID: ${remoteTask.id})`,
        });

        // Mark as ingested in Supabase
        await supabase
          .from('agent_tasks')
          .update({ status: 'in_progress', local_task_id: added.id })
          .eq('id', remoteTask.id);

        console.log(`[Hermes Bridge] Synced cloud task ${remoteTask.id} -> Local ${added.id}`);
      }
    } else {
      console.log('[Hermes Bridge] No new pending tasks in Supabase.');
    }
  } catch (err) {
    console.warn('[Hermes Bridge] Supabase sync encountered an exception:', err.message);
  }
}

// CLI Driver
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';

  if (command === 'help' || args.includes('--help') || args.includes('-h')) {
    console.log(`
Hermes Bridge CLI - Connecting Hermes & Antigravity
Usage:
  node scripts/hermes-bridge.mjs [command] [options]

Commands:
  status                     Show queue status
  enqueue, add               Enqueue a new task
  dispatch, run              Dispatch and execute next task
  sync                       Sync remote tasks from Supabase (if configured)

Options:
  --json                     Output results as raw JSON (ideal for Hermes/Telegram parsing)
  --title "<title>"          Task title (required for enqueue)
  --prompt "<prompt>"        Task prompt/instructions (required for enqueue)
  --model <tier>             Model tier: flash, flash_lite, pro (default: flash)
  --priority <level>         Priority: low, normal, high, critical (default: normal)
  --category <name>          Category (default: web-engineer)
  --filter <status>          Filter status by: pending, in_progress, completed, failed
  --id <task-id>             Filter status by specific task ID (e.g. task-001)
  --file <path>              Load task JSON payload from a file
`);
    return;
  }

  const isJson = args.includes('--json');

  if (command === 'status' || command === '--status' || command === '-s') {
    const filterIdx = args.indexOf('--filter');
    const filter = filterIdx !== -1 ? args[filterIdx + 1] : null;

    const idIdx = args.indexOf('--id');
    const id = idIdx !== -1 ? args[idIdx + 1] : null;

    const tasks = getStatus({ filter, id });
    const queue = loadQueue();

    if (isJson) {
      console.log(
        JSON.stringify(
          {
            summary: {
              total: queue.tasks.length,
              pending: queue.tasks.filter((t) => t.status === 'pending').length,
              in_progress: queue.tasks.filter((t) => t.status === 'in_progress').length,
              completed: queue.tasks.filter((t) => t.status === 'completed').length,
              failed: queue.tasks.filter((t) => t.status === 'failed').length,
            },
            tasks,
          },
          null,
          2
        )
      );
    } else {
      console.log('\n=============================================');
      console.log('📡 Hermes-Antigravity Bridge Queue Status');
      console.log('=============================================');
      console.log(`Total:       ${queue.tasks.length}`);
      console.log(`Pending:     ${queue.tasks.filter((t) => t.status === 'pending').length}`);
      console.log(`In Progress: ${queue.tasks.filter((t) => t.status === 'in_progress').length}`);
      console.log(`Completed:   ${queue.tasks.filter((t) => t.status === 'completed').length}`);
      console.log(`Failed:      ${queue.tasks.filter((t) => t.status === 'failed').length}`);
      console.log('---------------------------------------------');
      tasks.forEach((t) => {
        const icon =
          t.status === 'completed' ? '✅' : t.status === 'in_progress' ? '🔄' : t.status === 'failed' ? '❌' : '⏳';
        console.log(`${icon} [${t.id}] (${t.model_tier || 'auto'}) [${t.category || 'general'}] ${t.title}`);
      });
      console.log('=============================================\n');
    }
    return;
  }

  if (command === 'enqueue' || command === 'add') {
    let payload = {};

    const fileIdx = args.indexOf('--file');
    if (fileIdx !== -1 && args[fileIdx + 1]) {
      const filePath = path.resolve(process.cwd(), args[fileIdx + 1]);
      payload = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } else {
      const getVal = (flag) => {
        const idx = args.indexOf(flag);
        return idx !== -1 ? args[idx + 1] : undefined;
      };
      payload = {
        title: getVal('--title'),
        prompt: getVal('--prompt') || getVal('--title'),
        model_tier: getVal('--model') || 'flash',
        priority: getVal('--priority') || 'normal',
        category: getVal('--category') || 'web-engineer',
        notes: getVal('--notes'),
      };
    }

    try {
      const task = enqueueTask(payload);
      if (isJson) {
        console.log(JSON.stringify({ success: true, task }, null, 2));
      } else {
        console.log(`\n✅ Task enqueued successfully:`);
        console.log(`   ID:       ${task.id}`);
        console.log(`   Title:    ${task.title}`);
        console.log(`   Category: ${task.category}`);
        console.log(`   Model:    ${task.model_tier}`);
        console.log(`   Priority: ${task.priority}\n`);
      }
    } catch (err) {
      if (isJson) {
        console.log(JSON.stringify({ success: false, error: err.message }));
      } else {
        console.error(`\n❌ Failed to enqueue task: ${err.message}\n`);
      }
      process.exit(1);
    }
    return;
  }

  if (command === 'dispatch' || command === 'run') {
    const modelIdx = args.indexOf('--model');
    const model = modelIdx !== -1 ? args[modelIdx + 1] : null;
    const ok = dispatchNext(model);
    process.exit(ok ? 0 : 1);
  }

  if (command === 'sync') {
    await syncWithSupabase();
    return;
  }

  console.error(`Unknown command: "${command}". Run "node scripts/hermes-bridge.mjs help" for usage.`);
  process.exit(1);
}

main().catch((err) => {
  console.error('[Hermes Bridge] Fatal:', err.message);
  process.exit(1);
});
