import { createWorkflowSchema } from "@/utils/zod-schema";
import prismaClient from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id: workflowId } = await params;

  const workflow = await prismaClient.workflow.findUnique({
    where: { id: workflowId },
    include: { Node: true, Edge: true },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const project = await prismaClient.project.findFirst({
    where: { id: workflow.projectId },
    select: { id: true, name: true, description: true, icon: true },
  });

  const responsePayload = {
    ...workflow,
    homeProject: project,
    nodes: workflow.Node,
    edges: workflow.Edge,
  };

  delete responsePayload.Node;
  delete responsePayload.Edge;

  return NextResponse.json({ data: responsePayload }, { status: 200 });
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await req.json();
    const { name, nodes, edges, active, tags, projectId } = body;
    const { id: workflowId } = await params;

    const schemaResult = createWorkflowSchema.safeParse(body);
    if (!schemaResult.success) {
      return NextResponse.json(
        { error: JSON.parse(schemaResult.error.message) },
        { status: 400 }
      );
    }

    const project = await prismaClient.project.findFirst({
      where: { id: projectId },
      select: { id: true, name: true, description: true, icon: true },
    });
    // const [project, workflow] = await Promise.all([
    const workflow = await prismaClient.$transaction(async (tx) => {
      await tx.edge.deleteMany({
        where: { workflowId },
      });

      await tx.node.deleteMany({
        where: { workflowId },
      });

      const updatedWorkflow = await tx.workflow.update({
        where: { id: workflowId },
        data: {
          name,
          active,
          projectId,
        },
      });

      const createdNodes = await Promise.all(
        nodes.map((node: any) =>
          tx.node.create({
            data: {
              id: node.id,
              name: node.name,
              type: node.type,
              parameters: node.parameters || {},
              position: node.position || [0, 0],
              credentialId: node.credentialId || null,
              data: node.data || {},
              workflowId,
            },
          })
        )
      );

      const createdEdges = await Promise.all(
        edges.map((edge: any) =>
          tx.edge.create({
            data: {
              id: edge.id,
              source: edge.source,
              target: edge.target,
              workflowId,
            },
          })
        )
      );

      return {
        ...updatedWorkflow,
        Node: createdNodes,
        Edge: createdEdges,
      };
    });
    // ]);

    const responsePayload = {
      ...workflow,
      homeProject: project,
      nodes: workflow.Node,
      edges: workflow.Edge,
    };

    delete responsePayload.Node;
    delete responsePayload.Edge;

    return NextResponse.json({ data: responsePayload }, { status: 200 });
  } catch (error) {
    console.error("error ==> ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
