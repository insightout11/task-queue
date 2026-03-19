import { z } from 'zod';

const LaneEnum = z.enum([
  'inbox', 'max-now', 'cc-queue', 'needs-matt-computer', 'waiting-matt', 'blocked-external', 'done',
]);
const ProjectEnum = z.enum([
  'system', 'lessoncaptain', 'dizzyspinner', 'marketing', 'ops', 'admin', 'other',
]);
const OwnerEnum = z.enum(['max', 'matt', 'claude-code', 'other']);
const PriorityEnum = z.enum(['high', 'medium', 'low']);

export const CreateTaskSchema = z.object({
  title:           z.string().min(1).max(200),
  lane:            LaneEnum.default('inbox'),
  project:         ProjectEnum.default('other'),
  owner:           OwnerEnum.default('other'),
  priority:        PriorityEnum.default('medium'),
  order:           z.coerce.number().int().optional(),
  statusNote:      z.string().max(500).optional(),
  specPath:        z.string().max(500).optional(),
  sourcePath:      z.string().max(500).optional(),
  blockedReason:   z.string().max(500).optional(),
  requiredAction:  z.string().max(500).optional(),
  definitionOfDone: z.string().max(1000).optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.extend({
  id: z.string(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
