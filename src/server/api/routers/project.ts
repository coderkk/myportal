import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const updateProjectSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
});

export const createProjectSchema = z.object({
  projectName: z.string(),
});

export const deleteProjectSchema = z.object({
  projectId: z.string(),
  navigateBack: z.boolean(),
});

export const getSiteDiariesSchema = z.object({
  projectId: z.string(),
});

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.$transaction(async (tx) => {
          const project = await tx.project.create({
            data: {
              name: input.projectName,
              createdById: ctx.session.user.id,
            },
          });
          await tx.usersOnProjects.create({
            data: {
              userId: ctx.session.user.id,
              projectId: project.id,
            },
          });
          return {
            project: project,
          };
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    try {
      const loggedInUser = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.session.user?.id,
        },
        include: {
          projects: {
            select: {
              project: {
                select: {
                  id: true,
                  name: true,
                  createdAt: true,
                  createdBy: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const projects = loggedInUser?.projects.map((projectItem) => {
        const project = projectItem.project;
        return {
          id: project.id,
          name: project.name,
          createdBy: project.createdBy.name,
          createdAt: project.createdAt.toLocaleDateString(),
        };
      });
      return projects;
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: (error as Error).message,
        cause: error,
      });
    }
  }),
  updateProject: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.project.update({
          where: {
            id: input.projectId,
          },
          data: {
            name: input.projectName,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  deleteProject: protectedProcedure
    .input(deleteProjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.$transaction(async (tx) => {
          await tx.usersOnProjects.delete({
            where: {
              userId_projectId: {
                userId: ctx.session.user.id,
                projectId: input.projectId,
              },
            },
          });
          await tx.project.delete({
            where: {
              id: input.projectId,
            },
          });
          return {};
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  getSiteDiaries: protectedProcedure
    .input(getSiteDiariesSchema)
    .query(async ({ ctx, input }) => {
      try {
        const project = await ctx.prisma.project.findUniqueOrThrow({
          where: {
            id: input.projectId,
          },
          include: {
            createdBy: {
              select: {
                name: true,
              },
            },
            siteDiaries: {
              include: {
                createdBy: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });
        return {
          siteDiaries: project.siteDiaries.map((siteDiary) => ({
            id: siteDiary.id,
            name: siteDiary.name,
            date: siteDiary.date.toLocaleDateString(),
            createdBy: siteDiary.createdBy.name,
          })),
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
});
