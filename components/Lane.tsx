import type { Task, Lane as LaneType } from '@/types/task';
import { LANE_LABELS } from '@/types/task';
import { TaskCard } from '@/components/TaskCard';

const LANE_HEADER_COLORS: Record<LaneType, string> = {
  inbox: 'text-slate-300 border-slate-600',
  now: 'text-indigo-300 border-indigo-600',
  next: 'text-blue-300 border-blue-600',
  waiting: 'text-amber-300 border-amber-600',
  blocked: 'text-red-300 border-red-600',
  done: 'text-green-300 border-green-600',
};

interface LaneProps {
  lane: LaneType;
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export function Lane({ lane, tasks, onEdit }: LaneProps) {
  return (
    <div className="flex flex-col min-w-[220px] max-w-[280px] flex-1">
      <div className={`flex items-center gap-2 pb-2 mb-3 border-b ${LANE_HEADER_COLORS[lane]}`}>
        <h2 className="font-semibold text-sm uppercase tracking-wide">
          {LANE_LABELS[lane]}
        </h2>
        <span className="text-xs opacity-60 ml-auto">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
        {tasks.length === 0 && (
          <p className="text-xs text-neutral-600 italic">Empty</p>
        )}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}
