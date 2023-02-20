import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const createReplySchema = z.object({
  description: z.string(),
  requestForInformationId: z.string(),
});

export const getRepliesSchema = z.object({
  requestForInformationId: z.string(),
});

export const replyRouter = createTRPCRouter({
  getReplies: protectedProcedure
    .input(getRepliesSchema)
    .query(async ({ ctx, input }) => {
      try {
        const requestForInformation =
          await ctx.prisma.requestForInformation.findUniqueOrThrow({
            where: {
              id: input.requestForInformationId,
            },
            include: {
              replies: {
                include: {
                  createdBy: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          });
        return requestForInformation.replies.map((reply) => ({
          id: reply.id,
          description: reply.description,
          repliedBy: reply.createdBy.name,
          repliedById: reply.createdBy.id,
        }));
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  createReply: protectedProcedure
    .input(createReplySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.reply.create({
          data: {
            description: input.description,
            createdById: ctx.session.user.id,
            requestForInformationId: input.requestForInformationId,
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
