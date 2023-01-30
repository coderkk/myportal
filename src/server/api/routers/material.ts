import { MaterialUnit } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createMaterialSchema = z.object({
  materialUnits: z.nativeEnum(MaterialUnit),
  materialAmount: z.number(),
  siteDiaryId: z.string(),
});

export const updateMaterialSchema = z.object({
  materialId: z.string(),
  materialUnits: z.nativeEnum(MaterialUnit),
  materialAmount: z.number(),
});

export const deleteMaterialSchema = z.object({
  materialId: z.string(),
});

export const materialRouter = createTRPCRouter({
  createMaterial: protectedProcedure
    .input(createMaterialSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.material.create({
          data: {
            units: input.materialUnits,
            amount: input.materialAmount,
            createdById: ctx.session.user.id,
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
  updateMaterial: protectedProcedure
    .input(updateMaterialSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.material.update({
          where: {
            id: input.materialId,
          },
          data: {
            units: input.materialUnits,
            amount: input.materialAmount,
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
  deleteMaterial: protectedProcedure
    .input(deleteMaterialSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.material.delete({
          where: {
            id: input.materialId,
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
