import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getBaseUrl } from "../../utils/api";
import Spinner from "../common/Spinner";

export default function SessionAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = useSession();

  if (session.status === "loading") {
    return (
      <div className="max-h-screen-xl flex min-h-[70vh]">
        <div className="m-auto">
          <Spinner />
        </div>
      </div>
    );
  } else if (session.status === "unauthenticated") {
    void router.push(
      `/sign-in?error=SessionRequired&callbackUrl=${getBaseUrl()}${
        router.asPath
      }`
    );
    return (
      <div className="max-h-screen-xl flex min-h-[70vh]">
        <div className="m-auto">
          <Spinner />
        </div>
      </div>
    );
  }

  return <span>{children}</span>;
}
