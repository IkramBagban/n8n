import prismaClient from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
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
    console.log("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
