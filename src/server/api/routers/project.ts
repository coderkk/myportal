import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { Session } from "next-auth";
import { z } from "zod";
import { createProjectSchema } from "../../../schema/project";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const getProjectSchema = z.object({
  projectId: z.string(),
});

export const updateProjectSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
});

export const deleteProjectSchema = z.object({
  projectId: z.string(),
});

export const addToProjectSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  userImage: z.string(),
});

export const removeFromProjectSchema = z.object({
  projectId: z.string(),
  userToBeRemovedId: z.string(),
});

export const getProjectCreatorSchema = z.object({
  projectId: z.string(),
});

export async function userIsProjectCreator({
  prisma,
  session,
  projectId,
}: {
  prisma: PrismaClient;
  session: Session;
  projectId: string;
}) {
  const isCreator = await prisma.project.findFirst({
    where: {
      id: projectId,
      createdById: session.user?.id,
    },
  });
  if (!isCreator) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }
  return isCreator;
}

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

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.$transaction(async (tx) => {
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
        },
        errorMessages: ["Failed to create project"],
      })();
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await trycatch({
      fn: async () => {
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
                        image: true,
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
      },
      errorMessages: ["Failed to get projects"],
    })();
  }),
  getProject: protectedProcedure
    .input(getProjectSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          await userBelongsToProject({
            prisma: ctx.prisma,
            session: ctx.session,
            projectId: input.projectId,
          });
          return await ctx.prisma.project.findUniqueOrThrow({
            where: {
              id: input.projectId,
            },
          });
        },
        errorMessages: [
          "Failed to get project",
          "You do not belong to this project",
        ],
      })();
    }),
  updateProject: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          await userBelongsToProject({
            prisma: ctx.prisma,
            session: ctx.session,
            projectId: input.projectId,
          });
          return await ctx.prisma.project.update({
            where: {
              id: input.projectId,
            },
            data: {
              name: input.projectName,
            },
          });
        },
        errorMessages: [
          "Failed to update project",
          "You do not belong to this project",
        ],
      })();
    }),
  deleteProject: protectedProcedure
    .input(deleteProjectSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          await userIsProjectCreator({
            prisma: ctx.prisma,
            session: ctx.session,
            projectId: input.projectId,
          });

          // delete project
          return await ctx.prisma.project.delete({
            where: {
              id: input.projectId,
            },
          });
        },
        errorMessages: [
          "Failed to delete project",
          "You do not have permission since you did not create the project",
        ],
      })();
    }),
  addToProject: protectedProcedure
    .input(addToProjectSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          const isCreatorPromise = userIsProjectCreator({
            prisma: ctx.prisma,
            session: ctx.session,
            projectId: input.projectId,
          });
          const userAlreadyInProjectPromise =
            ctx.prisma.usersOnProjects.findFirst({
              where: {
                userId: input.userId,
                projectId: input.projectId,
              },
            });

          const [isCreator, userAlreadyInProject] = await Promise.all([
            isCreatorPromise,
            userAlreadyInProjectPromise,
          ]);

          if (!isCreator) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
            });
          } else if (userAlreadyInProject) {
            throw new TRPCError({
              code: "BAD_REQUEST",
            });
          }

          // add user to project
          return await ctx.prisma.usersOnProjects.create({
            data: {
              userId: input.userId,
              projectId: input.projectId,
            },
          });
        },
        errorMessages: [
          "Failed to add to project",
          "You do not have permission since you did not create the project",
          "The user already belongs to this team.",
        ],
      })();
    }),
  removeFromProject: protectedProcedure
    .input(removeFromProjectSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          // check for permission first - only creator of the project can remove others
          const isCreatorPromise = userIsProjectCreator({
            prisma: ctx.prisma,
            session: ctx.session,
            projectId: input.projectId,
          });
          const userAlreadyInProjectPromise =
            ctx.prisma.usersOnProjects.findFirst({
              where: {
                userId: input.userToBeRemovedId,
                projectId: input.projectId,
              },
            });

          const [isCreator, userAlreadyInProject] = await Promise.all([
            isCreatorPromise,
            userAlreadyInProjectPromise,
          ]);

          if (!isCreator) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
            });
          } else if (!userAlreadyInProject) {
            throw new TRPCError({
              code: "BAD_REQUEST",
            });
          }

          return await ctx.prisma.usersOnProjects.delete({
            where: {
              userId_projectId: {
                userId: input.userToBeRemovedId,
                projectId: input.projectId,
              },
            },
          });
        },
        errorMessages: [
          "Failed to remove from project",
          "You do not have permission since you did not create the project",
          "The user is not part of the team.",
        ],
      })();
    }),
  getProjectCreator: protectedProcedure
    .input(getProjectCreatorSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          const project = await ctx.prisma.project.findUniqueOrThrow({
            where: {
              id: input.projectId,
            },
            select: {
              createdBy: true,
            },
          });
          return project.createdBy;
        },
        errorMessages: ["Failed to get project"],
      })();
    }),
});
