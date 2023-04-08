import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createSiteProblemSchema = z.object({
  siteProblemComments: z.string(),
  siteDiaryId: z.string(),
});

export const updateSiteProblemSchema = z.object({
  siteProblemComments: z.string(),
  siteProblemId: z.string(),
});

export const deleteSiteProblemSchema = z.object({
  siteProblemId: z.string(),
});

export const siteProblemRouter = createTRPCRouter({
  createSiteProblem: protectedProcedure
    .input(createSiteProblemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.siteProblem.create({
          data: {
            comments: input.siteProblemComments,
            createdById: ctx.session.user.id,
            siteDiaryId: input.siteDiaryId,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create site problem",
        });
      }
    }),
  updateSiteProblem: protectedProcedure
    .input(updateSiteProblemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.siteProblem.update({
          where: {
            id: input.siteProblemId,
          },
          data: {
            comments: input.siteProblemComments,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update site problem",
        });
      }
    }),
  deleteSiteProblem: protectedProcedure
    .input(deleteSiteProblemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.siteProblem.delete({
          where: {
            id: input.siteProblemId,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete site problem",
        });
      }
    }),
});
