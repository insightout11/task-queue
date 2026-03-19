import type { Task, Lane, Priority } from '@/types/task';

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function sortForLane(tasks: Task[], lane: Lane): Task[] {
  const inLane = tasks.filter((t) => t.lane === lane);
  switch (lane) {
    case 'inbox':
      return inLane.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    // Actionable lanes: explicit order first, then priority, then updatedAt
    case 'max-now':
    case 'cc-queue':
    case 'needs-matt-computer':
    case 'waiting-matt':
      return inLane.sort((a, b) => {
        const ao = a.order ?? Infinity;
        const bo = b.order ?? Infinity;
        if (ao !== bo) return ao - bo;
        const pd = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (pd !== 0) return pd;
        return b.updatedAt.localeCompare(a.updatedAt);
      });

    case 'blocked-external':
    case 'done':
      return inLane.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
}

export function sortedByLane(tasks: Task[]): Record<Lane, Task[]> {
  return {
    'inbox':               sortForLane(tasks, 'inbox'),
    'max-now':             sortForLane(tasks, 'max-now'),
    'cc-queue':            sortForLane(tasks, 'cc-queue'),
    'needs-matt-computer': sortForLane(tasks, 'needs-matt-computer'),
    'waiting-matt':        sortForLane(tasks, 'waiting-matt'),
    'blocked-external':    sortForLane(tasks, 'blocked-external'),
    'done':                sortForLane(tasks, 'done'),
  };
}
