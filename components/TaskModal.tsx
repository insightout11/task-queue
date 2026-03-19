'use client';

import { useEffect, useRef, useTransition } from 'react';
import type { Task } from '@/types/task';
import { LANES, LANE_LABELS, PROJECTS, OWNERS, PRIORITIES } from '@/types/task';
import { createTask, updateTask } from '@/actions/tasks';

interface TaskModalProps {
  task: Task | null; // null = create mode
  onClose: () => void;
}

export function TaskModal({ task, onClose }: TaskModalProps) {
  const [isPending, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      if (task) {
        await updateTask(fd);
      } else {
        await createTask(fd);
      }
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-lg mx-4 p-6 shadow-xl">
        <h2 className="text-white font-semibold text-lg mb-4">
          {task ? 'Edit Task' : 'New Task'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {task && <input type="hidden" name="id" value={task.id} />}

          <div>
            <label className="text-xs text-neutral-400 uppercase tracking-wide mb-1 block">Title *</label>
            <input
              ref={titleRef}
              name="title"
              defaultValue={task?.title ?? ''}
              required
              className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Task title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-wide mb-1 block">Lane</label>
              <select name="lane" defaultValue={task?.lane ?? 'inbox'} className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                {LANES.map((l) => <option key={l} value={l}>{LANE_LABELS[l]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-wide mb-1 block">Priority</label>
              <select name="priority" defaultValue={task?.priority ?? 'medium'} className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-wide mb-1 block">Project</label>
              <select name="project" defaultValue={task?.project ?? 'other'} className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                {PROJECTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-wide mb-1 block">Owner</label>
              <select name="owner" defaultValue={task?.owner ?? 'other'} className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500">
                {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 uppercase tracking-wide mb-1 block">Status Note</label>
            <input
              name="statusNote"
              defaultValue={task?.statusNote ?? ''}
              className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Optional short note"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 uppercase tracking-wide mb-1 block">Blocked Reason</label>
            <input
              name="blockedReason"
              defaultValue={task?.blockedReason ?? ''}
              className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Why is this blocked?"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-wide mb-1 block">Spec Path</label>
              <input
                name="specPath"
                defaultValue={task?.specPath ?? ''}
                className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="ops/spec.md"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-wide mb-1 block">Source Path</label>
              <input
                name="sourcePath"
                defaultValue={task?.sourcePath ?? ''}
                className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="src/feature"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-neutral-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? 'Saving…' : task ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
