import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { Session } from "next-auth";

export async function userBelongsToProject({
    prisma,
    session,
    projectId,
  }: {
    prisma: PrismaClient;
    session: Session;
    projectId: string;
  }) {
    const belongsToProject = await prisma.usersOnProjects.findFirst({
      where: {
        userId: session.user?.id,
        projectId: projectId,
      },
    });
    if (!belongsToProject) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }
    return belongsToProject;
  }