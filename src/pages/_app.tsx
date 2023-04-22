import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import PermissionToProject from "../components/auth/PermissionToProject";
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
        <PermissionToProject projectId={projectId}>
          <ProjectSidebar>
            <Component {...pageProps} />
          </ProjectSidebar>
        </PermissionToProject>
      );
    }
  }
  return (
    <SessionProvider session={session}>
      <ReactQueryDevtools />
      <Toaster />
      {component}
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
