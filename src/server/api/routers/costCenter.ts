import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createCostCenterSchema = z.object({
  code: z.string(),
  name: z.string(),
  budget: z.number(),
  cost: z.number(),
  projectId: z.string()
});

export const updateCostCenterSchema = z.object({
  costCenterId: z.string(),
  code: z.string(),
  name: z.string(),
  budget: z.number(),
  cost: z.number(),
});

export const deleteCostCenterSchema = z.object({
  costCenterId: z.string(),
});

export const getCostCentersSchema = z.object({
  projectId: z.string(),
});

export const getCostCenterSchema = z.object({
  costCenterId: z.string(),
})

export const costCenterRouter = createTRPCRouter({
  createCostCenter: protectedProcedure
    .input(createCostCenterSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.costCenter.create({
            data: {
              code: input.code,
              name: input.name,
              cost: input.cost,
              budget: input.budget,
              projectId: input.projectId,
              createdById: ctx.session.user.id,
            },
          });
        },
        errorMessages: ["Failed to create cost center"],
      })();
    }),
  updateCostCenter: protectedProcedure
    .input(updateCostCenterSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.costCenter.update({
            where: {
              id: input.costCenterId,
            },
            data: {
              code: input.code,
              name: input.name,
              cost: input.cost,
              budget: input.budget,
            },
          });
        },
        errorMessages: ["Failed to update cost center"],
      })();
    }),
  deleteCostCenter: protectedProcedure
    .input(deleteCostCenterSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.costCenter.delete({
            where: {
              id: input.costCenterId,
            },
          });
        },
        errorMessages: ["Failed to delete cost center"],
      })();
    }),
  getCostCenters: protectedProcedure
    .input(getCostCentersSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          const costCenters = await ctx.prisma.costCenter.findMany({
            where: {
              projectId: input.projectId,
            },
            include: {
              createdBy: {
                select: {
                  name: true
                }
              }
            }
          });
          return costCenters.map((costCenter) => ({
            id: costCenter.id,
            code: costCenter.code,
            name: costCenter.name,
            budget: costCenter.budget,
            cost: costCenter.cost,
            createdBy: costCenter.createdBy,
            projectId: costCenter.projectId,
          }));
        },
        errorMessages: ["Failed to get cost centers"],
      })();
    }),
  getCostCenter: protectedProcedure
    .input(getCostCenterSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.costCenter.findUniqueOrThrow({
            where: {
              id: input.costCenterId,
            }
          });
        },
        errorMessages: ["Failed to get cost centers"],
      })();
    }),
});
