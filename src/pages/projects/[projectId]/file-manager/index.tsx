import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import SessionAuth from "../../../../components/auth/SessionAuth";

const FileBrowser = dynamic(
  () => import("../../../../components/fileManager/FileBrowser")
);

const S3Browser = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  return (
    <SessionAuth>
      <div className="flex h-screen max-h-[80vh] justify-center">
        <div className="my-16 w-11/12 lg:w-9/12">
          <FileBrowser projectId={projectId} />
        </div>
      </div>
    </SessionAuth>
  );
};

export default S3Browser;
