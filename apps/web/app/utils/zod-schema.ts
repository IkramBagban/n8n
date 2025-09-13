import { string, z } from "zod";

export const signupSchema = z.object({
  name: z.string().optional(),
  email: z.email(),
  password: z.string().min(4).max(20),
});

export const baseNodeSchema = z.object({
  parameters: z.record(z.any(), z.any()),
  type: z.string(),
  //   typeVersion: z.number(),
  position: z.tuple([z.number(), z.number()]),
  id: z.string(),
  name: z.string(),
  data: z.record(z.any(), z.any()),
});

export const createWorkflowSchema = z.object({
  name: z.string(), // name of workflow
  active: z.boolean(),
  nodes: z.array(baseNodeSchema),
  connections: z.array(z.any()), // have to create it's schema properly
  //   tags: z.array(z.string()), // will think about this later
  //   projectId: z.string(), // we are not creating the workflow under any project then we don't need this. but i think n8n make a project automatically if we don't create workflow in any project.
});
