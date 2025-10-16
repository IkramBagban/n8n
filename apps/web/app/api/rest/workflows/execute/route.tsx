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
            await redisClient.lPush("execute-workflow", JSON.stringify({
                workflowId,
                executionId,
                // nodes: workflow?.Node || [], i think i should fetch this, in the engine directly instewad of passing from here. because it will unnecsarily increase the size of the payload that i am sending to redis.
                // edges: workflow?.Edge || [],
            }))
            // const subscriber = await redisClient.duplicate();
            console.log("Subscriber created");

            await subscriber.subscribe(`execution-${executionId}`, async (message) => {
                try {
                    console.log("Received message for execution:", executionId);
                    controller.enqueue(encoder.encode(`data: ${message}\n\n`))

                    const parsedMessage = JSON.parse(message);
                    console.log("parsedMessage", parsedMessage);
                    
                    // Clean up on completion or error
                    if (parsedMessage.status === "Success" || parsedMessage.status === "Failed" || parsedMessage.status === "Error") {
                        console.log(`Execution ${executionId} completed with status: ${parsedMessage.status}`);
                        
                        // Unsubscribe and close the stream
                        await subscriber.unsubscribe(`execution-${executionId}`);
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
                    }
                } catch (err) {
                    console.error('Error processing message:', err);
                }
            })
            
            // Handle client disconnect
            req.signal.addEventListener("abort", async () => {
                console.log("Request aborted by the client.")
                try {
                    await subscriber.unsubscribe(`execution-${executionId}`);
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
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
    // return NextResponse.json({ message: "Executing workflow" })


}