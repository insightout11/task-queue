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
    expect(sortedByLane(tasks)['inbox'].map((t) => t.id)).toEqual(['B', 'C', 'A']);
  });

  it('max-now: explicit order takes precedence over priority', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'max-now', priority: 'high', order: 3 }),
      makeTask({ id: 'B', lane: 'max-now', priority: 'low',  order: 1 }),
      makeTask({ id: 'C', lane: 'max-now', priority: 'high', order: 2 }),
    ];
    expect(sortedByLane(tasks)['max-now'].map((t) => t.id)).toEqual(['B', 'C', 'A']);
  });

  it('max-now: falls back to priority when no order set', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'max-now', priority: 'low' }),
      makeTask({ id: 'B', lane: 'max-now', priority: 'high' }),
      makeTask({ id: 'C', lane: 'max-now', priority: 'medium' }),
    ];
    const result = sortedByLane(tasks)['max-now'].map((t) => t.id);
    expect(result[0]).toBe('B');
    expect(result[2]).toBe('A');
  });

  it('cc-queue: sorted by order then priority', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'cc-queue', priority: 'high', order: 2 }),
      makeTask({ id: 'B', lane: 'cc-queue', priority: 'low',  order: 1 }),
    ];
    expect(sortedByLane(tasks)['cc-queue'].map((t) => t.id)).toEqual(['B', 'A']);
  });

  it('needs-matt-computer: sorted by order then priority', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'needs-matt-computer', priority: 'low',  order: 1 }),
      makeTask({ id: 'B', lane: 'needs-matt-computer', priority: 'high', order: 2 }),
    ];
    expect(sortedByLane(tasks)['needs-matt-computer'][0].id).toBe('A');
  });

  it('waiting-matt: sorted by order then priority', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'waiting-matt', priority: 'high', order: 2 }),
      makeTask({ id: 'B', lane: 'waiting-matt', priority: 'low',  order: 1 }),
    ];
    expect(sortedByLane(tasks)['waiting-matt'][0].id).toBe('B');
  });

  it('blocked-external: sorted by updatedAt desc', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'blocked-external', updatedAt: '2026-01-01T00:00:00.000Z' }),
      makeTask({ id: 'B', lane: 'blocked-external', updatedAt: '2026-01-04T00:00:00.000Z' }),
    ];
    expect(sortedByLane(tasks)['blocked-external'][0].id).toBe('B');
  });

  it('done: sorted by updatedAt desc', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'done', updatedAt: '2026-01-01T00:00:00.000Z' }),
      makeTask({ id: 'B', lane: 'done', updatedAt: '2026-01-05T00:00:00.000Z' }),
    ];
    expect(sortedByLane(tasks)['done'][0].id).toBe('B');
  });

  it('tasks land in correct lanes only', () => {
    const tasks = [
      makeTask({ id: 'A', lane: 'max-now' }),
      makeTask({ id: 'B', lane: 'inbox' }),
      makeTask({ id: 'C', lane: 'done' }),
    ];
    const result = sortedByLane(tasks);
    expect(result['max-now']).toHaveLength(1);
    expect(result['inbox']).toHaveLength(1);
    expect(result['done']).toHaveLength(1);
    expect(result['cc-queue']).toHaveLength(0);
    expect(result['needs-matt-computer']).toHaveLength(0);
  });
});
