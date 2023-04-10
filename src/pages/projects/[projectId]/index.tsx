import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import { useGetProject } from "../../../hooks/project";

const DeleteButton = dynamic(
  () => import("../../../components/project/DeleteButton")
);

const Index = () => {
  const { query } = useRouter();
  const projectId = query.projectId as string;
  const { project } = useGetProject({ projectId: projectId });
  return (
    <>
      <div className="flex h-screen">
        <div className="m-auto">
          <div className="w-full">
            <div className="flex justify-between">
              <p>Viewing project: {project?.name}</p>
              <DeleteButton projectId={projectId} navigateBack={true} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
