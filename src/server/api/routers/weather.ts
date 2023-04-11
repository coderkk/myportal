import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
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
      return await trycatch({
        fn: () => {
          return ctx.prisma.weather.upsert({
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
        },
        errorMessages: ["Failed to update site diary weather"],
      })();
    }),
});
