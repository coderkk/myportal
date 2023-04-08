import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useHasPermissionToProject } from "../../hooks/me";
import Spinner from "../common/Spinner";

export default function PermissionToProject({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { hasPermission, isLoading, isError } = useHasPermissionToProject({
    projectId: projectId,
  });
  if (isLoading) {
    return (
      <div className="max-h-screen-xl flex min-h-[70vh]">
        <div className="m-auto">
          <Spinner />
        </div>
      </div>
    );
  } else if (isError) {
    toast.error("Something went wrong");
    return (
      <div className="max-h-screen-xl flex min-h-[70vh]">
        <div className="m-auto">
          <Spinner />
        </div>
      </div>
    );
  } else if (!hasPermission) {
    void router.push("/projects");
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
