import fs from 'fs';
import path from 'path';
import os from 'os';
import type { Task } from '@/types/task';

// Canonical live source — lives outside any git repo, in user home.
// Override via TASK_QUEUE_FILE env var for custom paths.
const CANONICAL_DEFAULT = path.join(os.homedir(), 'clawd', 'ops', 'task-queue.json');

export const STORE_PATH = process.env.TASK_QUEUE_FILE
  ? path.resolve(process.env.TASK_QUEUE_FILE)
  : CANONICAL_DEFAULT;

// Repo-local path — only used once for one-time migration.
const LEGACY_PATH = path.resolve(process.cwd(), 'ops', 'task-queue.json');

function ensureDir(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// On first use: if canonical path doesn't exist but legacy repo file does, copy it over.
function migrateIfNeeded(): void {
  if (STORE_PATH === LEGACY_PATH) return;
  if (!fs.existsSync(STORE_PATH) && fs.existsSync(LEGACY_PATH)) {
    ensureDir(STORE_PATH);
    fs.copyFileSync(LEGACY_PATH, STORE_PATH);
  }
}

export function getStorePath(): string {
  return STORE_PATH;
}

export function readTasks(): Task[] {
  migrateIfNeeded();
  if (!fs.existsSync(STORE_PATH)) return [];
  const raw = fs.readFileSync(STORE_PATH, 'utf-8');
  const data = JSON.parse(raw);
  return data.tasks ?? [];
}

export function writeTasks(tasks: Task[]): void {
  ensureDir(STORE_PATH);
  const tmp = STORE_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify({ tasks }, null, 2), 'utf-8');
  fs.renameSync(tmp, STORE_PATH);
}
