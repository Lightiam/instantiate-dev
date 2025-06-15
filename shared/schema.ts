
import { z } from 'zod';

// Simple schema definitions without drizzle-orm dependencies
export const DeploymentSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  provider: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.string(),
  createdAt: z.string()
});

export const ResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  provider: z.string(),
  region: z.string(),
  status: z.string(),
  cost: z.number().optional(),
  createdAt: z.string()
});

export const CloudProviderSchema = z.object({
  provider: z.string(),
  status: z.enum(['connected', 'error', 'not-configured']),
  resourceCount: z.number(),
  totalCost: z.number().optional(),
  lastSync: z.string()
});

export type Deployment = z.infer<typeof DeploymentSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type CloudProvider = z.infer<typeof CloudProviderSchema>;
