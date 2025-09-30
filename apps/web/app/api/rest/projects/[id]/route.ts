import prismaClient from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: projectId } = await params;
    const project = await prismaClient.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ data: project }, { status: 200 });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id: projectId } = await params;
    const body = await req.json();
    console.log("Updating project:", projectId, body);

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;

    const existingProject = await prismaClient.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (existingProject.userId !== userId) {
      return NextResponse.json(
        {
          error: "Forbidden - You don't have permission to update this project",
        },
        { status: 403 }
      );
    }

    const updateData: {
      name?: string;
      description?: string | null;
      icon?: object;
    } = {};

    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.icon !== undefined) {
      updateData.icon = body.icon;
    }

    const updatedProject = await prismaClient.project.update({
      where: { id: projectId },
      data: updateData,
    });

    return NextResponse.json(
      {
        data: {
          id: updatedProject.id,
          name: updatedProject.name,
          description: updatedProject.description,
          icon: updatedProject.icon,
          type: updatedProject.type,
          createdAt: updatedProject.createdAt,
          updatedAt: updatedProject.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
