'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Task, Lane } from '@/types/task';
import { LANES, ACTIONABLE_LANES } from '@/types/task';
import { sortedByLane } from '@/lib/task-sort';
import { Lane as LaneComponent } from '@/components/Lane';
import { FilterBar } from '@/components/FilterBar';
import { TaskModal } from '@/components/TaskModal';

interface BoardProps {
  tasks: Task[];
}

export function Board({ tasks }: BoardProps) {
  const [editingTask, setEditingTask] = useState<Task | null | 'new'>(null);
  const searchParams = useSearchParams();

  const project  = searchParams.get('project')  ?? '';
  const owner    = searchParams.get('owner')    ?? '';
  const search   = searchParams.get('q')        ?? '';
  const priority = searchParams.get('priority') ?? '';
  const lane     = searchParams.get('lane')     ?? '';
  const view     = searchParams.get('view')     ?? '';

  // Resolve lane scope from view or lane param (view takes precedence)
  function laneScope(task: Task): boolean {
    if (view === 'max-only')    return task.lane === 'max-now';
    if (view === 'needs-matt')  return task.lane === 'needs-matt-computer' || task.lane === 'waiting-matt';
    if (view === 'at-computer') return task.lane === 'needs-matt-computer';
    if (view === 'next-up')     return true; // next-up trims after sorting, not here
    if (lane)                   return task.lane === (lane as Lane);
    return true;
  }

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (!laneScope(t)) return false;
      if (project  && t.project  !== project)                              return false;
      if (owner    && t.owner    !== owner)                                return false;
      if (priority && t.priority !== priority)                             return false;
      if (search   && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, project, owner, priority, search, lane, view]);

  const byLane = useMemo(() => {
    const sorted = sortedByLane(filtered);
    // next-up: trim each actionable lane to its first item
    if (view === 'next-up') {
      const trimmed = { ...sorted };
      for (const al of ACTIONABLE_LANES) {
        trimmed[al] = sorted[al].slice(0, 1);
      }
      return trimmed;
    }
    return sorted;
  }, [filtered, view]);

  const modalTask = editingTask === 'new' ? null : editingTask;
  const modalOpen = editingTask !== null;

  return (
    <>
      <FilterBar onNewTask={() => setEditingTask('new')} />

      <div className="flex gap-4 overflow-x-auto pb-4 min-h-0 flex-1">
        {LANES.map((l) => (
          <LaneComponent
            key={l}
            lane={l}
            tasks={byLane[l]}
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
