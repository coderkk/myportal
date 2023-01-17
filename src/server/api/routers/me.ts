import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const hasPermissionToProjectSchema = z.object({
  projectId: z.string(),
});

export const meRouter = createTRPCRouter({
  hasPermissionToProject: protectedProcedure
    .input(hasPermissionToProjectSchema)
    .query(async ({ ctx, input }) => {
      try {
        const userOnProject = await ctx.prisma.usersOnProjects.findFirst({
          where: {
            userId: ctx.session.user?.id,
            projectId: input.projectId,
          },
        });
        // not found
        if (!userOnProject) {
          return false;
        }
        return true;
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
});
