import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createSiteDiarySchema = z.object({
  siteDiaryName: z.string(),
  siteDiaryDate: z.date(),
  projectId: z.string(),
});

export const getSiteDiariesSchema = z.object({
  projectId: z.string(),
});

export const getSiteDiaryInfoSchema = z.object({
  siteDiaryId: z.string(),
});

export const updateSiteDiarySchema = z.object({
  siteDiaryId: z.string(),
  siteDiaryName: z.string(),
  siteDiaryDate: z.date(),
});

export const deleteSiteDiarySchema = z.object({
  siteDiaryId: z.string(),
});

export const siteDiaryRouter = createTRPCRouter({
  createSiteDiary: protectedProcedure
    .input(createSiteDiarySchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.siteDiary.create({
            data: {
              name: input.siteDiaryName,
              createdById: ctx.session.user.id,
              date: input.siteDiaryDate,
              projectId: input.projectId,
            },
          });
        },
        errorMessages: ["Failed to create site diary"],
      })();
    }),
  getSiteDiaries: protectedProcedure
    .input(getSiteDiariesSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          const project = await ctx.prisma.project.findUniqueOrThrow({
            where: {
              id: input.projectId,
            },
            include: {
              createdBy: {
                select: {
                  name: true,
                },
              },
              siteDiaries: {
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
          return project.siteDiaries.map((siteDiary) => ({
            id: siteDiary.id,
            name: siteDiary.name,
            date: siteDiary.date,
            createdBy: siteDiary.createdBy,
          }));
        },
        errorMessages: ["Failed to get site diaries"],
      })();
    }),
  getSiteDiary: protectedProcedure
    .input(getSiteDiaryInfoSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.siteDiary.findUniqueOrThrow({
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
        },
        errorMessages: ["Failed to get site diary"],
      })();
    }),
  updateSiteDiary: protectedProcedure
    .input(updateSiteDiarySchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.siteDiary.update({
            where: {
              id: input.siteDiaryId,
            },
            data: {
              name: input.siteDiaryName,
              date: input.siteDiaryDate,
            },
          });
        },
        errorMessages: ["Failed to update site diary"],
      })();
    }),
  deleteSiteDiary: protectedProcedure
    .input(deleteSiteDiarySchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.siteDiary.delete({
            where: {
              id: input.siteDiaryId,
            },
          });
        },
        errorMessages: ["Failed to delete site diary"],
      })();
    }),
});
