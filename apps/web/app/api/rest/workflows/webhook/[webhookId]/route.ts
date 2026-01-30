import { redisClient } from "@/lib/redis";
import prismaClient, { ExecutionStatus } from "@repo/db";
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
        status: ExecutionStatus.Starting,
      },
      select: {
        id: true,
      },
    });
    return response;
  });
  const executionId = executionResponse.id;
  console.log("ExecutingID", executionId);

  // Subscribe FIRST before pushing to queue
  const channel = `execution-${executionId}`;
  console.log(`Subscribing to channel: ${channel}`);

  // Publish to workflow channel so frontend can pick it up
  await redisClient.publish(`workflow-${workflowId}`, JSON.stringify({
    executionId,
    workflowId,
    status: "Starting",
    message: "Workflow execution started via webhook"
  }));

  await redisClient.lPush(
    "execute-workflow",
    JSON.stringify({
      workflowId,
      executionId,
    })
  );

  return NextResponse.json(
    {
      message: "workflow started",
    },
    { status: 200 }
  );
};
