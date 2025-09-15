import { predefinedNodesTypes } from "@repo/nodes-base/utils/constants";
import { NextResponse } from "next/server";

export const GET = async () => {
  const availableTriggers = Object.keys(predefinedNodesTypes).map((key) => {
    const nodeType = predefinedNodesTypes[key].type;
    return {
      name: nodeType.description.name,
      displayName: nodeType.description.displayName,
      description: nodeType.description.description,
      group: nodeType.description.group,
      icon: nodeType.description.icon,
      version: nodeType.description.version,
      defaultVersion: nodeType.description.defaultVersion,
    };
  });

  return NextResponse.json(availableTriggers);
};
