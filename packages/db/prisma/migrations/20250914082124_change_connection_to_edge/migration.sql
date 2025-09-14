/*
  Warnings:

  - You are about to drop the `Connection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Connection" DROP CONSTRAINT "Connection_source_fkey";

-- DropForeignKey
ALTER TABLE "public"."Connection" DROP CONSTRAINT "Connection_target_fkey";

-- DropForeignKey
ALTER TABLE "public"."Connection" DROP CONSTRAINT "Connection_workflowId_fkey";

-- DropTable
DROP TABLE "public"."Connection";

-- CreateTable
CREATE TABLE "public"."Edge" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Edge" ADD CONSTRAINT "Edge_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Edge" ADD CONSTRAINT "Edge_source_fkey" FOREIGN KEY ("source") REFERENCES "public"."Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Edge" ADD CONSTRAINT "Edge_target_fkey" FOREIGN KEY ("target") REFERENCES "public"."Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
