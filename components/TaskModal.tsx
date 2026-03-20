'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { Task, Lane } from '@/types/task';
import { LANES, LANE_LABELS, PROJECTS, OWNERS, PRIORITIES } from '@/types/task';
import { createTask, updateTask } from '@/actions/tasks';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSaved?: () => void;
}

const input = 'w-full bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-neutral-600';
const inputWarn = 'w-full bg-neutral-800 border border-amber-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 placeholder-neutral-600';
const label = 'text-xs text-neutral-500 uppercase tracking-wide mb-1 block';
const labelWarn = 'text-xs text-amber-500 uppercase tracking-wide mb-1 block';

export function TaskModal({ task, onClose, onSaved }: TaskModalProps) {
  const [isPending, startTransition] = useTransition();
  const [lane, setLane] = useState<Lane>(task?.lane ?? 'inbox');
  const titleRef = useRef<HTMLInputElement>(null);

  const isCCQueue = lane === 'cc-queue';
  const isBlockedExternal = lane === 'blocked-external';
  const isRoutingLane = lane === 'needs-matt-computer' || lane === 'waiting-matt';

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Remove empty strings so optional fields don't get persisted as ""
    for (const [key, val] of [...fd.entries()]) {
      if (val === '') fd.delete(key);
    }
    startTransition(async () => {
      if (task) { await updateTask(fd); } else { await createTask(fd); }
      onSaved?.();
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-lg mx-4 p-6 shadow-xl max-h-[92vh] overflow-y-auto">
        <h2 className="text-white font-semibold text-base mb-4">
          {task ? 'Edit Task' : 'New Task'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {task && <input type="hidden" name="id" value={task.id} />}

          {/* Title */}
          <div>
            <label className={label}>Title *</label>
            <input ref={titleRef} name="title" defaultValue={task?.title ?? ''} required className={input} placeholder="Task title" />
          </div>

          {/* Lane + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Lane</label>
              <select
                name="lane"
                value={lane}
                onChange={(e) => setLane(e.target.value as Lane)}
                className={input}
              >
                {LANES.map((l) => <option key={l} value={l}>{LANE_LABELS[l]}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Priority</label>
              <select name="priority" defaultValue={task?.priority ?? 'medium'} className={input}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Project + Owner */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Project</label>
              <select name="project" defaultValue={task?.project ?? 'other'} className={input}>
                {PROJECTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Owner</label>
              <select name="owner" defaultValue={task?.owner ?? 'other'} className={input}>
                {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Order + Status Note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Order <span className="opacity-50 normal-case">(in-lane position)</span></label>
              <input
                name="order"
                type="number"
                defaultValue={task?.order ?? ''}
                className={input}
                placeholder="1, 2, 3…"
              />
            </div>
            <div>
              <label className={label}>Status Note</label>
              <input name="statusNote" defaultValue={task?.statusNote ?? ''} className={input} placeholder="Short context" />
            </div>
          </div>

          {/* Required Action — highlighted for routing lanes */}
          {(isRoutingLane || task?.requiredAction) && (
            <div>
              <label className={isRoutingLane ? labelWarn : label}>
                {lane === 'needs-matt-computer' ? '⌨ What does Matt need to do?' : '? What decision/answer is needed?'}
              </label>
              <input
                name="requiredAction"
                defaultValue={task?.requiredAction ?? ''}
                className={isRoutingLane ? inputWarn : input}
                placeholder={lane === 'needs-matt-computer' ? 'e.g. log into Stripe, attach browser, run local test' : 'e.g. confirm pricing tier, approve design direction'}
              />
            </div>
          )}

          {/* CC Queue prep block */}
          {isCCQueue ? (
            <div className="flex flex-col gap-3 border border-amber-800/60 rounded-lg p-3 bg-amber-950/20">
              <p className="text-[11px] text-amber-400 font-medium">
                ◈ CC Queue prep — both fields required for this task to be CC-ready
              </p>
              <div>
                <label className={labelWarn}>Spec / Prompt File Path *</label>
                <input name="specPath" defaultValue={task?.specPath ?? ''} className={inputWarn} placeholder="ops/feature-spec.md" />
              </div>
              <div>
                <label className={labelWarn}>Definition of Done *</label>
                <input name="definitionOfDone" defaultValue={task?.definitionOfDone ?? ''} className={inputWarn} placeholder="How we know CC is finished" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Spec Path</label>
                <input name="specPath" defaultValue={task?.specPath ?? ''} className={input} placeholder="ops/spec.md" />
              </div>
              <div>
                <label className={label}>Source Path</label>
                <input name="sourcePath" defaultValue={task?.sourcePath ?? ''} className={input} placeholder="src/feature" />
              </div>
            </div>
          )}

          {/* Needs Matt at Computer — computerContext */}
          {(lane === 'needs-matt-computer' || task?.computerContext) && (
            <div>
              <label className={lane === 'needs-matt-computer' ? labelWarn : label}>
                ⌨ Computer context
              </label>
              <input
                name="computerContext"
                defaultValue={task?.computerContext ?? ''}
                className={lane === 'needs-matt-computer' ? inputWarn : input}
                placeholder="e.g. browser + login, local file, terminal"
              />
            </div>
          )}

          {/* Blocked External reason + unblocks-when */}
          {(isBlockedExternal || task?.blockedReason) && (
            <div className="flex flex-col gap-3">
              <div>
                <label className={isBlockedExternal ? labelWarn : label}>External Blocker</label>
                <input
                  name="blockedReason"
                  defaultValue={task?.blockedReason ?? ''}
                  className={isBlockedExternal ? inputWarn : input}
                  placeholder="What is stopped, and why"
                />
              </div>
              <div>
                <label className={isBlockedExternal ? labelWarn : label}>Unblocks when</label>
                <input
                  name="unblocksWhen"
                  defaultValue={task?.unblocksWhen ?? ''}
                  className={isBlockedExternal ? inputWarn : input}
                  placeholder="What event resolves this blocker"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">
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
