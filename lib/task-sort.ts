import type { Task, Lane, Priority } from '@/types/task';

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function sortForLane(tasks: Task[], lane: Lane): Task[] {
  const inLane = tasks.filter((t) => t.lane === lane);
  switch (lane) {
    case 'inbox':
      return inLane.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'now':
    case 'next':
      return inLane.sort((a, b) => {
        const pd = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (pd !== 0) return pd;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
    case 'waiting':
    case 'blocked':
    case 'done':
      return inLane.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

export function sortedByLane(tasks: Task[]): Record<Lane, Task[]> {
  return {
    inbox: sortForLane(tasks, 'inbox'),
    now: sortForLane(tasks, 'now'),
    next: sortForLane(tasks, 'next'),
    waiting: sortForLane(tasks, 'waiting'),
    blocked: sortForLane(tasks, 'blocked'),
    done: sortForLane(tasks, 'done'),
  };
}
