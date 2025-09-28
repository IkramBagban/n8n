'use client'

import { NodeIcon } from '@/components/ui/node-icon';
import { getNodeIcon, getNodeMetadata } from '@/utils/node-registry';

export default function TestIconsPage() {
  const nodeTypes = ['telegram', 'resend', 'manualTrigger', 'agent', 'webhook', 'lmChatGoogleGemini'];
  
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Node Icon System Test</h1>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Icons from Node Registry</h2>
          <div className="space-y-4">
            {nodeTypes.map((nodeType) => {
              const icon = getNodeIcon(nodeType);
              const metadata = getNodeMetadata(nodeType);
              return (
                <div key={nodeType} className="flex items-center gap-4 p-3 border rounded">
                  <NodeIcon icon={icon} size="md" />
                  <div>
                    <div className="font-medium">{metadata?.displayName || nodeType}</div>
                    <div className="text-sm text-gray-500">{nodeType}</div>
                    <div className="text-xs text-gray-400">{JSON.stringify(icon)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Manual Icon Tests</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 border rounded">
              <NodeIcon icon={{ type: 'lucide', value: 'Bot', color: 'purple' }} size="md" />
              <div>Lucide Bot Icon</div>
            </div>
            
            <div className="flex items-center gap-4 p-3 border rounded">
              <NodeIcon icon={{ type: 'file', value: 'telegram.svg' }} size="md" />
              <div>Telegram SVG File</div>
            </div>
            
            <div className="flex items-center gap-4 p-3 border rounded">
              <NodeIcon icon={{ 
                type: 'url', 
                value: 'https://img.icons8.com/?size=100&id=nyD0PULzXd9Q&format=png&color=000000' 
              }} size="md" />
              <div>Resend URL Icon</div>
            </div>
            
            <div className="flex items-center gap-4 p-3 border rounded">
              <NodeIcon icon={{ type: 'file', value: 'manualTrigger.svg' }} size="md" />
              <div>Manual Trigger SVG</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}