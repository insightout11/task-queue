'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Task } from '@/types/task';
import { LANES } from '@/types/task';
import { sortedByLane } from '@/lib/task-sort';
import { Lane } from '@/components/Lane';
import { FilterBar } from '@/components/FilterBar';
import { TaskModal } from '@/components/TaskModal';

interface BoardProps {
  tasks: Task[];
}

export function Board({ tasks }: BoardProps) {
  const [editingTask, setEditingTask] = useState<Task | null | 'new'>(null);
  const searchParams = useSearchParams();

  const project = searchParams.get('project') ?? '';
  const owner = searchParams.get('owner') ?? '';
  const search = searchParams.get('q') ?? '';

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (project && t.project !== project) return false;
      if (owner && t.owner !== owner) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, project, owner, search]);

  const byLane = useMemo(() => sortedByLane(filtered), [filtered]);

  const modalTask = editingTask === 'new' ? null : editingTask;
  const modalOpen = editingTask !== null;

  return (
    <>
      <FilterBar onNewTask={() => setEditingTask('new')} />

      <div className="flex gap-4 overflow-x-auto pb-4 min-h-0 flex-1">
        {LANES.map((lane) => (
          <Lane
            key={lane}
            lane={lane}
            tasks={byLane[lane]}
            onEdit={setEditingTask}
          />
        ))}
      </div>

      {modalOpen && (
        <TaskModal
          task={modalTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </>
  );
}
