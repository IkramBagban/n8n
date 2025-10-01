import { predefinedNodesTypes } from '@repo/nodes-base/utils/constants';
import { INodeIcon } from '@/components/ui/node-icon';

export function getNodeIcon(nodeType: string): string | INodeIcon {
  // Try with the original nodeType first
  let nodeDefinition = predefinedNodesTypes[nodeType];
  
  // If not found, try with the nodes-base prefix
  if (!nodeDefinition) {
    nodeDefinition = predefinedNodesTypes[`nodes-base.${nodeType}`];
  }
  
  if (!nodeDefinition?.type?.description?.icon) {
    return { type: 'lucide', value: 'Settings', color: 'gray' };
  }
  
  const icon = nodeDefinition.type.description.icon;
  
  // If icon is already in new format, return it
  if (typeof icon === 'object') {
    return icon as INodeIcon;
  }
  
  // Handle legacy string format
  if (typeof icon === 'string') {
    return icon;
  }
  
  // Fallback
  return { type: 'lucide', value: 'Settings', color: 'gray' };
}

export function getNodeMetadata(nodeType: string) {
  // Try with the original nodeType first
  let nodeDefinition = predefinedNodesTypes[nodeType];
  
  // If not found, try with the nodes-base prefix
  if (!nodeDefinition) {
    nodeDefinition = predefinedNodesTypes[`nodes-base.${nodeType}`];
  }
  
  if (!nodeDefinition) {
    return null;
  }
  
  const description = nodeDefinition.type.description;
  
  return {
    displayName: description.displayName,
    name: description.name,
    description: description.description,
    icon: getNodeIcon(nodeType),
    group: description.group,
    properties: description.properties,
    credentials: description.credentials,
  };
}