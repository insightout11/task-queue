'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import type { Task, Lane } from '@/types/task';
import { LANE_LABELS, PRIORITY_DOT, ACTIONABLE_LANES, isCCReady } from '@/types/task';
import { ProjectBadge, OwnerBadge } from '@/components/ui/Badge';
import { moveTask, deleteTask } from '@/actions/tasks';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  isNext?: boolean;
  onSaved?: () => void;
}

const LANE_QUICK_MOVES: Record<Lane, Lane[]> = {
  'inbox':               ['max-now', 'cc-queue', 'needs-matt-computer', 'waiting-matt'],
  'max-now':             ['done', 'cc-queue', 'needs-matt-computer', 'waiting-matt'],
  'cc-queue':            ['done', 'max-now', 'blocked-external', 'waiting-matt', 'needs-matt-computer'],
  'needs-matt-computer': ['done', 'max-now', 'waiting-matt'],
  'waiting-matt':        ['max-now', 'needs-matt-computer', 'done'],
  'blocked-external':    ['max-now', 'cc-queue', 'needs-matt-computer'],
  'done':                ['max-now', 'cc-queue'],
};

// Subtle left-border accent per lane
const CARD_ACCENT: Partial<Record<Lane, string>> = {
  'max-now':             'border-l-2 border-emerald-500',
  'needs-matt-computer': 'border-l-2 border-blue-500',
  'waiting-matt':        'border-l-2 border-amber-500',
  'blocked-external':    'border-l-2 border-red-600',
};

export function TaskCard({ task, onEdit, isNext = false, onSaved }: TaskCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showActions, setShowActions] = useState(false);
  const prevPendingRef = useRef(false);

  useEffect(() => {
    if (prevPendingRef.current && !isPending) onSaved?.();
    prevPendingRef.current = isPending;
  }, [isPending, onSaved]);

  function handleMove(lane: Lane) {
    if (lane === 'blocked-external') {
      const reason = window.prompt('What is the external blocker?', task.blockedReason ?? '');
      if (reason === null) return;
      const unblocksWhen = window.prompt('Unblocks when?', task.unblocksWhen ?? '') ?? '';
      startTransition(() => moveTask(task.id, lane, reason, unblocksWhen || undefined));
    } else {
      startTransition(() => moveTask(task.id, lane));
    }
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    startTransition(() => deleteTask(task.id));
  }

  const accent = CARD_ACCENT[task.lane] ?? '';
  const ccReady = task.lane === 'cc-queue' ? isCCReady(task) : null;

  return (
    <div
      className={`bg-neutral-800 rounded-lg p-3 flex flex-col gap-2 transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'} ${accent}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Next indicator — first card in an actionable lane */}
      {isNext && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 leading-none">
          ↑ next
        </span>
      )}

      {/* Title + priority dot */}
      <div className="flex items-start justify-between gap-2">
        <button
          className="text-sm text-white font-medium text-left hover:text-indigo-300 transition-colors leading-snug"
          onClick={() => onEdit(task)}
        >
          {task.title}
        </button>
        <span
          className={`flex-shrink-0 w-2 h-2 mt-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`}
          title={task.priority}
        />
      </div>

      {/* Project + owner badges */}
      <div className="flex flex-wrap gap-1">
        <ProjectBadge project={task.project} />
        <OwnerBadge owner={task.owner} />
      </div>

      {/* computerContext badge — needs-matt-computer */}
      {task.computerContext && (
        <span className="text-[11px] text-blue-300 bg-blue-950/60 border border-blue-800 rounded px-1.5 py-0.5 self-start leading-none">
          ⌨ {task.computerContext}
        </span>
      )}

      {/* Required action — shown prominently for routing lanes */}
      {task.requiredAction && (
        <p className="text-xs text-white/80 leading-snug bg-neutral-700 rounded px-2 py-1">
          {task.lane === 'needs-matt-computer' ? '⌨ ' : task.lane === 'waiting-matt' ? '? ' : ''}
          {task.requiredAction}
        </p>
      )}

      {/* Status note */}
      {task.statusNote && (
        <p className="text-xs text-neutral-400 leading-snug">{task.statusNote}</p>
      )}

      {/* Spec path — shown for CC Queue */}
      {task.specPath && (
        <p className="text-[11px] text-violet-400 font-mono leading-snug truncate" title={task.specPath}>
          ◈ {task.specPath}
        </p>
      )}

      {/* Definition of done — shown for CC Queue */}
      {task.lane === 'cc-queue' && task.definitionOfDone && (
        <p className="text-[11px] text-neutral-500 leading-snug">
          Done: {task.definitionOfDone}
        </p>
      )}

      {/* CC not-ready warning */}
      {ccReady === false && (
        <p className="text-[11px] text-amber-400 leading-snug">
          ⚠ Not CC-ready — add spec path + definition of done
        </p>
      )}

      {/* External blocker */}
      {task.blockedReason && (
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-red-400 leading-snug">✕ {task.blockedReason}</p>
          {task.unblocksWhen && (
            <p className="text-xs text-neutral-400 leading-snug">→ Unblocks when: {task.unblocksWhen}</p>
          )}
        </div>
      )}

      {/* Quick-move buttons (hover) */}
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
            className="text-xs px-2 py-0.5 rounded bg-red-950 hover:bg-red-900 text-red-300 transition-colors ml-auto"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
