import { TRPCError } from "@trpc/server";
import { z } from "zod";
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
      try {
        return await ctx.prisma.order.create({
          data: {
            note: input.orderNote,
            orderNumber: input.orderNumber,
            arrivalOnSite: input.orderArrivalOnSite,
            createdById: ctx.session.user.id,
            supplierEmailAddress: input.orderSupplierEmailAddress,
            projectId: input.projectId,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  getOrders: protectedProcedure
    .input(getOrdersSchema)
    .query(async ({ ctx, input }) => {
      try {
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
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  getOrder: protectedProcedure
    .input(getOrderInfoSchema)
    .query(async ({ ctx, input }) => {
      try {
        const order = await ctx.prisma.order.findUniqueOrThrow({
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
        return order;
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  updateOrder: protectedProcedure
    .input(updateOrderSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.order.update({
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
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  deleteOrder: protectedProcedure
    .input(deleteOrderSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.order.delete({
          where: {
            id: input.orderId,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
});
