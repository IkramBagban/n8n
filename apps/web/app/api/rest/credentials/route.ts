import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prismaClient from "@repo/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in post    :", session);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, data, projectId } = body;

    if (!name || !type || !data || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields: name, type, data, projectId" },
        { status: 400 }
      );
    }

    const project = await prismaClient.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    const credential = await prismaClient.credentials.create({
      data: {
        name,
        type,
        data,
        projectId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: credential.id,
          name: credential.name,
          type: credential.type,
          projectId: credential.projectId,
          createdAt: credential.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating credential:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/rest/credentials called");
    const session = await getServerSession(authOptions);

    console.log("Session:", session);   
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    console.log("Project ID:", projectId);

    const whereConditions = {
      userId: session.user.id,
    };

    if (projectId) {
      whereConditions["id"] = projectId;
    }

    console.log("Where conditions:", whereConditions);
    const project = await prismaClient.project.findFirst({
      where: whereConditions,
    });

    console.log("Project found:", project);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    const credentials = await prismaClient.credentials.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: credentials,
    });
  } catch (error) {
    console.error("Error fetching credentials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
