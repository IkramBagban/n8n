import prismaClient from "@repo/db";
import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    console.log("Received body:", body);
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, userId, icon } = body;

    if (!name || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const project = await prismaClient.project.create({
      data: {
        name,
        description,
        userId,
        icon,
      },
    });

    return NextResponse.json({ data: { id: project.id } }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
