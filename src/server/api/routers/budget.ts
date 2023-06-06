import { customAlphabet } from "nanoid";
import { z } from "zod";
import { createBudgetSchema } from "../../../schema/budget";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

export const getBudgetsSchema = z.object({
  projectId: z.string(),
  searchKey: z.string(),
  pageSize: z.number().optional(),
  pageIndex: z.number(),
});

export const createBudgetSchemaWithId = createBudgetSchema.extend({
  projectId: z.string(),
});

export const updateBudgetSchema = z.object({
  budgetId: z.string(),
  description: z.string(),
  expectedBudget: z.number(),
  costsIncurred: z.number(),
});

export const deleteBudgetSchema = z.object({
  budgetId: z.string(),
});

export const getExpectedBudgetSumAndCostsIncurredSumSchema = z.object({
  projectId: z.string(),
});

export const budgetRouter = createTRPCRouter({
  createBudget: protectedProcedure
    .input(createBudgetSchemaWithId)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.budget.create({
            data: {
              costCode: nanoid(),
              description: input.description,
              expectedBudget: input.expectedBudget,
              costsIncurred: input.costsIncurred,
              createdById: ctx.session.user.id,
              projectId: input.projectId,
            },
          });
        },
        errorMessages: ["Failed to create budget"],
      })();
    }),
  getBudgets: protectedProcedure
    .input(getBudgetsSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          if (input.searchKey === "") {
            const skip = input.pageSize
              ? input.pageSize * input.pageIndex
              : undefined;
            const take = input.pageSize;
            const budgets = await ctx.prisma.budget.findMany({
              where: {
                projectId: input.projectId,
              },
              skip: skip,
              take: take,
              orderBy: {
                createdAt: "desc",
              },
              select: {
                id: true,
                costCode: true,
                description: true,
                expectedBudget: true,
                costsIncurred: true,
              },
            });
            const transformBudgets = budgets.map((budget) => {
              return {
                ...budget,
                difference: budget.expectedBudget - budget.costsIncurred,
              };
            });
            const count = await ctx.prisma.budget.count({
              where: {
                projectId: input.projectId,
              },
            });
            return {
              budgets: transformBudgets,
              count: count,
            };
          } else {
            const skip = input.pageSize
              ? input.pageSize * input.pageIndex
              : undefined;
            const take = input.pageSize;
            const budgets = await ctx.prisma.budget.findMany({
              where: {
                projectId: input.projectId,
              },
              orderBy: {
                createdAt: "desc",
              },
              select: {
                id: true,
                costCode: true,
                description: true,
                expectedBudget: true,
                costsIncurred: true,
              },
            });
            const transformBudgets = budgets
              .map((budget) => {
                return {
                  ...budget,
                  difference: budget.expectedBudget - budget.costsIncurred,
                };
              })
              // prisma does not support full integer search
              .filter((budget) => {
                if (
                  String(budget.costCode)
                    .toLowerCase()
                    .includes(input.searchKey.toLowerCase()) ||
                  String(budget.expectedBudget)
                    .toLowerCase()
                    .includes(input.searchKey.toLowerCase()) ||
                  String(budget.costsIncurred)
                    .toLowerCase()
                    .includes(input.searchKey.toLowerCase()) ||
                  String(budget.difference)
                    .toLowerCase()
                    .includes(input.searchKey.toLowerCase()) ||
                  String(budget.description)
                    .toLowerCase()
                    .includes(input.searchKey.toLowerCase())
                ) {
                  return budget;
                }
              });
            return {
              budgets:
                skip && take
                  ? transformBudgets.slice(skip, skip + take)
                  : transformBudgets,
              count: transformBudgets.length,
            };
          }
        },
        errorMessages: ["Failed to get budgets"],
      })();
    }),
  updateBudget: protectedProcedure
    .input(updateBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.budget.update({
            where: {
              id: input.budgetId,
            },
            data: {
              description: input.description,
              expectedBudget: input.expectedBudget,
              costsIncurred: input.costsIncurred,
            },
          });
        },
        errorMessages: ["Failed to update budget"],
      })();
    }),
  deleteBudget: protectedProcedure
    .input(deleteBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.budget.delete({
            where: {
              id: input.budgetId,
            },
          });
        },
        errorMessages: ["Failed to delete budget"],
      })();
    }),
  getExpectedBudgetSumAndCostsIncurredSum: protectedProcedure
    .input(getExpectedBudgetSumAndCostsIncurredSumSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          const budgets = await ctx.prisma.budget.findMany({
            where: {
              projectId: input.projectId,
            },
          });
          return {
            expectedBudgetSum: budgets.reduce((acc, budget) => {
              return acc + budget.expectedBudget;
            }, 0),
            costsIncurredSum: budgets.reduce((acc, budget) => {
              return acc + budget.costsIncurred;
            }, 0),
          };
        },
        errorMessages: ["Failed to get budgets"],
      })();
    }),
});
