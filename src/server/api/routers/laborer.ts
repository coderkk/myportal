import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createLaborerSchema = z.object({
  laborerType: z.string(),
  laborerAmount: z.number(),
  siteDiaryId: z.string(),
});

export const updateLaborerSchema = z.object({
  laborerId: z.string(),
  laborerType: z.string(),
  laborerAmount: z.number(),
});

export const deleteLaborerSchema = z.object({
  laborerId: z.string(),
});

export const laborerRouter = createTRPCRouter({
  createLaborer: protectedProcedure
    .input(createLaborerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.laborer.create({
          data: {
            type: input.laborerType,
            amount: input.laborerAmount,
            createdById: ctx.session.user.id,
            siteDiaryId: input.siteDiaryId,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create laborer",
        });
      }
    }),
  updateLaborer: protectedProcedure
    .input(updateLaborerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.laborer.update({
          where: {
            id: input.laborerId,
          },
          data: {
            type: input.laborerType,
            amount: input.laborerAmount,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update laborer",
        });
      }
    }),
  deleteLaborer: protectedProcedure
    .input(deleteLaborerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.laborer.delete({
          where: {
            id: input.laborerId,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete laborer",
        });
      }
    }),
});
