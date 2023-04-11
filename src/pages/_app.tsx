import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import PermissionToProject from "../components/auth/PermissionToProject";
// import { ProjectHeader } from "../components/project/ProjectHeader";
import dynamic from "next/dynamic";
import "../styles/globals.css";
import { api } from "../utils/api";

const ProjectHeader = dynamic(
  () => import("../components/project/ProjectHeader")
);

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  let component = <Component {...pageProps} />;
  if (router.asPath.match("/projects/.*")) {
    const projectId = router.query.projectId as string;
    if (!projectId) {
      component = <div>{null}</div>;
    } else {
      component = (
        <PermissionToProject projectId={projectId}>
          <ProjectHeader />
          <Component {...pageProps} />
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
