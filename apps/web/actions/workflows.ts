"use server";

import { Workflow } from "@/lib/types";
import prismaClient from "@repo/db";

export const getWorkflows = async (): Promise<{
  data: Workflow[];
  count: number;
}> => {
  const workflows = await prismaClient.workflow.findMany({
    include: {
      project: {
        select: {
          id: true,
          type: true,
          name: true,
          icon: true,
        },
      },
    },
  });
  return { data: workflows, count: workflows.length };
};

export const getWorkflowsOfProject = async (
  projectId: string
): Promise<{ data: Workflow[]; count: number }> => {
  const workflows = await prismaClient.workflow.findMany({
    where: { projectId: projectId },
    include: {
      project: {
        select: {
          id: true,
          type: true,
          name: true,
          icon: true,
        },
      },
    },
  });

  if (!workflows) {
    return { data: [], count: 0 };
  }
  return { data: workflows, count: workflows.length };
};
