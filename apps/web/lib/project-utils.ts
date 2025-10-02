import prismaClient from "@repo/db";

export async function getOrCreatePersonalProject(userId: string) {
  try {
    let personalProject = await prismaClient.project.findFirst({
      where: {
        userId: userId,
        type: "personal",
      },
      select: {
        id: true,
        name: true,
        type: true,
        icon: true,
        description: true,
      },
    });

    if (!personalProject) {
      console.log(`Creating personal project for user: ${userId}`);
      
      personalProject = await prismaClient.project.create({
        data: {
          name: "Personal",
          type: "personal",
          icon: {
            type: "icon",
            value: "user",
          },
          description: "Personal workspace for your workflows and credentials",
          userId: userId,
        },
        select: {
          id: true,
          name: true,
          type: true,
          icon: true,
          description: true,
        },
      });

      console.log(`Created personal project: ${personalProject.id}`);
    }

    return personalProject;
  } catch (error) {
    console.error("Error getting or creating personal project:", error);
    throw error;
  }
}