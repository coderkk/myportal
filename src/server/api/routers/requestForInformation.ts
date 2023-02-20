import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createRequestForInformationSchema = z.object({
  projectId: z.string(),
  requestForInformationTopic: z.string(),
  requestForInformationStatus: z
    .enum(["PENDING", "CLOSED_OUT"])
    .default("PENDING"),
});

export const getRequestForInformationsSchema = z.object({
  projectId: z.string(),
});

export const getRequestForInformationInfoSchema = z.object({
  requestForInformationId: z.string(),
});

export const updateRequestForInformationSchema = z.object({
  requestForInformationId: z.string(),
  requestForInformationTopic: z.string(),
  requestForInformationStatus: z
    .enum(["PENDING", "CLOSED_OUT"])
    .default("PENDING"),
});

export const deleteRequestForInformationSchema = z.object({
  requestForInformationId: z.string(),
});

export const requestForInformationRouter = createTRPCRouter({
  createRequestForInformation: protectedProcedure
    .input(createRequestForInformationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.requestForInformation.create({
          data: {
            topic: input.requestForInformationTopic,
            status: input.requestForInformationStatus,
            createdById: ctx.session.user.id,
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
  getRequestForInformations: protectedProcedure
    .input(getRequestForInformationsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const project = await ctx.prisma.project.findUniqueOrThrow({
          where: {
            id: input.projectId,
          },
          include: {
            requestForInformations: {
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
        return project.requestForInformations.map((requestForInformation) => ({
          id: requestForInformation.id,
          topic: requestForInformation.topic,
          status: requestForInformation.status,
          createdBy: requestForInformation.createdBy,
        }));
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  getRequestForInformation: protectedProcedure
    .input(getRequestForInformationInfoSchema)
    .query(async ({ ctx, input }) => {
      try {
        const requestForInformation =
          await ctx.prisma.requestForInformation.findUniqueOrThrow({
            where: {
              id: input.requestForInformationId,
            },
            include: {
              createdBy: {
                select: {
                  name: true,
                },
              },
            },
          });
        return requestForInformation;
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  updateRequestForInformation: protectedProcedure
    .input(updateRequestForInformationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.requestForInformation.update({
          where: {
            id: input.requestForInformationId,
          },
          data: {
            topic: input.requestForInformationTopic,
            status: input.requestForInformationStatus,
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
  deleteRequestForInformation: protectedProcedure
    .input(deleteRequestForInformationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.requestForInformation.delete({
          where: {
            id: input.requestForInformationId,
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
