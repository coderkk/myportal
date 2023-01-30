import { TRPCError } from "@trpc/server";
import { z } from "zod";
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
      try {
        return await ctx.prisma.workProgress.create({
          data: {
            comments: input.workProgressComments,
            createdById: ctx.session.user.id,
            siteDiaryId: input.siteDiaryId,
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
  updateWorkProgress: protectedProcedure
    .input(updateWorkProgressSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.workProgress.update({
          where: {
            id: input.workProgressId,
          },
          data: {
            comments: input.workProgressComments,
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
  deleteWorkProgress: protectedProcedure
    .input(deleteWorkProgressSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.workProgress.delete({
          where: {
            id: input.workProgressId,
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
