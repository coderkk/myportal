import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createSupplierInvoiceDetailSchema = z.object({
  supplierInvoiceId: z.string(),
  description: z.string(),
  uom: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  discount: z.number(),
  amount: z.number(),

});

export const getSupplierInvoiceDetailsSchema = z.object({
  supplierInvoiceId: z.string(),
});

export const getSupplierInvoiceDetailInfoSchema = z.object({
  supplierInvoiceDetailId: z.string(),
});

export const updateSupplierInvoiceDetailSchema = z.object({
  supplierInvoiceDetailId: z.string(),
  supplierInvoiceId: z.string(),
  description: z.string(),
  uom: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  discount: z.number(),
  amount: z.number()
});

export const deleteSupplierInvoiceDetailSchema = z.object({
  supplierInvoiceDetailId: z.string(),
});

export const supplierInvoiceDetailRouter = createTRPCRouter({
  createSupplierInvoiceDetail: protectedProcedure
    .input(createSupplierInvoiceDetailSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.supplierInvoiceDetail.create({
            data: {
              supplierInvoiceId: input.supplierInvoiceId,
              description: input.description,
              uom: input.uom,
              quantity: input.quantity,
              unitPrice: input.unitPrice,
              discount: input.discount,
              amount: input.amount,
              createdById: ctx.session.user.id,
            },
          });
        },
        errorMessages: ["Failed to create supplier invoice"],
      })();
    }),
  getSupplierInvoiceDetails: protectedProcedure
    .input(getSupplierInvoiceDetailsSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          const supplierInvoice = await ctx.prisma.supplierInvoice.findUniqueOrThrow({
            where: {
              id: input.supplierInvoiceId,
            },
            include: {
              supplierInvoiceDetails: {
                include: {
                  createdBy: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          });
          return supplierInvoice.supplierInvoiceDetails.map((supplierInvoiceDetail) => ({
            id: supplierInvoiceDetail.id,
            supplierInvoiceId: supplierInvoiceDetail.supplierInvoiceId,
            description: supplierInvoiceDetail.description,
            uom: supplierInvoiceDetail.uom,
            quantity: supplierInvoiceDetail.quantity,
            unitPrice: supplierInvoiceDetail.unitPrice,
            discount: supplierInvoiceDetail.discount,
            amount: supplierInvoiceDetail.amount,
            createdBy: supplierInvoiceDetail.createdBy,
          }));
        },
        errorMessages: ["Failed to get supplier invoices"],
      })();
    }),
  getSupplierInvoiceDetail: protectedProcedure
    .input(getSupplierInvoiceDetailInfoSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.supplierInvoiceDetail.findUniqueOrThrow({
            where: {
              id: input.supplierInvoiceDetailId,
            },
            include: {
              createdBy: {
                select: {
                  name: true,
                },
              },
            },
          });
        },
        errorMessages: ["Failed to get supplier invoice"],
      })();
    }),
  updateSupplierInvoiceDetail: protectedProcedure
    .input(updateSupplierInvoiceDetailSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.supplierInvoiceDetail.update({
            where: {
              id: input.supplierInvoiceDetailId,
            },
            data: {
              supplierInvoiceId: input.supplierInvoiceId,
              description: input.description,
              uom: input.uom,
              quantity: input.quantity,
              unitPrice: input.unitPrice,
              discount: input.discount,
              amount: input.amount
            },
          });
        },
        errorMessages: ["Failed to update supplier invoice"],
      })();
    }),
  deleteSupplierInvoiceDetail: protectedProcedure
    .input(deleteSupplierInvoiceDetailSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.supplierInvoiceDetail.delete({
            where: {
              id: input.supplierInvoiceDetailId,
            },
          });
        },
        errorMessages: ["Failed to delete supplier invoice"],
      })();
    }),
});
