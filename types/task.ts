export type Lane = 'inbox' | 'now' | 'next' | 'waiting' | 'blocked' | 'done';
export type Project = 'system' | 'lessoncaptain' | 'dizzyspinner' | 'marketing' | 'ops' | 'admin' | 'other';
export type Owner = 'max' | 'matt' | 'claude-code' | 'other';
export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  lane: Lane;
  project: Project;
  owner: Owner;
  priority: Priority;
  statusNote?: string;
  specPath?: string;
  sourcePath?: string;
  blockedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const LANES: Lane[] = ['inbox', 'now', 'next', 'waiting', 'blocked', 'done'];

export const LANE_LABELS: Record<Lane, string> = {
  inbox: 'Inbox',
  now: 'Now',
  next: 'Next',
  waiting: 'Waiting',
  blocked: 'Blocked',
  done: 'Done',
};

export const LANE_COLORS: Record<Lane, string> = {
  inbox: 'slate',
  now: 'indigo',
  next: 'blue',
  waiting: 'amber',
  blocked: 'red',
  done: 'green',
};

export const PROJECTS: Project[] = ['system', 'lessoncaptain', 'dizzyspinner', 'marketing', 'ops', 'admin', 'other'];
export const OWNERS: Owner[] = ['max', 'matt', 'claude-code', 'other'];
export const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

export const PROJECT_COLORS: Record<Project, string> = {
  system: 'bg-purple-900 text-purple-200',
  lessoncaptain: 'bg-blue-900 text-blue-200',
  dizzyspinner: 'bg-pink-900 text-pink-200',
  marketing: 'bg-orange-900 text-orange-200',
  ops: 'bg-teal-900 text-teal-200',
  admin: 'bg-gray-700 text-gray-200',
  other: 'bg-zinc-700 text-zinc-200',
};

export const OWNER_COLORS: Record<Owner, string> = {
  max: 'bg-violet-900 text-violet-200',
  matt: 'bg-cyan-900 text-cyan-200',
  'claude-code': 'bg-emerald-900 text-emerald-200',
  other: 'bg-zinc-700 text-zinc-200',
};

export const PRIORITY_DOT: Record<Priority, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-500',
};
