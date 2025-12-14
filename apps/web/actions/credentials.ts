"use server";

import prismaClient from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getNodeCredentials = async (
  credentials,
  projectId
) => {
  try {
    let targetProjectId = projectId;

    if (!targetProjectId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        const personalProject = await prismaClient.project.findFirst({
          where: {
            userId: session.user.id,
            type: "personal",
          },
        });
        if (personalProject) {
          targetProjectId = personalProject.id;
        }
      }
    }

    console.log("Fetching credentials for:", { credentials, projectId: targetProjectId });

    if (!targetProjectId) {
      return [];
    }

    const response = await prismaClient.credentials.findMany({
      where: {
        type: { in: credentials.map((cred) => cred.name) },
        projectId: targetProjectId,
      },
    });
    console.log("Fetched credentials:", response);
    return response;
  } catch (error) {
    console.log("Error fetching credentials:", error);
    return null;
  }
};
