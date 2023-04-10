import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useGetProjects } from "../../hooks/project";

import { useRef } from "react";
import SessionAuth from "../../components/auth/SessionAuth";
import { Header } from "../../components/common/Header";
import { api } from "../../utils/api";

const CreateButton = dynamic(
  () => import("../../components/project/CreateButton") // https://nextjs.org/docs/advanced-features/dynamic-import for lower First Load JS when "npm run build"
);

const DeleteButton = dynamic(
  () => import("../../components/project/DeleteButton")
);
const EditButton = dynamic(() => import("../../components/project/EditButton"));

const Projects = () => {
  const router = useRouter();
  const utils = api.useContext();
  const { projects, isLoading } = useGetProjects();
  const pendingDeleteCountRef = useRef(0);
  return (
    <SessionAuth>
      <Header />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex h-screen">
          <div className="m-auto">
            <div className="flex justify-between">
              <div className="text-lg font-medium">Projects</div>
              <CreateButton />
            </div>
            {projects?.map((project) => (
              <div
                key={project.id}
                className="flex"
                onMouseEnter={() => {
                  void utils.me.hasPermissionToProject.prefetch(
                    { projectId: project.id },
                    {
                      staleTime: Infinity,
                    }
                  );
                }}
              >
                <span
                  className="w-full bg-blue-500 text-white hover:bg-blue-200 hover:text-blue-500"
                  onClick={() => void router.push(`/projects/${project.id}`)}
                >
                  <div>
                    <span className="mr-4">{project.name}</span>
                    <span className="mr-4">{project.createdBy.name}</span>
                    <span className="mr-4">{project.createdAt}</span>
                  </div>
                </span>
                <EditButton project={project} />
                <DeleteButton
                  projectId={project.id}
                  pendingDeleteCountRef={pendingDeleteCountRef}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </SessionAuth>
  );
};

export default Projects;
