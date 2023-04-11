import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
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
      return await trycatch({
        fn: () => {
          return ctx.prisma.siteProblem.create({
            data: {
              comments: input.siteProblemComments,
              createdById: ctx.session.user.id,
              siteDiaryId: input.siteDiaryId,
            },
          });
        },
        errorMessages: ["Failed to create site problem"],
      })();
    }),
  updateSiteProblem: protectedProcedure
    .input(updateSiteProblemSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.siteProblem.update({
            where: {
              id: input.siteProblemId,
            },
            data: {
              comments: input.siteProblemComments,
            },
          });
        },
        errorMessages: ["Failed to update site problem"],
      })();
    }),
  deleteSiteProblem: protectedProcedure
    .input(deleteSiteProblemSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.siteProblem.delete({
            where: {
              id: input.siteProblemId,
            },
          });
        },
        errorMessages: ["Failed to delete site problem"],
      })();
    }),
});
