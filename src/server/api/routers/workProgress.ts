import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createWorkProgressSchema = z.object({
  workProgressComments: z.string(),
  siteDiaryId: z.string(),
});

export const updateWorkProgressSchema = z.object({
  workProgressComments: z.string(),
  workProgressId: z.string(),
});

export const deleteWorkProgressSchema = z.object({
  workProgressId: z.string(),
});

export const workProgressRouter = createTRPCRouter({
  createWorkProgress: protectedProcedure
    .input(createWorkProgressSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.workProgress.create({
            data: {
              comments: input.workProgressComments,
              createdById: ctx.session.user.id,
              siteDiaryId: input.siteDiaryId,
            },
          });
        },
        errorMessages: ["Failed to create work progress"],
      })();
    }),
  updateWorkProgress: protectedProcedure
    .input(updateWorkProgressSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.workProgress.update({
            where: {
              id: input.workProgressId,
            },
            data: {
              comments: input.workProgressComments,
            },
          });
        },
        errorMessages: ["Failed to update work progress"],
      })();
    }),
  deleteWorkProgress: protectedProcedure
    .input(deleteWorkProgressSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.workProgress.delete({
            where: {
              id: input.workProgressId,
            },
          });
        },
        errorMessages: ["Failed to delete work progress"],
      })();
    }),
});
