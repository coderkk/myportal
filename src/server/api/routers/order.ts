import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createOrderSchema = z.object({
  projectId: z.string(),
  orderNumber: z.string(),
  orderNote: z.string(),
  orderArrivalOnSite: z.enum(["YES", "NO"]).default("NO"),
  orderSupplierEmailAddress: z.string(),
});

export const getOrdersSchema = z.object({
  projectId: z.string(),
});

export const getOrderInfoSchema = z.object({
  orderId: z.string(),
});

export const updateOrderSchema = z.object({
  orderId: z.string(),
  orderNumber: z.string(),
  orderNote: z.string(),
  orderArrivalOnSite: z.enum(["YES", "NO"]).default("NO"),
  orderSupplierEmailAddress: z.string(),
});

export const deleteOrderSchema = z.object({
  orderId: z.string(),
});

export const orderRouter = createTRPCRouter({
  createOrder: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.order.create({
            data: {
              note: input.orderNote,
              orderNumber: input.orderNumber,
              arrivalOnSite: input.orderArrivalOnSite,
              createdById: ctx.session.user.id,
              supplierEmailAddress: input.orderSupplierEmailAddress,
              projectId: input.projectId,
            },
          });
        },
        errorMessages: ["Failed to create order"],
      })();
    }),
  getOrders: protectedProcedure
    .input(getOrdersSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          const project = await ctx.prisma.project.findUniqueOrThrow({
            where: {
              id: input.projectId,
            },
            include: {
              orders: {
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
          return project.orders.map((order) => ({
            id: order.id,
            orderNote: order.note,
            orderNumber: order.orderNumber,
            arrivalOnSite: order.arrivalOnSite,
            createdBy: order.createdBy,
            supplierEmailAddress: order.supplierEmailAddress,
          }));
        },
        errorMessages: ["Failed to get orders"],
      })();
    }),
  getOrder: protectedProcedure
    .input(getOrderInfoSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.order.findUniqueOrThrow({
            where: {
              id: input.orderId,
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
        errorMessages: ["Failed to get order"],
      })();
    }),
  updateOrder: protectedProcedure
    .input(updateOrderSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.order.update({
            where: {
              id: input.orderId,
            },
            data: {
              note: input.orderNote,
              orderNumber: input.orderNumber,
              arrivalOnSite: input.orderArrivalOnSite,
              supplierEmailAddress: input.orderSupplierEmailAddress,
            },
          });
        },
        errorMessages: ["Failed to update order"],
      })();
    }),
  deleteOrder: protectedProcedure
    .input(deleteOrderSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.order.delete({
            where: {
              id: input.orderId,
            },
          });
        },
        errorMessages: ["Failed to delete order"],
      })();
    }),
});
