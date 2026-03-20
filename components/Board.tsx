'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Task, Lane } from '@/types/task';
import { LANES, ACTIONABLE_LANES } from '@/types/task';
import { sortedByLane } from '@/lib/task-sort';
import { Lane as LaneComponent } from '@/components/Lane';
import { FilterBar } from '@/components/FilterBar';
import { TaskModal } from '@/components/TaskModal';

interface BoardProps {
  tasks: Task[];
  storePath: string;
  boardLabel?: string;
}

function fmtSaved(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Shorten the path for display: replace home dir with ~
function displayPath(p: string): string {
  if (typeof window === 'undefined') return p;
  // On the client the actual home dir isn't known, so just show as-is
  return p;
}

export function Board({ tasks, storePath, boardLabel }: BoardProps) {
  const [editingTask, setEditingTask] = useState<Task | null | 'new'>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const searchParams = useSearchParams();

  const project  = searchParams.get('project')  ?? '';
  const owner    = searchParams.get('owner')    ?? '';
  const search   = searchParams.get('q')        ?? '';
  const priority = searchParams.get('priority') ?? '';
  const lane     = searchParams.get('lane')     ?? '';
  const view     = searchParams.get('view')     ?? '';

  const onSaved = useCallback(() => setLastSaved(new Date()), []);

  // Resolve lane scope from view or lane param (view takes precedence)
  function laneScope(task: Task): boolean {
    if (view === 'max-only')    return task.lane === 'max-now';
    if (view === 'needs-matt')  return task.lane === 'needs-matt-computer' || task.lane === 'waiting-matt';
    if (view === 'at-computer') return task.lane === 'needs-matt-computer';
    if (view === 'next-up')     return true;
    if (lane)                   return task.lane === (lane as Lane);
    return true;
  }

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (!laneScope(t)) return false;
      if (project  && t.project  !== project)                                return false;
      if (owner    && t.owner    !== owner)                                  return false;
      if (priority && t.priority !== priority)                               return false;
      if (search   && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, project, owner, priority, search, lane, view]);

  const byLane = useMemo(() => {
    const sorted = sortedByLane(filtered);
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
            onSaved={onSaved}
          />
        ))}
      </div>

      {/* Source indicator */}
      <div className="flex items-center gap-2 pt-2 border-t border-neutral-800 flex-shrink-0 mt-2">
        {boardLabel && (
          <span className="text-[11px] font-semibold text-indigo-400 flex-shrink-0 uppercase tracking-wide">
            {boardLabel}
          </span>
        )}
        <span className="text-[11px] text-neutral-600 font-mono truncate flex-1" title={storePath}>
          ⊞ {storePath}
        </span>
        {lastSaved ? (
          <span className="text-[11px] text-emerald-600 flex-shrink-0">
            Saved {fmtSaved(lastSaved)}
          </span>
        ) : (
          <span className="text-[11px] text-neutral-700 flex-shrink-0">No changes yet</span>
        )}
      </div>

      {modalOpen && (
        <TaskModal
          task={modalTask}
          onClose={() => setEditingTask(null)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
