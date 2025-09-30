-- CreateIndex
CREATE INDEX "Credentials_id_idx" ON "public"."Credentials"("id");

-- CreateIndex
CREATE INDEX "Credentials_projectId_idx" ON "public"."Credentials"("projectId");

-- CreateIndex
CREATE INDEX "Edge_id_idx" ON "public"."Edge"("id");

-- CreateIndex
CREATE INDEX "Edge_workflowId_idx" ON "public"."Edge"("workflowId");

-- CreateIndex
CREATE INDEX "Execution_id_idx" ON "public"."Execution"("id");

-- CreateIndex
CREATE INDEX "Node_id_idx" ON "public"."Node"("id");

-- CreateIndex
CREATE INDEX "Node_workflowId_idx" ON "public"."Node"("workflowId");

-- CreateIndex
CREATE INDEX "Project_id_idx" ON "public"."Project"("id");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "public"."Project"("userId");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "public"."User"("id");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Workflow_id_idx" ON "public"."Workflow"("id");

-- CreateIndex
CREATE INDEX "Workflow_projectId_idx" ON "public"."Workflow"("projectId");
