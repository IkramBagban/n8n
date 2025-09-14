'use client'

import { useSearchParams } from 'next/navigation';
import { WorkflowEditor } from '@/components/workflow-editor';

export default function NewWorkflowPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Project ID is required to create a new workflow</div>
      </div>
    );
  }

  return (
    <WorkflowEditor 
      projectId={projectId}
      isNewWorkflow={true}
    />
  );
}