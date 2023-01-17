import Link from "next/link";
import { useRouter } from "next/router";
import PermissionToProject from "../../../components/auth/PermissionToProject";
import DeleteButton from "../../../components/project/DeleteButton";

const Index = () => {
  const { query } = useRouter();
  const projectId = query.projectId as string;
  return (
    <div className="flex h-screen">
      <div className="m-auto">
        <div className="w-full">
          <PermissionToProject projectId={projectId}>
            <div className="flex w-5/6 justify-between">
              <p>Viewing project: {projectId}</p>
              <DeleteButton projectId={projectId} navigateBack={true} />
            </div>
            <Link href={`/projects/${projectId}/site-diary`}>Site diary</Link>
          </PermissionToProject>
        </div>
      </div>
    </div>
  );
};

export default Index;
