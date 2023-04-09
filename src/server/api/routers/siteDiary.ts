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
  siteDiaryDate: z.date(),
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
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create site diary",
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
          date: siteDiary.date,
          createdBy: siteDiary.createdBy,
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get site diaries",
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
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get site diary",
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
            date: input.siteDiaryDate,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update site diary",
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
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete site diary",
        });
      }
    }),
});
