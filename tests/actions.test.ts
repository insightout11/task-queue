import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

let mockTasks: import('@/types/task').Task[] = [];

vi.mock('@/lib/task-store', () => ({
  readTasks: vi.fn(() => [...mockTasks]),
  writeTasks: vi.fn((tasks) => { mockTasks = tasks; }),
}));

import { createTask, moveTask } from '@/actions/tasks';
import type { Task } from '@/types/task';

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'T-0001',
    title: 'Test',
    lane: 'inbox',
    project: 'ops',
    owner: 'max',
    priority: 'medium',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  mockTasks = [];
  vi.clearAllMocks();
});

describe('createTask', () => {
  it('generates id and timestamps', async () => {
    const fd = new FormData();
    fd.append('title', 'New task');
    fd.append('lane', 'inbox');
    fd.append('project', 'ops');
    fd.append('owner', 'max');
    fd.append('priority', 'high');

    await createTask(fd);

    expect(mockTasks).toHaveLength(1);
    expect(mockTasks[0].id).toBe('T-0001');
    expect(mockTasks[0].createdAt).toBeTruthy();
    expect(mockTasks[0].title).toBe('New task');
  });

  it('increments id based on existing tasks', async () => {
    mockTasks = [makeTask({ id: 'T-0003' })];
    const fd = new FormData();
    fd.append('title', 'Another');
    fd.append('lane', 'max-now');
    fd.append('project', 'ops');
    fd.append('owner', 'max');
    fd.append('priority', 'low');

    await createTask(fd);
    expect(mockTasks[1].id).toBe('T-0004');
  });
});

describe('moveTask', () => {
  it('moves task to new lane', async () => {
    mockTasks = [makeTask({ id: 'T-0001', lane: 'inbox' })];
    await moveTask('T-0001', 'max-now');
    expect(mockTasks[0].lane).toBe('max-now');
  });

  it('sets blockedReason when moving to blocked-external', async () => {
    mockTasks = [makeTask({ id: 'T-0001', lane: 'max-now' })];
    await moveTask('T-0001', 'blocked-external', 'Waiting on Stripe');
    expect(mockTasks[0].lane).toBe('blocked-external');
    expect(mockTasks[0].blockedReason).toBe('Waiting on Stripe');
  });

  it('clears blockedReason when moving out of blocked-external', async () => {
    mockTasks = [makeTask({ id: 'T-0001', lane: 'blocked-external', blockedReason: 'Old reason' })];
    await moveTask('T-0001', 'max-now');
    expect(mockTasks[0].lane).toBe('max-now');
    expect(mockTasks[0].blockedReason).toBeUndefined();
  });

  it('clears order when moving to a new lane', async () => {
    mockTasks = [makeTask({ id: 'T-0001', lane: 'max-now', order: 2 })];
    await moveTask('T-0001', 'cc-queue');
    expect(mockTasks[0].order).toBeUndefined();
  });

  it('updates updatedAt timestamp', async () => {
    const before = '2026-01-01T00:00:00.000Z';
    mockTasks = [makeTask({ id: 'T-0001', updatedAt: before })];
    await moveTask('T-0001', 'done');
    expect(mockTasks[0].updatedAt).not.toBe(before);
  });
});
