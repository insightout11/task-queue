import { Suspense } from 'react';
import { readTasks, getStorePath } from '@/lib/task-store';
import { Board } from '@/components/Board';

export const dynamic = 'force-dynamic';

export default function Home() {
  const tasks = readTasks();
  const storePath = getStorePath();

  return (
    <div className="flex flex-col h-full p-4">
      <header className="mb-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-white tracking-tight">Task Queue</h1>
        <p className="text-xs text-neutral-500 mt-0.5">{tasks.length} tasks</p>
      </header>
      <div className="flex flex-col flex-1 min-h-0">
        <Suspense>
          <Board tasks={tasks} storePath={storePath} />
        </Suspense>
      </div>
    </div>
  );
}
