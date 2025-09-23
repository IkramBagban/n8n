import { redisClient } from "@/lib/redis";
import prismaClient from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { ExecutionStatus } from "@prisma/client";



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

            await redisClient.subscribe(`execution-${executionId}`, (message) => {
                console.log("Received message:");
                controller.enqueue(encoder.encode(`data: ${message}\n\n`))

                const parsedMessage = JSON.parse(message);
                console.log("parsedMessage", parsedMessage);
                if (parsedMessage.status === "Success") { // have to update this line.

                    req.signal.addEventListener("abort", async () => {
                        console.log("Request aborted by the client.")
                        await redisClient.unsubscribe(`execution:${executionId}`);
                        await redisClient.quit();
                        controller.close();
                    })
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