import { describe, it, expect } from 'vitest';
import { sortedByLane } from '@/lib/task-sort';
import type { Task } from '@/types/task';

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'T-test',
    title: 'Test task',
    lane: 'inbox',
    project: 'ops',
    owner: 'max',
    priority: 'medium',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('sortedByLane', () => {
  it('inbox: sorted by createdAt descending', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'inbox', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeTask({ id: 'B', lane: 'inbox', createdAt: '2026-01-03T00:00:00.000Z' }),
      makeTask({ id: 'C', lane: 'inbox', createdAt: '2026-01-02T00:00:00.000Z' }),
    ];
    const result = sortedByLane(tasks);
    expect(result.inbox.map((t) => t.id)).toEqual(['B', 'C', 'A']);
  });

  it('now: sorted by priority rank then updatedAt desc', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'now', priority: 'low', updatedAt: '2026-01-03T00:00:00.000Z' }),
      makeTask({ id: 'B', lane: 'now', priority: 'high', updatedAt: '2026-01-01T00:00:00.000Z' }),
      makeTask({ id: 'C', lane: 'now', priority: 'high', updatedAt: '2026-01-02T00:00:00.000Z' }),
    ];
    const result = sortedByLane(tasks);
    expect(result.now.map((t) => t.id)).toEqual(['C', 'B', 'A']);
  });

  it('next: sorted by priority rank', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'next', priority: 'medium' }),
      makeTask({ id: 'B', lane: 'next', priority: 'high' }),
      makeTask({ id: 'C', lane: 'next', priority: 'low' }),
    ];
    const result = sortedByLane(tasks);
    expect(result.next[0].id).toBe('B');
    expect(result.next[2].id).toBe('C');
  });

  it('waiting: sorted by updatedAt desc', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'waiting', updatedAt: '2026-01-01T00:00:00.000Z' }),
      makeTask({ id: 'B', lane: 'waiting', updatedAt: '2026-01-03T00:00:00.000Z' }),
    ];
    const result = sortedByLane(tasks);
    expect(result.waiting.map((t) => t.id)).toEqual(['B', 'A']);
  });

  it('blocked: sorted by updatedAt desc', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'blocked', updatedAt: '2026-01-02T00:00:00.000Z' }),
      makeTask({ id: 'B', lane: 'blocked', updatedAt: '2026-01-04T00:00:00.000Z' }),
    ];
    const result = sortedByLane(tasks);
    expect(result.blocked[0].id).toBe('B');
  });

  it('done: sorted by updatedAt desc', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'done', updatedAt: '2026-01-01T00:00:00.000Z' }),
      makeTask({ id: 'B', lane: 'done', updatedAt: '2026-01-05T00:00:00.000Z' }),
    ];
    const result = sortedByLane(tasks);
    expect(result.done[0].id).toBe('B');
  });

  it('tasks go to correct lanes only', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'now' }),
      makeTask({ id: 'B', lane: 'inbox' }),
      makeTask({ id: 'C', lane: 'done' }),
    ];
    const result = sortedByLane(tasks);
    expect(result.now).toHaveLength(1);
    expect(result.inbox).toHaveLength(1);
    expect(result.done).toHaveLength(1);
    expect(result.next).toHaveLength(0);
  });
});
