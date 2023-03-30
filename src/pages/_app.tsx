import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { useRouter } from "next/router";
import PermissionToProject from "../components/auth/PermissionToProject";
import "../styles/globals.css";
import { api } from "../utils/api";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  let component = <Component {...pageProps} />;
  if (router.asPath.match("/projects/.*")) {
    const projectId = router.query.projectId as string;
    component = (
      <PermissionToProject projectId={projectId}>
        <Component {...pageProps} />
      </PermissionToProject>
    );
  }
  return (
    <SessionProvider session={session}>
      {component}
      <ReactQueryDevtools />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
