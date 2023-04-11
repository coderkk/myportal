import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
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
          id: Date.now().toString(),
          name: values.projectName,
          createdBy: { name: session.data?.user?.name || "You" },
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

export const useGetProjects = () => {
  const { data, isLoading } = api.project.getProjects.useQuery();
  return {
    projects: data,
    isLoading: isLoading,
  };
};

export const useGetProject = ({ projectId }: { projectId: string }) => {
  const { data, isLoading } = api.project.getProject.useQuery({
    projectId: projectId,
  });
  return {
    project: data,
    isLoading: isLoading,
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
    // do not do this with list-length non-idempotent mutations (eg. create
    // in a list. "Update" and "delete" are fine because they are idempotent)
    // because it might end up appending twice
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

export const useDeleteProject = ({
  pendingDeleteCountRef,
}: {
  pendingDeleteCountRef?: MutableRefObject<number>;
}) => {
  const utils = api.useContext();
  const { mutate: deleteProject } = api.project.deleteProject.useMutation({
    async onMutate({ projectId }) {
      if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1;
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
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    onSuccess(data, { projectId }) {
      utils.project.getProjects.setData(undefined, (oldProjects) => {
        const newProjects = oldProjects?.filter(
          (oldProject) => oldProject.id !== projectId
        );
        return newProjects;
      });
    },
    async onSettled() {
      if (pendingDeleteCountRef) {
        pendingDeleteCountRef.current -= 1;
        if (pendingDeleteCountRef.current === 0) {
          await utils.project.getProjects.invalidate();
        }
      } else {
        await utils.project.getProjects.invalidate();
      }
    },
  });
  return {
    deleteProject,
  };
};

export const useAddToProject = () => {
  const utils = api.useContext();
  const { mutate: addToProject } = api.project.addToProject.useMutation({
    async onMutate(values) {
      await utils.user.getUsersForProject.cancel();
      const previousData = utils.user.getUsersForProject.getData();
      utils.user.getUsersForProject.setData(
        { projectId: values.projectId },
        (oldUsers) => {
          const optimisticUpdateObject = {
            id: values.userId,
            name: values.userName,
            email: values.userEmail,
          };
          if (oldUsers) {
            return [...oldUsers, optimisticUpdateObject];
          } else {
            return [optimisticUpdateObject];
          }
        }
      );
      return () =>
        utils.user.getUsersForProject.setData(
          { projectId: values.projectId },
          previousData
        );
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    async onSettled() {
      await utils.user.getUsersForProject.invalidate();
    },
  });
  return {
    addToProject,
  };
};

export const useRemoveFromProject = ({
  pendingRemoveCountRef,
}: {
  pendingRemoveCountRef?: MutableRefObject<number>;
}) => {
  const utils = api.useContext();
  const { mutate: removeFromProject } =
    api.project.removeFromProject.useMutation({
      async onMutate({ projectId, userToBeRemovedId }) {
        if (pendingRemoveCountRef) pendingRemoveCountRef.current += 1;
        await utils.user.getUsersForProject.cancel();
        const previousData = utils.user.getUsersForProject.getData();
        utils.user.getUsersForProject.setData(
          { projectId: projectId },
          (oldUsersForProject) => {
            const newUsersForProject = oldUsersForProject?.filter(
              (oldUserForProject) => oldUserForProject.id !== userToBeRemovedId
            );
            return newUsersForProject;
          }
        );
        return () =>
          utils.user.getUsersForProject.setData(
            { projectId: projectId },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(data, { projectId, userToBeRemovedId }) {
        utils.user.getUsersForProject.setData(
          { projectId: projectId },
          (oldUsersForProject) => {
            const newUsersForProject = oldUsersForProject?.filter(
              (oldUserForProject) => oldUserForProject.id !== userToBeRemovedId
            );
            return newUsersForProject;
          }
        );
      },
      async onSettled() {
        if (pendingRemoveCountRef) {
          pendingRemoveCountRef.current -= 1;
          if (pendingRemoveCountRef.current === 0) {
            await utils.user.getUsersForProject.invalidate();
          }
        } else {
          await utils.user.getUsersForProject.invalidate();
        }
      },
    });
  return {
    removeFromProject,
  };
};
