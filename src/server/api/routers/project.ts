import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createProjectSchema = z.object({
  projectName: z.string(),
});

export const updateProjectSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
});

export const deleteProjectSchema = z.object({
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
          createdBy: project.createdBy,
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
        return await ctx.prisma.project.delete({
          where: {
            id: input.projectId,
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
});
