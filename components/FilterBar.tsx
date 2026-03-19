'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { Project, Owner } from '@/types/task';
import { PROJECTS, OWNERS } from '@/types/task';

interface FilterBarProps {
  onNewTask: () => void;
}

export function FilterBar({ onNewTask }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const project = searchParams.get('project') ?? '';
  const owner = searchParams.get('owner') ?? '';
  const search = searchParams.get('q') ?? '';

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
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

      {(project || owner || search) && (
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
  );
}
