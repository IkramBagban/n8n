import prismaClient from "@repo/db";
import bcrypt from "bcrypt";
import { signupSchema } from "@/utils/zod-schema";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  console.log("Body", body);

  const schemaResult = signupSchema.safeParse(body);

  if (!schemaResult.success) {
    return NextResponse.json({ error: schemaResult.error }, { status: 400 });
  }

  const user = await prismaClient.user.findFirst({
    where: { email: body.email },
  });
  if (user) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const newUser = await prismaClient.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ user: newUser }, { status: 201 });
};
