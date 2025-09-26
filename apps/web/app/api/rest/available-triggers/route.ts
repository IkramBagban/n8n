import { predefinedNodesTypes } from "@repo/nodes-base/utils/constants";
import { NextResponse } from "next/server";

export const GET = async () => {
  const availableNodes = Object.keys(predefinedNodesTypes)
    .map((key) => {
      const nodeType = predefinedNodesTypes[key].type;
      return {
        name: nodeType.description.name,
        displayName: nodeType.description.displayName,
        description: nodeType.description.description,
        group: nodeType.description.group,
        icon: nodeType.description.icon,
        version: nodeType.description.version,
        defaultVersion: nodeType.description.defaultVersion,
        properties: nodeType.description.properties,
        credentials: nodeType.description.credentials,
      };
    })
    .filter((node) => node.group?.includes("trigger"));

  return NextResponse.json(availableNodes);
};
