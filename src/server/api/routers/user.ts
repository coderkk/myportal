import { z } from "zod";
import { trycatch } from "../../../utils/trycatch";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const getUsersForProjectSchema = z.object({
  projectId: z.string(),
});

export const userRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    return await trycatch({
      fn: () => {
        return ctx.prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
          },
        });
      },
      errorMessages: ["Failed to get users"],
    })();
  }),
  getUsersForProject: protectedProcedure
    .input(getUsersForProjectSchema)
    .query(async ({ ctx, input }) => {
      return await trycatch({
        fn: async () => {
          const { users } = await ctx.prisma.project.findUniqueOrThrow({
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
          return users.map((user) => user?.user);
        },
        errorMessages: ["Failed to get users for project"],
      })();
    }),
});
