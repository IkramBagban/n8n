-- AlterTable
ALTER TABLE "public"."Node" ADD COLUMN     "credentialId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Node" ADD CONSTRAINT "Node_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "public"."Credentials"("id") ON DELETE SET NULL ON UPDATE CASCADE;
