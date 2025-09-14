import { createWorkflowSchema } from "@/app/utils/zod-schema";
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

    console.log("workflowId", workflowId);

    const nodeBody = nodes.map((node) => ({
      parameters: node.parameters,
      type: node.type,
      position: node.position,
      name: node.name,
      data: node.data,
    }));

    const edgeBody = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    }));

    const schemaResult = createWorkflowSchema.safeParse(body);
    if (!schemaResult.success) {
      return NextResponse.json(
        { error: JSON.parse(schemaResult.error.message) },
        { status: 400 }
      );
    }

    const [project, workflow] = await Promise.all([
      prismaClient.project.findFirst({
        where: { id: projectId },
        select: { id: true, name: true, description: true, icon: true },
      }),
      prismaClient.workflow.update({
        where: { id: "cmfjcdse10001v7jgyqdjavak" },
        data: {
          name,
          active,
          projectId,
          Node: {
            deleteMany: {}, // clear old nodes
            create: nodeBody, // add new nodes
          },
          Edge: {
            deleteMany: {},
            create: edgeBody,
          },
        },
        include: { Node: true, Edge: true },
      }),
    ]);

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
    console.log("error ==> ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
