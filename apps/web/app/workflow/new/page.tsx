'use client'

import { useSearchParams } from 'next/navigation';
import { WorkflowEditor } from '@/components/workflow-editor';

export default function NewWorkflowPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  // projectId is optional - if not provided, workflow will be created in personal project
  return (
    <WorkflowEditor 
      projectId={projectId || undefined}
      isNewWorkflow={true}
    />
  );
}