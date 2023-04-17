import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import { useGetProject } from "../../../hooks/project";

const DeleteButton = dynamic(
  () => import("../../../components/project/DeleteButton")
);

const Table = dynamic(() => import("../../../components/common/Table"), {
  ssr: false,
});

const Index = () => {
  const { query } = useRouter();
  const projectId = query.projectId as string;
  const { project } = useGetProject({ projectId: projectId });
  return (
    <div className="flex h-screen">
      <div className="m-auto">
        <div className="w-full">
          <div className="flex justify-between">
            <p>Viewing project: {project?.name}</p>
            <DeleteButton projectId={projectId} navigateBack={true} />
          </div>
          <main className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mt-6">
              <Table />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
