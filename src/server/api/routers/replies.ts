import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
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
      return await trycatch({
        fn: async () => {
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
        },
        errorMessages: ["Failed to get replies"],
      })();
    }),
  createReply: protectedProcedure
    .input(createReplySchema)
    .mutation(async ({ ctx, input }) => {
      return await trycatch({
        fn: () => {
          return ctx.prisma.reply.create({
            data: {
              description: input.description,
              createdById: ctx.session.user.id,
              requestForInformationId: input.requestForInformationId,
            },
          });
        },
        errorMessages: ["Failed to reply"],
      })();
    }),
});
