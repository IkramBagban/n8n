import { redisClient } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";




export const POST = async (req: NextRequest) => {
    const body = await req.json();
    console.log("body", body)

    await redisClient.lPush("execute-workflow", JSON.stringify(body))

    return NextResponse.json({ message: "Executing workflow" })


}