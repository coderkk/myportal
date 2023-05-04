import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";

const FileBrowser = dynamic(
  () => import("../../../../components/fileManager/FileBrowser")
);

const S3Browser = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        <div
          className="flex h-screen max-h-[100vh] justify-center bg-gradient-to-br from-cyan-200  via-sky-300 to-blue-400
"
        >
          <div className="my-16 w-11/12 lg:w-9/12">
            <FileBrowser projectId={projectId} />
          </div>
        </div>
      </PermissionToProject>
    </SessionAuth>
  );
};

export default S3Browser;
