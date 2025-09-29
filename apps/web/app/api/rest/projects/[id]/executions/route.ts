import { NextRequest, NextResponse } from "next/server";
import prismaClient from "@repo/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: projectId } = params;
    const url = new URL(request.url);

    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50"),
      100
    ); // Max 100
    const status = url.searchParams.get("status");
    const workflowId = url.searchParams.get("workflowId");

    const skip = (page - 1) * limit;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const whereConditions: any = {
      workflow: {
        projectId: projectId,
      },
    };

    if (status) {
      whereConditions.status = status;
    }

    if (workflowId) {
      whereConditions.workflowId = workflowId;
    }

    const [executions, totalCount] = await Promise.all([
      prismaClient.execution.findMany({
        where: whereConditions,
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prismaClient.execution.count({
        where: whereConditions,
      }),
    ]);

    if (executions.length === 0) {
      const projectExists = await prismaClient.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });

      if (!projectExists) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
    }

    const transformedExecutions = executions.map((execution) => ({
      id: execution.id,
      workflowId: execution.workflowId,
      workflowName: execution.workflow?.name || "Unknown Workflow",
      status: execution.status,
      finished: execution.finished,
      startedAt: execution.startedAt,
      stoppedAt: execution.stoppedAt,
      createdAt: execution.createdAt,
      runtimeMs: calculateRuntime(execution.startedAt, execution.stoppedAt),
      runtimeFormatted: formatRuntime(
        calculateRuntime(execution.startedAt, execution.stoppedAt)
      ),
    }));

    return NextResponse.json({
      executions: transformedExecutions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + executions.length < totalCount,
      },
      filters: {
        status,
        workflowId,
      },
    });
  } catch (error) {
    console.error("Error fetching project executions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateRuntime(
  startedAt: Date | null,
  stoppedAt: Date | null
): number {
  if (!startedAt) return 0;

  if (stoppedAt) {
    return stoppedAt.getTime() - startedAt.getTime();
  }

  return Date.now() - startedAt.getTime();
}

function formatRuntime(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }

  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(3)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
}
