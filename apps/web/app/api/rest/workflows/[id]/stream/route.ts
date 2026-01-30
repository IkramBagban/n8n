import { getSubscriber } from "@/lib/redis";
import { NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const workflowId = (await params).id;
  console.log(`Streaming events for workflow: ${workflowId}`);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const subscriber = await getSubscriber();
      const channel = `workflow-${workflowId}`;

      try {
        let isClosed = false;
        const safeClose = () => {
          if (isClosed) return;
          isClosed = true;
          try {
            controller.close();
          } catch (e) {
            console.error("controller might already be closed:", e);
          }
        };

        const cleanup = async () => {
          try {
            if (subscriber.isOpen) {
              await subscriber.unsubscribe(channel);
            }
          } catch (err) {
            console.error("Error cleaning up Redis subscriber:", err);
          }
        };

        await subscriber.subscribe(channel, (message) => {
          try {
            controller.enqueue(encoder.encode(`data: ${message}\n\n`));
          } catch (err) {
            console.error("Error processing message:", err);
          }
        });

        console.log(`Subscribed to ${channel}`);

        // Handle client disconnect
        req.signal.addEventListener("abort", async () => {
          console.log(`Client disconnected from workflow stream ${workflowId}`);
          await cleanup();
          safeClose();
        });
      } catch (error) {
        console.error("Error in stream start:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Internal Server Error" })}\n\n`
          )
        );
        safeClose();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
};
