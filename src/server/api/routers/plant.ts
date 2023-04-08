import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createPlantSchema = z.object({
  plantType: z.string(),
  plantAmount: z.number(),
  siteDiaryId: z.string(),
});

export const updatePlantSchema = z.object({
  plantId: z.string(),
  plantType: z.string(),
  plantAmount: z.number(),
});

export const deletePlantSchema = z.object({
  plantId: z.string(),
});

export const plantRouter = createTRPCRouter({
  createPlant: protectedProcedure
    .input(createPlantSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.plant.create({
          data: {
            type: input.plantType,
            amount: input.plantAmount,
            createdById: ctx.session.user.id,
            siteDiaryId: input.siteDiaryId,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create plant",
        });
      }
    }),
  updatePlant: protectedProcedure
    .input(updatePlantSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.plant.update({
          where: {
            id: input.plantId,
          },
          data: {
            type: input.plantType,
            amount: input.plantAmount,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update plant",
        });
      }
    }),
  deletePlant: protectedProcedure
    .input(deletePlantSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.plant.delete({
          where: {
            id: input.plantId,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete plant",
        });
      }
    }),
});
