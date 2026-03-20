'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { Project, Owner, Priority } from '@/types/task';
import { PROJECTS, OWNERS, PRIORITIES, LANES, LANE_LABELS } from '@/types/task';

interface FilterBarProps {
  onNewTask: () => void;
}

type QuickView = 'max-only' | 'needs-matt' | 'at-computer' | 'next-up';

const QUICK_VIEWS: { id: QuickView; label: string }[] = [
  { id: 'max-only',    label: 'Max Only' },
  { id: 'needs-matt',  label: 'Needs Matt' },
  { id: 'at-computer', label: 'At Computer' },
  { id: 'next-up',     label: 'Next Up' },
];

export function FilterBar({ onNewTask }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const project  = searchParams.get('project')  ?? '';
  const owner    = searchParams.get('owner')    ?? '';
  const search   = searchParams.get('q')        ?? '';
  const priority = searchParams.get('priority') ?? '';
  const lane     = searchParams.get('lane')     ?? '';
  const view     = searchParams.get('view')     ?? '';

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  function setView(id: QuickView) {
    const params = new URLSearchParams(searchParams.toString());
    if (view === id) {
      params.delete('view');
    } else {
      params.set('view', id);
      params.delete('lane'); // quick views clear lane filter
    }
    router.replace(`?${params.toString()}`);
  }

  const hasFilters = project || owner || search || priority || lane || view;

  return (
    <div className="flex flex-col gap-2 mb-6">
      {/* Row 1: search, dropdowns, clear, new task */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => update('q', e.target.value)}
          className="bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 w-48"
        />

        <select
          value={project}
          onChange={(e) => update('project', e.target.value)}
          className="bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All projects</option>
          {PROJECTS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={owner}
          onChange={(e) => update('owner', e.target.value)}
          className="bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All owners</option>
          {OWNERS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => update('priority', e.target.value)}
          className="bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p: Priority) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={lane}
          onChange={(e) => {
            update('lane', e.target.value);
            if (e.target.value) update('view', ''); // lane filter clears view
          }}
          className="bg-neutral-800 border border-neutral-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All lanes</option>
          {LANES.map((l) => (
            <option key={l} value={l}>{LANE_LABELS[l]}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => router.replace('/')}
            className="text-xs text-neutral-400 hover:text-white transition-colors underline"
          >
            Clear
          </button>
        )}

        <button
          onClick={onNewTask}
          className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Row 2: quick-view buttons */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_VIEWS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
              view === id
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-neutral-800 border-neutral-600 text-neutral-400 hover:text-white hover:border-neutral-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
