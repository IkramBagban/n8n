import prismaClient from "@repo/db";

export class Project {
  getProjectById = async (projectId: string) => {
    return await prismaClient.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
      },
    });
  };
}

export const projectInstance = new Project();
