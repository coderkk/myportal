import { meRouter } from "./routers/me";
import { projectRouter } from "./routers/project";
import { siteDiaryRouter } from "./routers/siteDiary";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  me: meRouter,
  project: projectRouter,
  siteDiary: siteDiaryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
