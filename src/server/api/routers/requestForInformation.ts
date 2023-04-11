import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
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
      return await trycatch({
        fn: () => {
          return ctx.prisma.requestForInformation.create({
            data: {
              topic: input.requestForInformationTopic,
              status: input.requestForInformationStatus,
              createdById: ctx.session.user.id,
              projectId: input.projectId,
            },
          });
        },
        errorMessages: ["Failed to create RFI"],
      })();
    }),
  getRequestForInformations: protectedProcedure
    .input(getRequestForInformationsSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
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
          return project.requestForInformations.map(
            (requestForInformation) => ({
              id: requestForInformation.id,
              topic: requestForInformation.topic,
              status: requestForInformation.status,
              createdBy: requestForInformation.createdBy,
            })
          );
        },
        errorMessages: ["Failed to get RFIs"],
      })();
    }),
  getRequestForInformation: protectedProcedure
    .input(getRequestForInformationInfoSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.requestForInformation.findUniqueOrThrow({
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
        },
        errorMessages: ["Failed to get RFI"],
      })();
    }),
  updateRequestForInformation: protectedProcedure
    .input(updateRequestForInformationSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.requestForInformation.update({
            where: {
              id: input.requestForInformationId,
            },
            data: {
              topic: input.requestForInformationTopic,
              status: input.requestForInformationStatus,
            },
          });
        },
        errorMessages: ["Failed to update RFI"],
      })();
    }),
  deleteRequestForInformation: protectedProcedure
    .input(deleteRequestForInformationSchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.requestForInformation.delete({
            where: {
              id: input.requestForInformationId,
            },
          });
        },
        errorMessages: ["Failed to delete RFI"],
      })();
    }),
});
