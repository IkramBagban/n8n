import { createWorkflowSchema } from "@/utils/zod-schema";
import prismaClient from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreatePersonalProject } from "@/lib/project-utils";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, nodes, edges, active } = body;
    let { projectId } = body;

    if (!projectId) {
      const personalProject = await getOrCreatePersonalProject(session.user.id);
      projectId = personalProject.id;
      console.log(`Using personal project ${projectId} for new workflow`);
    }

    body.projectId = projectId;

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
        select: {
          id: true,
          name: true,
          description: true,
          icon: true,
        },
      }),
      prismaClient.workflow.create({
        data: {
          name: name,
          active: active,
          //   tags: tags || [],
          projectId: projectId,
          Node: {
            create: nodes.map((node) => ({ ...node })),
          },
          Edge: {
            create: edges.map((conn) => ({ ...conn })),
          },
        },
        include: {
          Node: true,
          Edge: true,
        },
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

    return NextResponse.json({ data: responsePayload }, { status: 201 });
  } catch (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (projectId) {
    const projects = await prismaClient.project.findFirst({
      where: { id: projectId },
      include: { workflows: true },
    });

    return NextResponse.json({ data: projects });
  }

  const workflows = await prismaClient.workflow.findMany({
    include: {
      project: {
        select: {
          id: true,
          type: true,
          name: true,
          icon: true,
        },
      },
    },
  });

  return NextResponse.json({ data: workflows });
};
