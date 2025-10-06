"use server";

import { authOptions } from "@/lib/auth";
import { Workflow } from "@/lib/types";
import prismaClient from "@repo/db";
import { getServerSession } from "next-auth";

export const getWorkflows = async (): Promise<{
  data: Workflow[];
  count: number;
}> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { data: [], count: 0 };
  }
  
  const workflows = await prismaClient.workflow.findMany({
    where: { project: { userId: session.user.id } },
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

  // @ts-ignore
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
  // @ts-ignore
  return { data: workflows, count: workflows.length };
};
