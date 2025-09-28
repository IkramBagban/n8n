import prismaClient from "@repo/db";

export const getCredentialsById = async <T>(id: string): Promise<T | null> => {
  const credential = await prismaClient.credentials.findFirst({
    where: { id: id },
    select: { data: true },
  });
  return credential?.data as T | null;
};
