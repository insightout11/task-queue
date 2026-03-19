import type { Project, Owner } from '@/types/task';
import { PROJECT_COLORS, OWNER_COLORS } from '@/types/task';

export function ProjectBadge({ project }: { project: Project }) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PROJECT_COLORS[project]}`}>
      {project}
    </span>
  );
}

export function OwnerBadge({ owner }: { owner: Owner }) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${OWNER_COLORS[owner]}`}>
      {owner}
    </span>
  );
}
