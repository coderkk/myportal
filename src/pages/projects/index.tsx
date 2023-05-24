import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useDeleteProject, useGetProjects } from "../../hooks/project";

import Image from "next/image";
import { useRef } from "react";
import SessionAuth from "../../components/auth/SessionAuth";
import { Header } from "../../components/common/Header";
import Spinner from "../../components/common/Spinner";
import { project } from "../../components/project/EditButton";
import { api } from "../../utils/api";

const CreateButton = dynamic(
  () => import("../../components/project/CreateButton") // https://nextjs.org/docs/advanced-features/dynamic-import for lower First Load JS when "npm run build"
);

const DeleteButton = dynamic(
  () => import("../../components/common/DeleteButton")
);
const EditButton = dynamic(() => import("../../components/project/EditButton"));

const Projects = () => {
  const router = useRouter();
  const utils = api.useContext();
  const { projects, isLoading } = useGetProjects();
  const pendingDeleteCountRef = useRef(0);

  const { deleteProject } = useDeleteProject({ pendingDeleteCountRef });
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
              <CreateButton description="New Project" />
            </div>
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table
                    className="min-w-full divide-y divide-gray-300 overflow-hidden"
                    cellPadding={0}
                  >
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Created By
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Created On
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 text-sm sm:pr-0"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      <AnimatePresence>
                        {projects?.map((project) => (
                          <MotionTR
                            key={project.id}
                            project={project}
                            deleteProject={() =>
                              deleteProject({ projectId: project.id })
                            }
                          />
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {isLoading ? (
              <Spinner />
            ) : (
              <span className="flex justify-center">
                <p className="max-auto p-4 text-slate-500">End of projects</p>
              </span>
            )}
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
                  onClick={() =>
                    void router.push(
                      `/projects/${project.id}/financial-dashboard`
                    )
                  }
                >
                  <div>
                    <span className="mr-4">{project.name}</span>
                    <span className="mr-4">{project.createdBy.name}</span>
                    <span className="mr-4">{project.createdAt}</span>
                  </div>
                </span>
                {/* <EditButton project={project} />
                <DeleteButton
                  title={`Delete Project ${project.name}`}
                  subtitle="Are you sure you want to permanently delete this project?"
                  onDelete={() => {
                    deleteProject({
                      projectId: project.id,
                    });
                  }}
                /> */}
              </div>
            ))}
          </div>
        </div>
      )}
    </SessionAuth>
  );
};

const MotionTR = ({
  project,
  deleteProject,
}: {
  project: project;
  deleteProject: () => void;
}) => {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
      }}
      transition={{ opacity: { duration: 0.2 } }}
      className="w-full"
    >
      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
        <div className="text-gray-900">{project.name}</div>
      </td>
      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
        <div className="flex items-center">
          <div className="h-11 w-11 flex-shrink-0">
            <Image
              className="h-11 w-11 rounded-full"
              src={"/images/default-photo.jpg"}
              alt="Created by photo"
              width={44}
              height={44}
            />
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">
              {project.createdBy.name}
            </div>
            {/* <div className="mt-1 text-gray-500">{task.createdBy?.email}</div> */}
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
        <div className="flex items-center">
          <div className="m-0">
            <div className="font-medium text-gray-900">{project.createdAt}</div>
          </div>
        </div>
      </td>
      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
        <span className="flex items-center justify-center">
          <EditButton project={project} />
          <DeleteButton
            title={`Delete Project ${project.name}`}
            subtitle="Are you sure you want to permanently delete this project?"
            onDelete={deleteProject}
          />
        </span>
        <span className="sr-only">{project.createdBy.name}</span>
      </td>
    </motion.tr>
  );
};

export default Projects;
