import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const getUsersForProjectSchema = z.object({
  projectId: z.string(),
});

export const userRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
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
  getUsersForProject: protectedProcedure
    .input(getUsersForProjectSchema)
    .query(async ({ ctx, input }) => {
      try {
        const users = await ctx.prisma.project.findUniqueOrThrow({
          where: {
            id: input.projectId,
          },
          select: {
            users: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        });
        return users.users.map((user) => user?.user);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
});
