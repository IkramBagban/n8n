'use client'

import { use } from 'react';
import { WorkflowEditor } from '@/components/workflow-editor';

interface WorkflowPageProps {
  params: Promise<{ workflowId: string }>;
}

export default function WorkflowPage({ params }: WorkflowPageProps) {
  const { workflowId } = use(params);

  return (
    <WorkflowEditor 
      workflowId={workflowId} 
      isNewWorkflow={false}
    />
  );
}