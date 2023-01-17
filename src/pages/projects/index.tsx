import { useRouter } from "next/router";
import SessionAuth from "../../components/auth/SessionAuth";
import CreateButton from "../../components/project/CreateButton";
import DeleteButton from "../../components/project/DeleteButton";
import EditButton from "../../components/project/EditButton";

import { useGetMyProjects } from "../../hooks/projects";

const Projects = () => {
  const router = useRouter();
  const { projects, isLoading, isError } = useGetMyProjects();
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error!</div>;
  return (
    <SessionAuth>
      <div className="flex h-screen">
        <div className="m-auto">
          <div className="flex justify-between">
            <div className="text-lg font-medium">Projects</div>
            <CreateButton />
          </div>
          {projects?.map((project) => (
            <div key={project.id} className="flex">
              <span
                className="w-full bg-blue-500 text-white hover:bg-blue-200 hover:text-blue-500"
                onClick={() => void router.push(`/projects/${project.id}`)}
              >
                <div>
                  <span className="mr-4">{project.name}</span>
                  <span className="mr-4">{project.createdBy}</span>
                  <span className="mr-4">{project.createdAt}</span>
                </div>
              </span>
              <EditButton project={project} />
              <DeleteButton projectId={project.id} />
            </div>
          ))}
        </div>
      </div>
    </SessionAuth>
  );
};

export default Projects;
