import { authOptions } from "@/lib/auth";
import { createWorkflowSchema } from "@/utils/zod-schema";
import prismaClient from "@repo/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: workflowId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workflow = await prismaClient.workflow.findUnique({
    where: { id: workflowId, project: { userId: session.user.id } },
    include: { Node: true, Edge: true },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const project = await prismaClient.project.findFirst({
    where: { id: workflow.projectId, userId: session.user.id },
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
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const body = await req.json();
    const { name, nodes, edges, active, tags, projectId } = body;
    const { id: workflowId } = await params;
    console.log("nodes", nodes);

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
    const workflow = await prismaClient.$transaction(
      async (tx) => {
        await tx.edge.deleteMany({
          where: { workflowId },
        });

        await tx.node.deleteMany({
          where: { workflowId },
        });

        await tx.webhook.deleteMany({
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
                sourceHandle: edge.sourceHandle || null,
                targetHandle: edge.targetHandle || null,
                workflowId,
              },
            })
          )
        );

        console.log("nodes",JSON.stringify(nodes, null, 2))
        const webhookNodes = nodes.filter((node: any) => node.name === "webhook");
        if (webhookNodes.length > 0) {
          const webhookData = webhookNodes.map((node: any) => {
            // If path is not in parameters, it might be using the default value from the node definition
            // But since we can't easily access the node definition defaults here without importing them,
            // and the frontend should ideally send the full state.
            // However, if it's missing, we should handle it gracefully or skip.
            // For now, let's check if path exists, if not, we can't register the webhook properly.
            
            const path = node.parameters?.path as string;
            
            if (!path) {
               // If no path is provided, we can't extract the ID. 
               // This might happen if the user hasn't configured the node yet or if it's using a default that wasn't saved to parameters.
               // We'll skip this one or log a warning.
               console.warn(`Webhook node ${node.id} has no path parameter. Skipping registration.`);
               return null;
            }

            const parts = path.split('/');
            const webhookId = parts[parts.length - 1];
            
            if (!webhookId) {
                console.warn(`Could not extract webhookId from path: ${path}`);
                return null;
            }

            return {
              webhookId,
              workflowId
            };
          }).filter((item: any) => item !== null); // Filter out nulls

          if (webhookData.length > 0) {
            await tx.webhook.createMany({
                data: webhookData,
                skipDuplicates: true
            });
          }
        }

        return {
          ...updatedWorkflow,
          Node: createdNodes,
          Edge: createdEdges,
        };
      },
      {
        maxWait: 10000, // wait up to 10s for a transaction slot
        timeout: 20000, // transaction lifetime = 20s
      }
    );
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
