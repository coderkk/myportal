import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createSupplierInvoiceSchema = z.object({
  invoiceNo: z.string(),
  invoiceDate: z.date(),
  vendorName: z.string(),
  supplierName: z.string(),
  supplierAddress: z.string(),
  supplierPhone: z.string(),
  subtotal: z.number(),
  taxes: z.number(),
  discount: z.number(),
  grandTotal: z.number(),
  fileId: z.string(),
  projectId: z.string(),
  budgetId: z.string(),
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
  vendorName: z.string(),
  supplierName: z.string(),
  supplierAddress: z.string(),
  supplierPhone: z.string(),
  subtotal: z.number(),
  taxes: z.number(),
  discount: z.number(),
  grandTotal: z.number(),
  fileId: z.string(),
  projectId: z.string(),
  budgetId: z.string(),
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

export const supplierInvoiceRouter = createTRPCRouter({
  createSupplierInvoice: protectedProcedure
    .input(createSupplierInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      return trycatch({
        fn: () => {
          const { supplierInvoiceItems, ...rest } = input;
          return ctx.prisma.supplierInvoice.create({
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
        },
        errorMessages: ["Failed to create supplier invoice"],
      })();
    }),
  getSupplierInvoices: protectedProcedure
    .input(getSupplierInvoicesSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          if (
            input.startDate &&
            input.endDate &&
            input.startDate > input.endDate
          ) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
            });
          }
          return ctx.prisma.supplierInvoice.findMany({
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
            orderBy: {
              createdAt: "desc",
            },
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
            budgetId: supplierInvoice.budgetId || "", // PLANETSCALE FIX
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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { supplierInvoiceItems, ...other } = input;
          // https://github.com/prisma/prisma/issues/2255#issuecomment-683811551
          return ctx.prisma.supplierInvoice.update({
            where: {
              id: other.id,
            },
            data: {
              ...other,
              supplierInvoiceItems: {
                deleteMany: {
                  supplierInvoiceId: other.id,
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
        },
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
});
