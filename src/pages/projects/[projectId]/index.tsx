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
          <Link
            onMouseEnter={() => {
              void utils.task.getTasks.prefetch(
                { projectId: projectId },
                {
                  staleTime: Infinity,
                }
              );
            }}
            href={`/projects/${projectId}/task`}
          >
            Tasks
          </Link>
          <Link
            onMouseEnter={() => {
              void utils.user.getUsersForProject.prefetch(
                { projectId: projectId },
                {
                  staleTime: Infinity,
                }
              );
              void utils.user.getUsers.prefetch(undefined, {
                staleTime: Infinity,
              });
              void utils.me.isCreatorOfProject.prefetch(
                { projectId: projectId },
                {
                  staleTime: Infinity,
                }
              );
            }}
            href={`/projects/${projectId}/team`}
          >
            Team
          </Link>
          <Link
            onMouseEnter={() => {
              void utils.order.getOrders.prefetch(
                { projectId: projectId },
                {
                  staleTime: Infinity,
                }
              );
            }}
            href={`/projects/${projectId}/order`}
          >
            Orders
          </Link>
          <Link
            onMouseEnter={() => {
              void utils.requestForInformation.getRequestForInformations.prefetch(
                { projectId: projectId },
                {
                  staleTime: Infinity,
                }
              );
            }}
            href={`/projects/${projectId}/requestForInformation`}
          >
            RFIs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
