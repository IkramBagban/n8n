import { redisClient } from "@/lib/redis";
import prismaClient, { ExecutionStatus } from "@repo/db";
import { NextRequest } from "next/server";


const subscriber = redisClient.duplicate();
await subscriber.connect();

// previously i was thinking I'll run unsave workflows, but now i think i'll not do that atleast for now.
export const GET = async (req: NextRequest) => {
    console.log('Received request to execute workflow');
    // await redisClient.lPush("execute-workflow", JSON.stringify(body))
    const { searchParams } = new URL(req.url);

    const workflowId = searchParams.get("workflowId")
    console.log('workflowId', workflowId);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {

            if (!workflowId) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "workflowId is required" })}\n\n`))
                controller.close();
                return;
            }

            const workflow = await prismaClient.workflow.findUnique({
                where: { id: workflowId },
                include: { Node: true, Edge: true },
            })


            const response = await prismaClient.execution.create({
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

            const executionId = response.id;
            console.log("ExecutingID", executionId)

            // Subscribe FIRST before pushing to queue
            const channel = `execution-${executionId}`;
            console.log(`Subscribing to channel: ${channel}`);
            
            let isSubscribed = false;
            const subscriptionPromise = new Promise<void>((resolve) => {
                subscriber.subscribe(channel, async (message) => {
                    if (!isSubscribed) {
                        isSubscribed = true;
                        console.log(`✅ Subscription confirmed for ${channel}`);
                        resolve();
                    }
                    
                    try {
                        console.log(`📨 Received message for ${executionId}`);
                        controller.enqueue(encoder.encode(`data: ${message}\n\n`))

                        const parsedMessage = JSON.parse(message);
                        console.log("parsedMessage", parsedMessage);
                        
                        // Clean up on completion or error
                        if (parsedMessage.status === "Success" || parsedMessage.status === "Failed" || parsedMessage.status === "Error") {
                            console.log(`Workflow ${executionId} finished with status: ${parsedMessage.status}`);
                            
                            // Wait a bit to ensure all messages are sent
                            setTimeout(async () => {
                                await subscriber.unsubscribe(channel);
                                controller.close();
                                
                                // Clean up old execution keys with TTL (after 5 minutes)
                                setTimeout(async () => {
                                    try {
                                        const keys = await redisClient.keys(`exec:${executionId}:*`);
                                        if (keys.length > 0) {
                                            await redisClient.del(keys);
                                            console.log(`Cleaned up ${keys.length} Redis keys for execution ${executionId}`);
                                        }
                                    } catch (err) {
                                        console.error('Error cleaning up Redis keys:', err);
                                    }
                                }, 5 * 60 * 1000); // 5 minutes
                            }, 1000);
                        }
                    } catch (err) {
                        console.error('Error processing message:', err);
                    }
                });
            });

            // Wait for subscription to be confirmed (with timeout)
            console.log(`⏳ Waiting for subscription confirmation...`);
            await Promise.race([
                subscriptionPromise,
                new Promise(resolve => setTimeout(resolve, 2000)) // 2 second timeout
            ]);

            if (!isSubscribed) {
                console.warn(`⚠️ Subscription not confirmed within timeout, proceeding anyway`);
            }

            // Additional safety delay for production networks
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log(` Pushing job to queue for execution ${executionId}`);
            await redisClient.lPush("execute-workflow", JSON.stringify({
                workflowId,
                executionId,
            }))

            // Handle client disconnect
            req.signal.addEventListener("abort", async () => {
                console.log(`❌ Client disconnected for execution ${executionId}`)
                try {
                    await subscriber.unsubscribe(channel);
                    controller.close();
                } catch (err) {
                    console.error('Error unsubscribing on abort:', err);
                }
            })

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
    // return NextResponse.json({ message: "Executing workflow" })


}