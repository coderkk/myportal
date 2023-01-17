import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import type { siteDiary } from "../pages/projects/[projectId]/site-diary";
import { api } from "../utils/api";

export const useCreateProject = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createProject } = api.project.createProject.useMutation({
    async onMutate(values) {
      await utils.project.getProjects.cancel();
      const previousData = utils.project.getProjects.getData();
      utils.project.getProjects.setData(undefined, (oldProjects) => {
        const optimisticUpdateObject = {
          name: values.projectName,
          id: new Date(Date.now()).toLocaleDateString(),
          createdBy: session.data?.user?.name || "You",
          createdAt: new Date(Date.now()).toLocaleDateString(),
        };
        if (oldProjects) {
          return [...oldProjects, optimisticUpdateObject];
        } else {
          return [optimisticUpdateObject];
        }
      });
      return () => utils.project.getProjects.setData(undefined, previousData);
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    async onSettled() {
      await utils.project.getProjects.invalidate();
    },
  });
  return {
    createProject,
  };
};

export const useGetMyProjects = () => {
  const { data, isLoading, isError } = api.project.getProjects.useQuery();
  return {
    projects: data,
    isLoading: isLoading,
    isError: isError,
  };
};

export const useUpdateProject = () => {
  const utils = api.useContext();
  const { mutate: updateProject } = api.project.updateProject.useMutation({
    async onMutate({ projectId, projectName }) {
      await utils.project.getProjects.cancel();
      const previousData = utils.project.getProjects.getData();
      // OU with data from user input
      utils.project.getProjects.setData(undefined, (oldProjects) => {
        if (oldProjects) {
          // we must deep clone the object so that React sees that the REFERENCE to
          // the array (and its nested objects!) has changed so that it would rerender.
          const newProjects = oldProjects.map((oldProject) => {
            return { ...oldProject };
          });
          const projectToUpdateIndex = newProjects?.findIndex(
            (project) => project.id === projectId
          );
          const updatedProject = newProjects[projectToUpdateIndex];
          if (updatedProject) {
            updatedProject.name = projectName;
            newProjects[projectToUpdateIndex] = updatedProject;
          }
          return newProjects;
        } else {
          return oldProjects;
        }
      });
      return () => utils.project.getProjects.setData(undefined, previousData);
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    // do not do this with list mutations because it might end up appending twice
    onSuccess(data, { projectId, projectName }) {
      // OU with data returned from the server
      utils.project.getProjects.setData(undefined, (oldProjects) => {
        if (oldProjects) {
          // we must deep clone the object so that React sees that the REFERENCE to
          // the array (and its nested objects!) has changed so that it would rerender.
          const newProjects = oldProjects.map((oldProject) => {
            return { ...oldProject };
          });
          const projectToUpdateIndex = newProjects?.findIndex(
            (project) => project.id === projectId
          );
          const updatedProject = newProjects[projectToUpdateIndex];
          if (updatedProject) {
            updatedProject.name = projectName;
            newProjects[projectToUpdateIndex] = updatedProject;
          }
          return newProjects;
        } else {
          return oldProjects;
        }
      });
    },
    async onSettled() {
      // Actually sync data with server
      await utils.project.getProjects.invalidate();
    },
  });
  return {
    updateProject,
  };
};

export const useDeleteProject = () => {
  const utils = api.useContext();
  const router = useRouter();
  const { mutate: deleteProject } = api.project.deleteProject.useMutation({
    async onMutate({ projectId }) {
      await utils.project.getProjects.cancel();
      const previousData = utils.project.getProjects.getData();
      utils.project.getProjects.setData(undefined, (oldProjects) => {
        const newProjects = oldProjects?.filter(
          (oldProject) => oldProject.id !== projectId
        );
        return newProjects;
      });
      return () => utils.project.getProjects.setData(undefined, previousData);
    },
    onSuccess(data, { navigateBack }) {
      if (navigateBack) {
        router.back();
      }
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    async onSettled() {
      await utils.project.getProjects.invalidate();
    },
  });
  return {
    deleteProject,
  };
};

export const useGetSiteDiares = ({
  projectId,
  initialData,
}: {
  projectId: string;
  initialData: siteDiary[];
}) => {
  const { data, isLoading, isError } = api.project.getSiteDiaries.useQuery(
    {
      projectId: projectId,
    },
    {
      initialData: {
        siteDiaries: initialData,
      },
      staleTime: 0, // this is the default but putting it here to remind devs
    }
  );
  return {
    siteDiaries: data.siteDiaries,
    isLoading: isLoading,
    isError: isError,
  };
};
