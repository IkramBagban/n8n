import { redisClient } from "@/lib/redis";
import prismaClient, { ExecutionStatus } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    console.log('Received request to execute workflow');
    try {
        const { searchParams } = new URL(req.url);
        const workflowId = searchParams.get("workflowId");
        console.log('workflowId', workflowId);

        if (!workflowId) {
            return NextResponse.json({ error: "workflowId is required" }, { status: 400 });
        }

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
                        edges: workflow?.Edge || []
                    },
                    status: ExecutionStatus.Starting,
                },
                select: {
                    id: true
                }
            });
            return response;
        });

        const executionId = executionResponse.id;
        console.log("ExecutingID", executionId);

        // Publish "Starting" event to workflow channel
        await redisClient.publish(`workflow-${workflowId}`, JSON.stringify({
            executionId,
            workflowId,
            status: "Starting",
            message: "Workflow execution started manually"
        }));

        console.log(`Pushing job to queue for execution ${executionId}`);
        await redisClient.lPush("execute-workflow", JSON.stringify({
            workflowId,
            executionId,
        }));

        return NextResponse.json({ executionId, message: "Workflow started" });

    } catch (error) {
        console.error("Error in workflow execution route:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};