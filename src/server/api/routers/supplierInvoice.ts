import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createSupplierInvoiceSchema = z.object({
  invoiceNo: z.string(),
  invoiceDate: z.date(),
  supplierName: z.string(),
  subtotal: z.number(),
  taxes: z.number(),
  discount: z.number(),
  grandTotal: z.number(),
  fileId: z.string().optional(),
  projectId: z.string(),
  budgetId: z.string(),
  paid: z.boolean(),
  approved: z.boolean(),
  supplierInvoiceItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unit: z.string(),
      unitPrice: z.number(),
      totalPrice: z.number(),
    })
  ),
});

export const getSupplierInvoicesSchema = z.object({
  projectId: z.string(),
  approved: z.boolean().optional(),
  budgetId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const getSupplierInvoiceSchema = z.object({
  supplierInvoiceId: z.string(),
});

export const updateSupplierInvoiceSchema = z.object({
  id: z.string(),
  invoiceNo: z.string(),
  invoiceDate: z.date(),
  supplierName: z.string(),
  subtotal: z.number(),
  taxes: z.number(),
  discount: z.number(),
  grandTotal: z.number(),
  fileId: z.string().optional(),
  projectId: z.string(),
  budgetId: z.string(),
  paid: z.boolean(),
  approved: z.boolean(),
  supplierInvoiceItems: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      quantity: z.number(),
      unit: z.string(),
      unitPrice: z.number(),
      totalPrice: z.number(),
    })
  ),
});

export const deleteSupplierInvoiceSchema = z.object({
  supplierInvoiceId: z.string(),
});

export const getSupplierInvoicesForCSVDownloadSchema = z.object({
  projectId: z.string(),
  approved: z.boolean().optional(),
  budgetId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const supplierInvoiceRouter = createTRPCRouter({
  createSupplierInvoice: protectedProcedure
    .input(createSupplierInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      return trycatch({
        fn: () => {
          return ctx.prisma.$transaction(async (tx) => {
            const { supplierInvoiceItems, ...rest } = input;
            const supplierInvoice = await tx.supplierInvoice.create({
              data: {
                ...rest,
                createdById: ctx.session.user.id,
                supplierInvoiceItems: {
                  createMany: {
                    data: supplierInvoiceItems.map((supplierInvoiceItem) => {
                      return {
                        ...supplierInvoiceItem,
                        createdById: ctx.session.user.id,
                      };
                    }),
                  },
                },
              },
            });
            await tx.budget.update({
              where: {
                id: rest.budgetId,
              },
              data: {
                costsIncurred: {
                  increment: rest.grandTotal,
                },
              },
            });

            return {
              supplierInvoice: supplierInvoice,
            };
          });
        },
        errorMessages: ["Failed to create supplier invoice"],
      })();
    }),
  getSupplierInvoices: protectedProcedure
    .input(getSupplierInvoicesSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          if (
            input.startDate &&
            input.endDate &&
            input.startDate > input.endDate
          ) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
            });
          }
          const invoices = await ctx.prisma.supplierInvoice.findMany({
            where: {
              projectId: input.projectId,
              budgetId: input.budgetId,
              invoiceDate: {
                gte: input.startDate,
                lte: input.endDate,
              },
              approved:
                input.approved !== undefined ? input.approved : undefined,
            },
            include: {
              budget: {
                select: {
                  description: true,
                  costCode: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          });
          return invoices.map((invoice) => {
            return {
              ...invoice,
              fileId: invoice.fileId || undefined,
            };
          });
        },
        errorMessages: ["Failed to get supplier invoices"],
      })();
    }),
  getSupplierInvoice: protectedProcedure
    .input(getSupplierInvoiceSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          const supplierInvoice =
            await ctx.prisma.supplierInvoice.findUniqueOrThrow({
              where: {
                id: input.supplierInvoiceId,
              },
              include: {
                supplierInvoiceItems: {
                  orderBy: {
                    createdAt: "desc",
                  },
                },
              },
            });
          return {
            ...supplierInvoice,
            fileId: supplierInvoice.fileId || undefined,
          };
        },
        errorMessages: ["Failed to get supplier invoice"],
      })();
    }),
  updateSupplierInvoice: protectedProcedure
    .input(updateSupplierInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.$transaction(async (tx) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { supplierInvoiceItems, ...rest } = input;
            const currentSupplierInvoiceGrandTotal = (
              await tx.supplierInvoice.findUniqueOrThrow({
                where: {
                  id: rest.id,
                },
              })
            ).grandTotal;
            // https://github.com/prisma/prisma/issues/2255#issuecomment-683811551
            const supplierInvoice = await tx.supplierInvoice.update({
              where: {
                id: rest.id,
              },
              data: {
                ...rest,
                budgetId: rest.budgetId,
                supplierInvoiceItems: {
                  deleteMany: {
                    supplierInvoiceId: rest.id,
                    NOT: input.supplierInvoiceItems.map(({ id }) => ({ id })),
                  },
                  upsert: input.supplierInvoiceItems.map(
                    (supplierInvoiceItem) => {
                      const { id, ...rest } = supplierInvoiceItem;
                      return {
                        where: { id: id },
                        update: { ...rest },
                        create: {
                          ...rest,
                          createdById: ctx.session.user.id,
                        },
                      };
                    }
                  ),
                },
              },
            });
            await tx.budget.update({
              where: {
                id: rest.budgetId,
              },
              data: {
                costsIncurred: {
                  increment: rest.grandTotal - currentSupplierInvoiceGrandTotal,
                },
              },
            });

            return {
              supplierInvoice: supplierInvoice,
            };
          });
        },
        //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
        //   const { supplierInvoiceItems, ...other } = input;
        //   // https://github.com/prisma/prisma/issues/2255#issuecomment-683811551
        //   return ctx.prisma.supplierInvoice.update({
        //     where: {
        //       id: other.id,
        //     },
        //     data: {
        //       ...other,
        //       supplierInvoiceItems: {
        //         deleteMany: {
        //           supplierInvoiceId: other.id,
        //           NOT: input.supplierInvoiceItems.map(({ id }) => ({ id })),
        //         },
        //         upsert: input.supplierInvoiceItems.map(
        //           (supplierInvoiceItem) => {
        //             const { id, ...rest } = supplierInvoiceItem;
        //             return {
        //               where: { id: id },
        //               update: { ...rest },
        //               create: {
        //                 ...rest,
        //                 createdById: ctx.session.user.id,
        //               },
        //             };
        //           }
        //         ),
        //       },
        //     },
        //   });
        // },
        errorMessages: ["Failed to update supplier invoice"],
      })();
    }),
  deleteSupplierInvoice: protectedProcedure
    .input(deleteSupplierInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.supplierInvoice.delete({
            where: {
              id: input.supplierInvoiceId,
            },
          });
        },
        errorMessages: ["Failed to delete supplier invoice"],
      })();
    }),
  getSupplierInvoicesForCSVDownload: protectedProcedure
    .input(getSupplierInvoicesForCSVDownloadSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.supplierInvoice.findMany({
            where: {
              projectId: input.projectId,
            },
            include: {
              supplierInvoiceItems: true,
              budget: true,
            },
          });
        },
        errorMessages: [
          "Failed to get supplier invoices data for CSV download",
        ],
      })();
    }),
});
