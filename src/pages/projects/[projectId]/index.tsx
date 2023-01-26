import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { api } from "../../../utils/api";

import Link from "next/link";

const DeleteButton = dynamic(
  () => import("../../../components/project/DeleteButton")
);

const Index = () => {
  const { query } = useRouter();
  const utils = api.useContext();
  const projectId = query.projectId as string;
  return (
    <div className="flex h-screen">
      <div className="m-auto">
        <div className="w-full">
          <div className="flex w-5/6 justify-between">
            <p>Viewing project: {projectId}</p>
            <DeleteButton projectId={projectId} navigateBack={true} />
          </div>
          <Link
            onMouseEnter={() => {
              void utils.siteDiary.getSiteDiaries.prefetch(
                { projectId: projectId },
                {
                  staleTime: Infinity,
                }
              );
            }}
            href={`/projects/${projectId}/site-diary`}
          >
            Site diary
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
