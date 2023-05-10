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
      name: z.string().nullable(),
      email: z.string().nullable(),
      image: z.string().nullable(),
    })
    .nullable(),
});

export const getTasksSchema = z.object({
  projectId: z.string(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(10).default(5),
  statuses: z
    .array(z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]))
    .optional(),
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
      name: z.string().nullable(),
      email: z.string().nullable(),
      image: z.string().nullable(),
    })
    .nullable(),
  limit: z.number().min(1).max(10).default(5),
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
            include: {
              assignedTo: true,
              createdBy: true,
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
          const tasks = await ctx.prisma.task.findMany({
            where: {
              projectId: input.projectId,
              status: {
                in: input.statuses ? input.statuses : undefined,
              },
            },
            include: {
              createdBy: {
                select: {
                  name: true,
                  email: true,
                  image: true,
                },
              },
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: input.limit,
            skip: input.cursor ? 1 : 0,
            cursor: input.cursor ? { id: input.cursor } : undefined,
          });
          return {
            tasks: tasks.map((task) => ({
              id: task.id,
              description: task.description,
              status: task.status,
              createdBy: task.createdBy,
              assignedTo: task.assignedTo,
            })),
            nextCursor: tasks[tasks.length - 1]?.id || undefined,
          };
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
