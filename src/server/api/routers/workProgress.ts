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
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create work progress",
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
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update work progress",
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
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete work progress",
        });
      }
    }),
});
