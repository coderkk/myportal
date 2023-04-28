import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createSupplierInvoiceSchema = z.object({
  supplierInvoiceNo: z.string(),
  supplierInvoiceDate: z.date(),
  supplierInvoiceCostCode: z.string(),
  description: z.string(),
  vendorName: z.string(),
  supplierName: z.string(),
  totalCost: z.number(),
  projectId: z.string(),
});

export const getSupplierInvoicesSchema = z.object({
  projectId: z.string(),
});

export const getSupplierInvoiceInfoSchema = z.object({
  supplierInvoiceId: z.string(),
});

export const updateSupplierInvoiceSchema = z.object({
  supplierInvoiceId: z.string(),
  supplierInvoiceNo: z.string(),
  supplierInvoiceDate: z.date(),
});

export const deleteSupplierInvoiceSchema = z.object({
  supplierInvoiceId: z.string(),
});

export const supplierInvoiceRouter = createTRPCRouter({
  createSupplierInvoice: protectedProcedure
    .input(createSupplierInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.supplierInvoice.create({
            data: {
              createdById: ctx.session.user.id,
              invoiceNo: input.supplierInvoiceNo,
              invoiceDate: input.supplierInvoiceDate,
              description: input.description,
              vendorName: input.vendorName,
              supplierName: input.supplierName,
              totalCost: input.totalCost,
              projectId: input.projectId,
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
        fn: async () => {
          const project = await ctx.prisma.project.findUniqueOrThrow({
            where: {
              id: input.projectId,
            },
            include: {
              supplierInvoices: {
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
          return project.supplierInvoices.map((supplierInvoice) => ({
            id: supplierInvoice.id,
            invoiceNo: supplierInvoice.invoiceNo,
            invoiceDate: supplierInvoice.invoiceDate,
            costCode: supplierInvoice.costCode,
            description: supplierInvoice.description,
            supplierName: supplierInvoice.supplierName,
            totalCost: supplierInvoice.totalCost,
          }));
        },
        errorMessages: ["Failed to get supplier invoices"],
      })();
    }),
  getSupplierInvoice: protectedProcedure
    .input(getSupplierInvoiceInfoSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.supplierInvoice.findUniqueOrThrow({
            where: {
              id: input.supplierInvoiceId,
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
  updateSupplierInvoice: protectedProcedure
    .input(updateSupplierInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.supplierInvoice.update({
            where: {
              id: input.supplierInvoiceId,
            },
            data: {
              invoiceNo: input.supplierInvoiceNo,
              invoiceDate: input.supplierInvoiceDate,
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
