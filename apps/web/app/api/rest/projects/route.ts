import { authOptions } from "@/lib/auth";
import prismaClient from "@repo/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id: string }).id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 }
      );
    }

    const projectData = {
      name: body.name || "My project",
      type: "team" as const,
      icon: body.icon || {
        type: "icon",
        value: "layers",
      },
      description: null,
      userId: userId,
    };

    const project = await prismaClient.project.create({
      data: projectData,
    });

    return NextResponse.json(
      {
        data: {
          id: project.id,
          name: project.name,
          type: projectData.type,
          icon: project.icon,
          description: project.description,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prismaClient.project.findMany({
      where: { userId: (session.user as { id: string }).id },
    });
    return NextResponse.json({ data: projects }, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
