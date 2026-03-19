import type { Task, Lane as LaneType } from '@/types/task';
import {
  LANE_LABELS,
  LANE_ICONS,
  LANE_SUBTITLES,
  LANE_HEADER_COLORS,
  ACTIONABLE_LANES,
} from '@/types/task';
import { TaskCard } from '@/components/TaskCard';

interface LaneProps {
  lane: LaneType;
  tasks: Task[];
  onEdit: (task: Task) => void;
}

const LANE_BG: Partial<Record<LaneType, string>> = {
  'max-now': 'bg-emerald-950/20',
};

export function Lane({ lane, tasks, onEdit }: LaneProps) {
  const isActionable = ACTIONABLE_LANES.includes(lane);
  const bg = LANE_BG[lane] ?? '';

  return (
    <div className={`flex flex-col min-w-[220px] max-w-[280px] flex-1 rounded-lg ${bg} ${bg ? 'p-2' : ''}`}>
      {/* Lane header */}
      <div className={`pb-2 mb-3 border-b ${LANE_HEADER_COLORS[lane]}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] opacity-50 select-none">{LANE_ICONS[lane]}</span>
          <h2 className="font-semibold text-sm uppercase tracking-wide leading-tight flex-1">
            {LANE_LABELS[lane]}
          </h2>
          <span className="text-xs opacity-50 flex-shrink-0">{tasks.length}</span>
        </div>
        <p className="text-[10px] opacity-40 mt-0.5 leading-none pl-4">
          {LANE_SUBTITLES[lane]}
        </p>
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
        {tasks.length === 0 && (
          <p className="text-xs text-neutral-700 italic">Empty</p>
        )}
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            isNext={isActionable && index === 0}
          />
        ))}
      </div>
    </div>
  );
}
