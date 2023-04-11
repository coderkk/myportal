import { TRPCError } from "@trpc/server";

export const trycatch = <T>({
  fn,
  errorMessages,
}: {
  // fn: () => Promise<unknown>;
  fn: () => Promise<T>;
  errorMessages: string[]; // [message for INTERNAL_SERVER_ERROR, message for UNAUTHORIZED, message for BAD_REQUEST, ]
}) => {
  return async () => {
    try {
      return await fn();
    } catch (error) {
      if ((error as TRPCError).code === "UNAUTHORIZED") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: errorMessages[1],
        });
      } else if ((error as TRPCError).code === "BAD_REQUEST") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: errorMessages[2],
        });
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: errorMessages[0],
      });
    }
  };
};
