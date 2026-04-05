import { getExecutionEngine } from "@/lib/execution/engines";
import prismaClient from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> }
) => {
  console.log("-------------webhook------------------------");
  const webhookId = (await params).webhookId;
  console.log("webhookId", webhookId);

  const workflow = await prismaClient.webhook.findFirst({
    where: {
      webhookId: webhookId,
    },
    select: {
      workflowId: true,
    },
  });
  const workflowId = workflow?.workflowId || null;

  if (!workflowId)
    return NextResponse.json(
      {
        error: `The requested webhook ${webhookId} is not registered.`,
      },
      { status: 404 }
    );

  const executionResponse = await prismaClient.$transaction(async (tx) => {
    const workflow = await tx.workflow.findUnique({
      where: { id: workflowId },
      include: { Node: true, Edge: true },
    });

    const response = await tx.execution.create({
      data: {
        workflowId,
        data: {
          nodes: workflow?.Node || [],
          edges: workflow?.Edge || [],
        },
        status: "Starting",
      },
      select: {
        id: true,
      },
    });
    return response;
  });
  const executionId = executionResponse.id;
  console.log("ExecutingID", executionId);

  const executionEngine = getExecutionEngine();
  try {
    await executionEngine.execute({
      workflowId,
      executionId,
    });
  } catch (error) {
    console.error("Failed to dispatch webhook execution:", error);
    return NextResponse.json(
      {
        error: "Failed to dispatch workflow execution",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "workflow started",
    },
    { status: 200 }
  );
};
