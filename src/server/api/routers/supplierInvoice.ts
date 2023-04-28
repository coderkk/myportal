import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createSupplierInvoiceSchema = z.object({
  invoiceNo: z.string(),
  invoiceDate: z.date(),
  costCode: z.string(),
  description: z.string(),
  vendorName: z.string(),
  vendorAddress: z.string(),
  vendorPhone: z.string(),
  supplierName: z.string(),
  supplierAddress: z.string(),
  supplierPhone: z.string(),
  grandAmount: z.number(),
  taxAmount: z.number(),
  netAmount: z.number(),
  projectId: z.string(),
});

export const getSupplierInvoicesSchema = z.object({
  projectId: z.string(),
});

export const getSupplierInvoiceInfoSchema = z.object({
  invoiceId: z.string(),
});

export const updateSupplierInvoiceSchema = z.object({
  invoiceId: z.string(),
  invoiceNo: z.string(),
  invoiceDate: z.date(),
  costCode: z.string(),
  description: z.string(),
  vendorName: z.string(),
  vendorAddress: z.string(),
  vendorPhone: z.string(),
  supplierName: z.string(),
  supplierAddress: z.string(),
  supplierPhone: z.string(),
  grandAmount: z.number(),
  taxAmount: z.number(),
  netAmount: z.number(),
  projectId: z.string(),
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
              invoiceNo: input.invoiceNo,
              invoiceDate: input.invoiceDate,
              vendorName: input.vendorName,
              vendorAddress: input.vendorAddress,
              vendorPhone: input.vendorPhone,
              supplierName: input.supplierName,
              supplierAddress: input.supplierAddress,
              supplierPhone: input.supplierPhone,
              grandAmount: input.grandAmount,
              taxAmount: input.taxAmount,
              netAmount: input.netAmount,
              createdById: ctx.session.user.id,
              projectId: input.projectId,
              paymentDue: new Date(),
              description: "",
              salePerson: "",
              deliveryMethod: "",
              deliveryTerm: ""
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
              supplierInvoices:{
                include: {
                  createdBy: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            }
          });
          return project.supplierInvoices.map((supplierInvoice) => ({
            id: supplierInvoice.id,
            invoiceNo: supplierInvoice.invoiceNo,
            invoiceDate: supplierInvoice.invoiceDate,
            costCode: supplierInvoice.costCode,
            description: supplierInvoice.description,
            vendorName: supplierInvoice.vendorName,
            vendorAddress: supplierInvoice.vendorAddress,
            vendorPhone: supplierInvoice.vendorPhone,
            supplierName: supplierInvoice.supplierName,
            supplierAddress: supplierInvoice.supplierAddress,
            supplierPhone: supplierInvoice.supplierPhone,
            grandAmount: supplierInvoice.grandAmount,
            taxAmount: supplierInvoice.taxAmount,
            netAmount: supplierInvoice.netAmount,
            projectId: supplierInvoice.projectId,
            createdBy: supplierInvoice.createdBy,
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
              id: input.invoiceId,
            },
            include: {
              createdBy: {
                select: {
                  name: true,
                },
              },
            }
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
              id: input.invoiceId,
            },
            data: {
              invoiceNo: input.invoiceNo,
              invoiceDate: input.invoiceDate,
              vendorName: input.vendorName,
              vendorAddress: input.vendorAddress,
              vendorPhone: input.vendorPhone,
              supplierName: input.supplierName,
              supplierAddress: input.supplierAddress,
              supplierPhone: input.supplierPhone,
              grandAmount: input.grandAmount,
              taxAmount: input.taxAmount,
              netAmount: input.netAmount,
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
