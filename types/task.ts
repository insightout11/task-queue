export type Lane =
  | 'inbox'
  | 'max-now'
  | 'cc-queue'
  | 'needs-matt-computer'
  | 'waiting-matt'
  | 'blocked-external'
  | 'done';

export type Project =
  | 'system'
  | 'lessoncaptain'
  | 'dizzyspinner'
  | 'marketing'
  | 'ops'
  | 'admin'
  | 'other';

export type Owner = 'max' | 'matt' | 'claude-code' | 'other';
export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  lane: Lane;
  project: Project;
  owner: Owner;
  priority: Priority;
  order?: number;          // explicit in-lane ordering (lower = first)
  statusNote?: string;
  specPath?: string;       // spec / prompt file — required for CC Queue
  sourcePath?: string;
  blockedReason?: string;  // what is the external blocker
  requiredAction?: string; // what specifically needs to happen (Needs Matt / Waiting on Matt)
  definitionOfDone?: string; // clear done criteria — required for CC Queue
  createdAt: string;
  updatedAt: string;
}

export const LANES: Lane[] = [
  'inbox',
  'max-now',
  'cc-queue',
  'needs-matt-computer',
  'waiting-matt',
  'blocked-external',
  'done',
];

// Lanes where explicit ordering + "what's next" matters
export const ACTIONABLE_LANES: Lane[] = [
  'max-now',
  'cc-queue',
  'needs-matt-computer',
  'waiting-matt',
];

export const LANE_LABELS: Record<Lane, string> = {
  'inbox':               'Inbox',
  'max-now':             'Max Can Do Now',
  'cc-queue':            'CC Queue',
  'needs-matt-computer': 'Needs Matt at Computer',
  'waiting-matt':        'Waiting on Matt',
  'blocked-external':    'Blocked External',
  'done':                'Done / Recent',
};

export const LANE_ICONS: Record<Lane, string> = {
  'inbox':               '↓',
  'max-now':             '→',
  'cc-queue':            '◈',
  'needs-matt-computer': '⌨',
  'waiting-matt':        '?',
  'blocked-external':    '✕',
  'done':                '✓',
};

export const LANE_SUBTITLES: Record<Lane, string> = {
  'inbox':               'Unsorted — needs routing',
  'max-now':             'Max acts independently, no dependencies',
  'cc-queue':            'Prepared work queued for Claude Code',
  'needs-matt-computer': 'Requires device, browser, or local access',
  'waiting-matt':        'Needs a quick answer, decision, or approval',
  'blocked-external':    'Stopped by something outside the team',
  'done':                'Recent completions',
};

export const LANE_HEADER_COLORS: Record<Lane, string> = {
  'inbox':               'text-slate-400 border-slate-700',
  'max-now':             'text-emerald-300 border-emerald-500',
  'cc-queue':            'text-violet-300 border-violet-600',
  'needs-matt-computer': 'text-blue-300 border-blue-600',
  'waiting-matt':        'text-amber-300 border-amber-600',
  'blocked-external':    'text-red-400 border-red-700',
  'done':                'text-neutral-400 border-neutral-700',
};

export const PROJECTS: Project[] = [
  'system', 'lessoncaptain', 'dizzyspinner', 'marketing', 'ops', 'admin', 'other',
];
export const OWNERS: Owner[] = ['max', 'matt', 'claude-code', 'other'];
export const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

export const PROJECT_COLORS: Record<Project, string> = {
  system:       'bg-purple-900 text-purple-200',
  lessoncaptain: 'bg-blue-900 text-blue-200',
  dizzyspinner: 'bg-pink-900 text-pink-200',
  marketing:    'bg-orange-900 text-orange-200',
  ops:          'bg-teal-900 text-teal-200',
  admin:        'bg-gray-700 text-gray-200',
  other:        'bg-zinc-700 text-zinc-200',
};

export const OWNER_COLORS: Record<Owner, string> = {
  max:          'bg-violet-900 text-violet-200',
  matt:         'bg-cyan-900 text-cyan-200',
  'claude-code':'bg-emerald-900 text-emerald-200',
  other:        'bg-zinc-700 text-zinc-200',
};

export const PRIORITY_DOT: Record<Priority, string> = {
  high:   'bg-red-500',
  medium: 'bg-yellow-500',
  low:    'bg-neutral-600',
};

/** A CC Queue task is ready when it has both a spec path and a definition of done */
export function isCCReady(task: Task): boolean {
  return !!(task.specPath && task.definitionOfDone);
}
