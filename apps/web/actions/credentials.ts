"use server";

import prismaClient from "@repo/db";

export const getNodeCredentials = async (
  credentials,
  projectId
) => {
  try {
    console.log("Fetching credentials for:", { credentials, projectId });

    const response = await prismaClient.credentials.findMany({
      where: {
        type: { in: credentials.map((cred) => cred.name) },
        projectId: projectId,
      },
    });
    console.log("Fetched credentials:", response);
    return response;
  } catch (error) {
    console.log("Error fetching credentials:", error);
    return null;
  }
};
