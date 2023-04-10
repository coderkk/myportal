import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
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
      return await trycatch({
        fn: () => {
          return ctx.prisma.laborer.create({
            data: {
              type: input.laborerType,
              amount: input.laborerAmount,
              createdById: ctx.session.user.id,
              siteDiaryId: input.siteDiaryId,
            },
          });
        },
        errorMessages: ["Failed to create laborer"],
      })();
    }),
  updateLaborer: protectedProcedure
    .input(updateLaborerSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.laborer.update({
            where: {
              id: input.laborerId,
            },
            data: {
              type: input.laborerType,
              amount: input.laborerAmount,
            },
          });
        },
        errorMessages: ["Failed to update laborer"],
      })();
    }),
  deleteLaborer: protectedProcedure
    .input(deleteLaborerSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.laborer.delete({
            where: {
              id: input.laborerId,
            },
          });
        },
        errorMessages: ["Failed to delete laborer"],
      })();
    }),
});
