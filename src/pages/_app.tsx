import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";
import { api } from "../utils/api";

const ProjectSidebar = dynamic(
  () => import("../components/project/ProjectSidebar")
);

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  let component = <Component {...pageProps} />;
  if (router.asPath.match("/projects/.*")) {
    const projectId = router.query.projectId;
    if (projectId && typeof projectId === "string") {
      component = (
        <ProjectSidebar>
          <Component {...pageProps} />
        </ProjectSidebar>
      );
    }
  }
  return (
    <SessionProvider session={session}>
      <ReactQueryDevtools />
      <Toaster />
      <NextNProgress
        options={{ showSpinner: false }}
        startPosition={0}
        stopDelayMs={200}
      />
      {component}
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
