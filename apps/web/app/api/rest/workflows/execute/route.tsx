import { redisClient, getSubscriber } from "@/lib/redis";
import prismaClient, { ExecutionStatus } from "@repo/db";
import { NextRequest } from "next/server";


// previously i was thinking I'll run unsave workflows, but now i think i'll not do that atleast for now.
export const GET = async (req: NextRequest) => {
    console.log('Received request to execute workflow');
    try {

        const { searchParams } = new URL(req.url);

        const workflowId = searchParams.get("workflowId")
        console.log('workflowId', workflowId);

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const subscriber = await getSubscriber();
                let channel: string | null = null;

                try {

                    let isClosed = false;
                    // Helper to safely close controller
                    const safeClose = () => {
                        if (isClosed) return;
                        isClosed = true;
                        try {
                            controller.close();
                        } catch (e) {
                            console.error('controller might already be closed:', e);
                        }
                    };

                    const cleanup = async () => {
                        try {
                            if (channel && subscriber.isOpen) {
                                await subscriber.unsubscribe(channel);
                            }
                        } catch (err) {
                            console.error('Error cleaning up Redis subscriber:', err);
                        }
                    };

                    if (!workflowId) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "workflowId is required" })}\n\n`))
                        await cleanup();
                        safeClose();
                        return;
                    }

                    const executionResponse = await prismaClient.$transaction(async (tx) => {
                        const workflow = await tx.workflow.findUnique({
                            where: { id: workflowId },
                            include: { Node: true, Edge: true },
                        })


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
                        })
                        return response;
                    })
                    const executionId = executionResponse.id;
                    console.log("ExecutingID", executionId)

                    // Subscribe FIRST before pushing to queue
                    channel = `execution-${executionId}`;
                    console.log(`Subscribing to channel: ${channel}`);

                    await subscriber.subscribe(channel, async (message) => {
                        try {
                            console.log(`Received message for ${executionId}`);
                            controller.enqueue(encoder.encode(`data: ${message}\n\n`))

                            const parsedMessage = JSON.parse(message);
                            console.log("parsedMessage", parsedMessage);

                            // Clean up on completion or error
                            if (parsedMessage.status === "Success" || parsedMessage.status === "Failed" || parsedMessage.status === "Error") {
                                console.log(`Workflow ${executionId} finished with status: ${parsedMessage.status}`);

                                // Wait a bit to ensure all messages are sent
                                setTimeout(async () => {
                                    await cleanup();
                                    safeClose();
                                }, 1000);
                            }
                        } catch (err) {
                            console.error('Error processing message:', err);
                        }
                    });

                    console.log(`Subscription confirmed for ${channel}`);

                    // Small delay to ensure subscription is fully registered in Redis
                    await new Promise(resolve => setTimeout(resolve, 100));

                    console.log(` Pushing job to queue for execution ${executionId}`);
                    await redisClient.lPush("execute-workflow", JSON.stringify({
                        workflowId,
                        executionId,
                    }))

                    // Handle client disconnect
                    req.signal.addEventListener("abort", async () => {
                        console.log(`Client disconnected for execution ${executionId}`)
                        await cleanup();
                        safeClose();
                    })
                } catch (error) {
                    console.error("Error in stream start:", error);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Internal Server Error" })}\n\n`))
                    if (channel && subscriber.isOpen) {
                        await subscriber.unsubscribe(channel);
                    }
                }

            }
        }
        )

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no", // Disable nginx buffering
            },
        });
    } catch (error) {
        console.error("Error in workflow execution route:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }

}