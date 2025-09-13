import { createWorkflowSchema } from "@/app/utils/zod-schema";
import prismaClient from "@repo/db";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const body = await req.json();
  const { name, nodes, connections, active, tags, projectId } = body;
  console.log("body", body);

  const schemaResult = createWorkflowSchema.safeParse(body);

  if (!schemaResult.success) {
    return NextResponse.json({ error: schemaResult.error }, { status: 400 });
  }

  const [project, workflow] = await Promise.all([
    prismaClient.project.findFirst({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
      },
    }),
    prismaClient.workflow.create({
      data: {
        name: name,
        active: active,
        //   tags: tags || [],
        projectId: projectId,
        Node: {
          create: nodes.map((node) => ({ ...node })),
        },
        Connection: {
          create: connections.map((conn) => ({ ...conn })),
        },
      },
      include: {
        Node: true,
        Connection: true,
      },
    }),
  ]);

  const repsonsePaylaod = {
    ...workflow,
    homeProject: project,
    nodes: workflow.Node,
    connections: workflow.Connection,
  };

  delete repsonsePaylaod.Node;
  delete repsonsePaylaod.Connection;

  console.log("responsePayload", repsonsePaylaod);
  return NextResponse.json({ data: repsonsePaylaod }, { status: 201 });
};
