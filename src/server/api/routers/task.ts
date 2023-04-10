import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createTaskSchema = z.object({
  taskDescription: z.string(),
  taskStatus: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"])
    .default("NOT_STARTED"),
  projectId: z.string(),
  taskAssignedTo: z
    .object({
      id: z.string(),
      email: z.string().nullable(),
    })
    .nullable(),
});

export const getTasksSchema = z.object({
  projectId: z.string(),
});

export const getTaskInfoSchema = z.object({
  taskId: z.string(),
});

export const updateTaskSchema = z.object({
  taskId: z.string(),
  taskDescription: z.string(),
  taskStatus: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"])
    .default("NOT_STARTED"),
  taskAssignedTo: z
    .object({
      id: z.string(),
      email: z.string().nullable(),
    })
    .nullable(),
});

export const deleteTaskSchema = z.object({
  taskId: z.string(),
});

export const taskRouter = createTRPCRouter({
  createTask: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.task.create({
            data: {
              description: input.taskDescription,
              status: input.taskStatus,
              createdById: ctx.session.user.id,
              assignedToId: input.taskAssignedTo?.id,
              projectId: input.projectId,
            },
          });
        },
        errorMessages: ["Failed to create task"],
      })();
    }),
  getTasks: protectedProcedure
    .input(getTasksSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          const project = await ctx.prisma.project.findUniqueOrThrow({
            where: {
              id: input.projectId,
            },
            include: {
              tasks: {
                include: {
                  createdBy: {
                    select: {
                      name: true,
                    },
                  },
                  assignedTo: {
                    select: {
                      id: true,
                      email: true,
                    },
                  },
                },
              },
            },
          });
          return project.tasks.map((task) => ({
            id: task.id,
            description: task.description,
            status: task.status,
            createdBy: task.createdBy,
            assignedTo: task.assignedTo,
          }));
        },
        errorMessages: ["Failed to get tasks"],
      })();
    }),
  getTask: protectedProcedure
    .input(getTaskInfoSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.task.findUniqueOrThrow({
            where: {
              id: input.taskId,
            },
            include: {
              createdBy: {
                select: {
                  name: true,
                },
              },
              assignedTo: {
                select: {
                  name: true,
                },
              },
            },
          });
        },
        errorMessages: ["Failed to get task"],
      })();
    }),
  updateTask: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.task.update({
            where: {
              id: input.taskId,
            },
            data: {
              description: input.taskDescription,
              status: input.taskStatus,
              assignedToId: input.taskAssignedTo?.id,
            },
          });
        },
        errorMessages: ["Failed to update task"],
      })();
    }),
  deleteTask: protectedProcedure
    .input(deleteTaskSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.task.delete({
            where: {
              id: input.taskId,
            },
          });
        },
        errorMessages: ["Failed to delete task"],
      })();
    }),
});
