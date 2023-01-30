import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const updateWeatherSchema = z.object({
  siteDiaryId: z.string(),
  morning: z.enum(["SUNNY", "CLOUDY", "RAINY"]).nullish(),
  afternoon: z.enum(["SUNNY", "CLOUDY", "RAINY"]).nullish(),
  evening: z.enum(["SUNNY", "CLOUDY", "RAINY"]).nullish(),
});

export const weatherRouter = createTRPCRouter({
  updateSiteDiaryWeather: protectedProcedure
    .input(updateWeatherSchema)
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
});
