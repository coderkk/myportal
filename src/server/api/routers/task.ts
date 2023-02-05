import { TRPCError } from "@trpc/server";
import { z } from "zod";
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

export const updateTaskWeatherSchema = z.object({
  taskId: z.string(),
  morning: z.enum(["SUNNY", "CLOUDY", "RAINY"]).nullish(),
  afternoon: z.enum(["SUNNY", "CLOUDY", "RAINY"]).nullish(),
  evening: z.enum(["SUNNY", "CLOUDY", "RAINY"]).nullish(),
});

export const deleteTaskSchema = z.object({
  taskId: z.string(),
});

export const taskRouter = createTRPCRouter({
  createTask: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.task.create({
          data: {
            description: input.taskDescription,
            status: input.taskStatus,
            createdById: ctx.session.user.id,
            assignedToId: input.taskAssignedTo?.id,
            projectId: input.projectId,
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
  getTasks: protectedProcedure
    .input(getTasksSchema)
    .query(async ({ ctx, input }) => {
      try {
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
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  getTask: protectedProcedure
    .input(getTaskInfoSchema)
    .query(async ({ ctx, input }) => {
      try {
        const task = await ctx.prisma.task.findUniqueOrThrow({
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
        return task;
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  updateTask: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.task.update({
          where: {
            id: input.taskId,
          },
          data: {
            description: input.taskDescription,
            status: input.taskStatus,
            assignedToId: input.taskAssignedTo?.id,
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
  deleteTask: protectedProcedure
    .input(deleteTaskSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.task.delete({
          where: {
            id: input.taskId,
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
