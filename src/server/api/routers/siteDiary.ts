import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const getSiteDiaryInfoSchema = z.object({
  siteDiaryId: z.string(),
});

export const siteDiaryRouter = createTRPCRouter({
  getSiteDiaryInfo: protectedProcedure
    .input(getSiteDiaryInfoSchema)
    .query(async ({ ctx, input }) => {
      try {
        const siteDiary = await ctx.prisma.siteDiary.findUniqueOrThrow({
          where: {
            id: input.siteDiaryId,
          },
          select: {
            name: true,
            createdBy: {
              select: {
                name: true,
              },
            },
            weather: true,
            plants: {
              include: {
                createdBy: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            laborers: {
              include: {
                createdBy: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            materials: {
              include: {
                createdBy: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            siteProblems: {
              include: {
                createdBy: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            workProgresses: {
              include: {
                createdBy: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });
        return {
          siteDiary: siteDiary,
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
});
