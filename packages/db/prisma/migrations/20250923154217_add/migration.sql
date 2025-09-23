-- CreateEnum
CREATE TYPE "public"."ExecutionStatus" AS ENUM ('Canceled', 'Crashed', 'Error', 'Starting', 'Running', 'Success');

-- CreateTable
CREATE TABLE "public"."Execution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."ExecutionStatus" NOT NULL DEFAULT 'Starting',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "stoppedAt" TIMESTAMP(3),
    "data" JSONB,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Execution_workflowId_idx" ON "public"."Execution"("workflowId");
