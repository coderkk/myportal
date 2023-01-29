import { TRPCError } from "@trpc/server";
import { z } from "zod";
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
});

export const updateSiteDiaryWeatherSchema = z.object({
  siteDiaryId: z.string(),
  morning: z.enum(["SUNNY", "CLOUDY", "RAINY"]).nullish(),
  afternoon: z.enum(["SUNNY", "CLOUDY", "RAINY"]).nullish(),
  evening: z.enum(["SUNNY", "CLOUDY", "RAINY"]).nullish(),
});

export const deleteSiteDiarySchema = z.object({
  siteDiaryId: z.string(),
});

export const siteDiaryRouter = createTRPCRouter({
  createSiteDiary: protectedProcedure
    .input(createSiteDiarySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.siteDiary.create({
          data: {
            name: input.siteDiaryName,
            createdById: ctx.session.user.id,
            date: input.siteDiaryDate,
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
  getSiteDiaries: protectedProcedure
    .input(getSiteDiariesSchema)
    .query(async ({ ctx, input }) => {
      try {
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
          date: siteDiary.date.toLocaleDateString(),
          createdBy: siteDiary.createdBy.name,
        }));
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  getSiteDiary: protectedProcedure
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
        return siteDiary;
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  updateSiteDiary: protectedProcedure
    .input(updateSiteDiarySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.siteDiary.update({
          where: {
            id: input.siteDiaryId,
          },
          data: {
            name: input.siteDiaryName,
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
  updateSiteDiaryWeather: protectedProcedure
    .input(updateSiteDiaryWeatherSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.weather.upsert({
          where: {
            siteDiaryId: input.siteDiaryId,
          },
          update: {
            morning: input.morning,
            afternoon: input.afternoon,
            evening: input.evening,
          },
          create: {
            morning: input.morning,
            afternoon: input.afternoon,
            evening: input.evening,
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
  deleteSiteDiary: protectedProcedure
    .input(deleteSiteDiarySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.siteDiary.delete({
          where: {
            id: input.siteDiaryId,
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
