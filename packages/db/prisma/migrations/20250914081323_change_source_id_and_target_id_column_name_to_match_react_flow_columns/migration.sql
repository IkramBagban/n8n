/*
  Warnings:

  - You are about to drop the column `sourceId` on the `Connection` table. All the data in the column will be lost.
  - You are about to drop the column `targetId` on the `Connection` table. All the data in the column will be lost.
  - Added the required column `source` to the `Connection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target` to the `Connection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Connection" DROP CONSTRAINT "Connection_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Connection" DROP CONSTRAINT "Connection_targetId_fkey";

-- AlterTable
ALTER TABLE "public"."Connection" DROP COLUMN "sourceId",
DROP COLUMN "targetId",
ADD COLUMN     "source" TEXT NOT NULL,
ADD COLUMN     "target" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Connection" ADD CONSTRAINT "Connection_source_fkey" FOREIGN KEY ("source") REFERENCES "public"."Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Connection" ADD CONSTRAINT "Connection_target_fkey" FOREIGN KEY ("target") REFERENCES "public"."Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
