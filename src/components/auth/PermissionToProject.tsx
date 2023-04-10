import { useEffect } from "react";
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
  const { hasPermission, isLoading, isError } = useHasPermissionToProject({
    projectId: projectId,
  });

  useEffect(() => {
    if (isLoading) return;
    if (!hasPermission) {
      toast.error("No permission to access this project");
    } else if (isError) {
      toast.error("Something went wrong");
    }
  }, [hasPermission, isError, isLoading]);

  if (isLoading) {
    return (
      <div className="max-h-screen-xl flex min-h-[70vh]">
        <div className="m-auto">
          <Spinner />
        </div>
      </div>
    );
  } else if (isError) {
    return (
      <div className="max-h-screen-xl flex min-h-[70vh]">
        <div className="m-auto">An error occurred. Please try again later.</div>
      </div>
    );
  } else if (!hasPermission) {
    return (
      <div className="max-h-screen-xl flex min-h-[70vh]">
        <div className="m-auto">No permission.</div>
      </div>
    );
  }

  return <span>{children}</span>;
}
