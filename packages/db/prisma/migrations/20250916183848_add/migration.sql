-- CreateEnum
CREATE TYPE "public"."ProjectType" AS ENUM ('Team', 'Personal');

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "type" "public"."ProjectType" NOT NULL DEFAULT 'Personal';
