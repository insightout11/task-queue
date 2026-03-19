'use client';

import { useState, useTransition } from 'react';
import type { Task, Lane } from '@/types/task';
import { LANES, LANE_LABELS, PRIORITY_DOT } from '@/types/task';
import { ProjectBadge, OwnerBadge } from '@/components/ui/Badge';
import { moveTask, deleteTask } from '@/actions/tasks';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const LANE_QUICK_MOVES: Record<Lane, Lane[]> = {
  inbox: ['now', 'next'],
  now: ['done', 'blocked', 'next'],
  next: ['now', 'done'],
  waiting: ['now', 'next', 'done'],
  blocked: ['now', 'next'],
  done: ['now', 'next'],
};

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showActions, setShowActions] = useState(false);

  function handleMove(lane: Lane) {
    if (lane === 'blocked') {
      const reason = window.prompt('Reason blocked?', task.blockedReason ?? '');
      if (reason === null) return; // cancelled
      startTransition(() => moveTask(task.id, lane, reason));
    } else {
      startTransition(() => moveTask(task.id, lane));
    }
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    startTransition(() => deleteTask(task.id));
  }

  const nowHighlight =
    task.lane === 'now' && task.priority === 'high'
      ? 'border-l-2 border-indigo-400'
      : '';

  return (
    <div
      className={`bg-neutral-800 rounded-lg p-3 flex flex-col gap-2 opacity-${isPending ? '50' : '100'} transition-opacity ${nowHighlight}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <button
          className="text-sm text-white font-medium text-left hover:text-indigo-300 transition-colors leading-snug"
          onClick={() => onEdit(task)}
        >
          {task.title}
        </button>
        <span className={`flex-shrink-0 w-2 h-2 mt-1 rounded-full ${PRIORITY_DOT[task.priority]}`} title={task.priority} />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1">
        <ProjectBadge project={task.project} />
        <OwnerBadge owner={task.owner} />
      </div>

      {/* Status note */}
      {task.statusNote && (
        <p className="text-xs text-neutral-400 leading-snug">{task.statusNote}</p>
      )}

      {/* Blocked reason */}
      {task.blockedReason && (
        <p className="text-xs text-red-400 leading-snug">⛔ {task.blockedReason}</p>
      )}

      {/* Quick-move buttons */}
      {showActions && (
        <div className="flex flex-wrap gap-1 pt-1 border-t border-neutral-700">
          {LANE_QUICK_MOVES[task.lane].map((lane) => (
            <button
              key={lane}
              onClick={() => handleMove(lane)}
              disabled={isPending}
              className="text-xs px-2 py-0.5 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-200 transition-colors"
            >
              → {LANE_LABELS[lane]}
            </button>
          ))}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs px-2 py-0.5 rounded bg-red-900 hover:bg-red-800 text-red-200 transition-colors ml-auto"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
