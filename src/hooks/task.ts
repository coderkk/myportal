import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { api } from "../utils/api";

export type task = {
  id: string;
  name: string;
  date: string;
  createdBy: string | null;
};

export const INFINITE_QUERY_LIMIT = 5;

export const useCreateTask = ({ projectId }: { projectId: string }) => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createTask } = api.task.createTask.useMutation({
    async onMutate({ taskDescription, taskStatus, taskAssignedTo }) {
      await utils.task.getTasks.cancel();
      const previousData = utils.task.getTasks.getInfiniteData({
        projectId: projectId,
        limit: INFINITE_QUERY_LIMIT,
      });
      utils.task.getTasks.setInfiniteData(
        { projectId: projectId, limit: INFINITE_QUERY_LIMIT },
        (oldInfiniteData) => {
          if (oldInfiniteData) {
            const newInfiniteData = { ...oldInfiniteData };
            const optimisticUpdateObject = {
              id: Date.now().toString(),
              description: taskDescription,
              status: taskStatus || "NOT_STARTED",
              assignedTo: taskAssignedTo
                ? {
                    id: taskAssignedTo.id,
                    name: taskAssignedTo.name,
                    email: taskAssignedTo.email,
                    image: taskAssignedTo.image,
                  }
                : null,
              createdBy: {
                name: session.data?.user?.name || "You",
                email: session.data?.user?.email || null,
                image: session.data?.user?.image || null,
              },
            };
            const allTasks = [
              optimisticUpdateObject,
              ...newInfiniteData.pages.flatMap((page) => page.tasks),
            ];
            let currentTaskIndex = 0;
            newInfiniteData.pages = newInfiniteData.pages.map((page) => {
              const newTasks = allTasks.slice(
                currentTaskIndex,
                currentTaskIndex + INFINITE_QUERY_LIMIT
              );
              currentTaskIndex += INFINITE_QUERY_LIMIT;
              return {
                ...page,
                tasks: newTasks,
              };
            });
            return newInfiniteData;
          }
          return oldInfiniteData;
        }
      );
      return () =>
        utils.task.getTasks.setInfiniteData(
          { projectId: projectId, limit: INFINITE_QUERY_LIMIT },
          previousData
        );
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    async onSettled() {
      await utils.task.getTasks.invalidate({
        projectId: projectId,
        limit: INFINITE_QUERY_LIMIT,
      });
    },
  });
  return {
    createTask,
  };
};

export const useGetTasks = ({
  projectId,
  limit,
}: {
  projectId: string;
  limit: number;
}) => {
  const {
    data,
    isLoading,
    isSuccess,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.task.getTasks.useInfiniteQuery(
    {
      projectId: projectId,
      limit: limit,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return {
    tasks: data?.pages.flatMap((page) => page.tasks) || [],
    isLoading: isLoading,
    isSuccess: isSuccess,
    hasNextPage: hasNextPage,
    isFetchingNextPage: isFetchingNextPage,
    fetchNextPage: fetchNextPage,
  };
};

export const useUpdateTask = ({ projectId }: { projectId: string }) => {
  const utils = api.useContext();
  const { mutate: updateTask } = api.task.updateTask.useMutation({
    async onMutate({ taskId, taskDescription, taskStatus, taskAssignedTo }) {
      await utils.task.getTasks.cancel();
      const previousData = utils.task.getTasks.getInfiniteData({
        projectId: projectId,
        limit: INFINITE_QUERY_LIMIT,
      });
      utils.task.getTasks.setInfiniteData(
        { projectId: projectId, limit: INFINITE_QUERY_LIMIT },
        (oldInfiniteData) => {
          if (oldInfiniteData) {
            const newInfiniteData = { ...oldInfiniteData };
            newInfiniteData.pages = newInfiniteData.pages.map((page) => {
              let newTasks = [...page.tasks];
              newTasks = newTasks.map((task) => {
                if (task.id === taskId) {
                  return {
                    id: taskId,
                    description: taskDescription,
                    status: taskStatus || "NOT_STARTED",
                    assignedTo: taskAssignedTo
                      ? {
                          id: taskAssignedTo.id,
                          name: taskAssignedTo.name,
                          email: taskAssignedTo.email,
                          image: taskAssignedTo.image,
                        }
                      : null,
                    createdBy: task.createdBy,
                  };
                }
                return task;
              });
              return {
                ...page,
                tasks: [...newTasks],
              };
            });
            return newInfiniteData;
          }
          return oldInfiniteData;
        }
      );
      return () =>
        utils.task.getTasks.setInfiniteData(
          { projectId: projectId, limit: INFINITE_QUERY_LIMIT },
          previousData
        );
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    onSuccess(data, { taskId, taskDescription, taskStatus, taskAssignedTo }) {
      utils.task.getTasks.setInfiniteData(
        { projectId: projectId, limit: INFINITE_QUERY_LIMIT },
        (oldInfiniteData) => {
          if (oldInfiniteData) {
            const newInfiniteData = { ...oldInfiniteData };
            newInfiniteData.pages = newInfiniteData.pages.map((page) => {
              let newTasks = [...page.tasks];
              newTasks = newTasks.map((task) => {
                if (task.id === taskId) {
                  return {
                    id: taskId,
                    description: taskDescription,
                    status: taskStatus || "NOT_STARTED",
                    assignedTo: taskAssignedTo
                      ? {
                          id: taskAssignedTo.id,
                          name: taskAssignedTo.name,
                          email: taskAssignedTo.email,
                          image: taskAssignedTo.image,
                        }
                      : null,
                    createdBy: task.createdBy,
                  };
                }
                return task;
              });
              return {
                ...page,
                tasks: [...newTasks],
              };
            });
            return newInfiniteData;
          }
          return oldInfiniteData;
        }
      );
    },
    async onSettled() {
      await utils.task.getTasks.invalidate({
        projectId: projectId,
        limit: INFINITE_QUERY_LIMIT,
      });
    },
  });
  return {
    updateTask,
  };
};

export const useDeleteTask = ({
  pendingDeleteCountRef,
  projectId,
}: {
  pendingDeleteCountRef?: MutableRefObject<number>;
  projectId: string;
}) => {
  const utils = api.useContext();

  const { mutate: deleteTask } = api.task.deleteTask.useMutation({
    async onMutate({ taskId }) {
      if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1; // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
      await utils.task.getTasks.cancel();
      const previousData = utils.task.getTasks.getInfiniteData({
        projectId: projectId,
        limit: INFINITE_QUERY_LIMIT,
      });
      utils.task.getTasks.setInfiniteData(
        { projectId: projectId, limit: INFINITE_QUERY_LIMIT },
        (oldInfiniteData) => {
          if (oldInfiniteData) {
            const newInfiniteData = { ...oldInfiniteData };
            newInfiniteData.pages = newInfiniteData.pages.map((page) => {
              let newTasks = [...page.tasks];
              newTasks = newTasks.filter((task) => task.id !== taskId);
              return {
                ...page,
                tasks: newTasks,
              };
            });
            return newInfiniteData;
          }
          return oldInfiniteData;
        }
      );
      return () =>
        utils.task.getTasks.setInfiniteData(
          { projectId: projectId, limit: INFINITE_QUERY_LIMIT },
          previousData
        );
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    onSuccess(data, { taskId }) {
      utils.task.getTasks.setInfiniteData(
        { projectId: projectId, limit: INFINITE_QUERY_LIMIT },
        (oldInfiniteData) => {
          if (oldInfiniteData) {
            const newInfiniteData = { ...oldInfiniteData };
            newInfiniteData.pages = newInfiniteData.pages.map((page) => {
              let newTasks = [...page.tasks];
              newTasks = newTasks.filter((task) => task.id !== taskId);
              return {
                ...page,
                tasks: newTasks,
              };
            });
            return newInfiniteData;
          }
          return oldInfiniteData;
        }
      );
    },
    async onSettled() {
      if (pendingDeleteCountRef) {
        pendingDeleteCountRef.current -= 1;
        if (pendingDeleteCountRef.current === 0) {
          await utils.task.getTasks.invalidate({
            projectId: projectId,
            limit: INFINITE_QUERY_LIMIT,
          });
        }
      } else {
        await utils.task.getTasks.invalidate({
          projectId: projectId,
          limit: INFINITE_QUERY_LIMIT,
        });
      }
    },
  });
  return {
    deleteTask,
  };
};
