import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
import type { createInnerTRPCContext } from "../trpc";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const hasPermissionToProjectSchema = z.object({
  projectId: z.string(),
});

export const isCreatorOfProjectSchema = z.object({
  projectId: z.string(),
});

export const userHasPermissionToProject = async ({
  ctx,
  projectId,
}: {
  ctx: createInnerTRPCContext;
  projectId: string;
}) => {
  const userOnProject = await ctx.prisma.usersOnProjects.findFirst({
    where: {
      userId: ctx.session?.user?.id,
      projectId: projectId,
    },
  });
  // not found
  if (!userOnProject) {
    return false;
  }
  return true;
};

export const userHasPermissionToProjectOrThrow = async ({
  ctx,
  projectId,
}: {
  ctx: createInnerTRPCContext;
  projectId: string;
}) => {
  if (
    !(await userHasPermissionToProject({
      ctx,
      projectId: projectId,
    }))
  )
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
};

export const meRouter = createTRPCRouter({
  hasPermissionToProject: protectedProcedure
    .input(hasPermissionToProjectSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return userHasPermissionToProject({
            ctx,
            projectId: input.projectId,
          });
        },
        errorMessages: ["Failed to check if user has permission to project"],
      })();
    }),
  isCreatorOfProject: protectedProcedure
    .input(isCreatorOfProjectSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          const isCreator = await ctx.prisma.project.findFirst({
            where: {
              id: input.projectId,
              createdById: ctx.session.user.id,
            },
          });
          if (!isCreator) {
            return false;
          }
          return true;
        },
        errorMessages: ["Failed to check if user is creator of project"],
      })();
    }),
});
