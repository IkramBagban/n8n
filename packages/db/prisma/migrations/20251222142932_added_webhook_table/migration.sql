-- CreateTable
CREATE TABLE "public"."Webhook" (
    "webhookId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("webhookId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_webhookId_key" ON "public"."Webhook"("webhookId");

-- AddForeignKey
ALTER TABLE "public"."Webhook" ADD CONSTRAINT "Webhook_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
