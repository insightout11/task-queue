import fs from 'fs';
import path from 'path';
import type { Task } from '@/types/task';

const STORE_PATH = path.join(process.cwd(), 'ops', 'task-queue.json');

export function readTasks(): Task[] {
  if (!fs.existsSync(STORE_PATH)) return [];
  const raw = fs.readFileSync(STORE_PATH, 'utf-8');
  const data = JSON.parse(raw);
  return data.tasks ?? [];
}

export function writeTasks(tasks: Task[]): void {
  const tmp = STORE_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify({ tasks }, null, 2), 'utf-8');
  fs.renameSync(tmp, STORE_PATH);
}
