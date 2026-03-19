'use server';

import { revalidatePath } from 'next/cache';
import { readTasks, writeTasks } from '@/lib/task-store';
import { CreateTaskSchema, UpdateTaskSchema } from '@/lib/task-schema';
import type { Lane } from '@/types/task';

function generateId(tasks: { id: string }[]): string {
  const nums = tasks
    .map((t) => parseInt(t.id.replace('T-', ''), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `T-${String(max + 1).padStart(4, '0')}`;
}

export async function createTask(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const input = CreateTaskSchema.parse(raw);
  const tasks = readTasks();
  const now = new Date().toISOString();
  tasks.push({ ...input, id: generateId(tasks), createdAt: now, updatedAt: now });
  writeTasks(tasks);
  revalidatePath('/', 'layout');
}

export async function updateTask(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const input = UpdateTaskSchema.parse(raw);
  const tasks = readTasks();
  const idx = tasks.findIndex((t) => t.id === input.id);
  if (idx === -1) throw new Error(`Task ${input.id} not found`);
  tasks[idx] = { ...tasks[idx], ...input, updatedAt: new Date().toISOString() };
  writeTasks(tasks);
  revalidatePath('/', 'layout');
}

export async function moveTask(id: string, lane: Lane, blockedReason?: string) {
  const tasks = readTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Task ${id} not found`);
  tasks[idx] = {
    ...tasks[idx],
    lane,
    order: undefined,       // clear explicit order when moving to a new lane
    blockedReason: lane === 'blocked-external' ? blockedReason : undefined,
    updatedAt: new Date().toISOString(),
  };
  writeTasks(tasks);
  revalidatePath('/', 'layout');
}

export async function deleteTask(id: string) {
  const tasks = readTasks();
  writeTasks(tasks.filter((t) => t.id !== id));
  revalidatePath('/', 'layout');
}
