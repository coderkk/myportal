import type { TaskStatus } from "@prisma/client";
import { useAtom } from "jotai";
import {
  activeSearchFiltersAtom,
  activeStatusFiltersAtom,
  tasksMutationCountAtom,
} from "../atoms/taskAtoms";
import { api } from "../utils/api";

export type task = {
  id: string;
  name: string;
  date: string;
  createdBy: string | null;
};

export const INFINITE_QUERY_LIMIT = 5;

export const getSearchType = (label: string) => {
  switch (label) {
    case "Description":
      return "DESCRIPTION";
    case "Assigned To":
      return "ASSIGNED_TO";
    case "Assigned By":
      return "ASSIGNED_BY";
    default:
      throw new Error("Invalid search type");
  }
};

export const useCreateTask = ({ projectId }: { projectId: string }) => {
  const utils = api.useContext();
  const [activeStatusFilters] = useAtom(activeStatusFiltersAtom);
  const [activeSearchFilters] = useAtom(activeSearchFiltersAtom);
  const { mutate: createTask } = api.task.createTask.useMutation({
    onSuccess(data) {
      utils.task.getTasks.setInfiniteData(
        {
          projectId: projectId,
          limit: INFINITE_QUERY_LIMIT,
          statuses: activeStatusFilters.map(
            (activeStatusFilter) => activeStatusFilter.value
          ),
          searches: activeSearchFilters.map((activeSearchFilter) => {
            return {
              category: getSearchType(activeSearchFilter.label),
              value: activeSearchFilter.value,
            };
          }),
        },
        (oldInfiniteData) => {
          if (oldInfiniteData) {
            const newInfiniteData = { ...oldInfiniteData };
            const optimisticUpdateObject = {
              id: data.id,
              description: data.description,
              status: data.status,
              assignedTo: data.assignedTo,
              createdBy: data.createdBy,
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
    },
    async onSettled() {
      await utils.task.getTasks.invalidate({
        projectId: projectId,
        limit: INFINITE_QUERY_LIMIT,
        statuses: activeStatusFilters.map(
          (activeStatusFilter) => activeStatusFilter.value
        ),
        searches: activeSearchFilters.map((activeSearchFilter) => {
          return {
            category: getSearchType(activeSearchFilter.label),
            value: activeSearchFilter.value,
          };
        }),
      });
    },
  });
  return {
    createTask,
  };
};

export const category = ["DESCRIPTION", "ASSIGNED_TO", "ASSIGNED_BY"] as const;

export type category = (typeof category)[number];

type search = {
  category: category;
  value: string;
};

export const useGetTasks = ({
  projectId,
  limit,
  statuses,
  searches,
}: {
  projectId: string;
  limit: number;
  statuses: TaskStatus[];
  searches: search[];
}) => {
  const [tasksMutationCount] = useAtom(tasksMutationCountAtom);
  const { data, isLoading, isSuccess, hasNextPage, fetchNextPage, isFetching } =
    api.task.getTasks.useInfiniteQuery(
      {
        projectId: projectId,
        limit: limit,
        statuses: statuses,
        searches: searches.map((search) => {
          return {
            category: search.category,
            value: search.value,
          };
        }),
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: tasksMutationCount === 0,
      }
    );
  return {
    tasks: data?.pages.flatMap((page) => page.tasks) || [],
    isLoading: isLoading,
    isSuccess: isSuccess,
    hasNextPage: hasNextPage,
    fetchNextPage: fetchNextPage,
    isFetching: isFetching,
  };
};

export const useUpdateTask = ({ projectId }: { projectId: string }) => {
  const utils = api.useContext();
  const [activeStatusFilters] = useAtom(activeStatusFiltersAtom);
  const [activeSearchFilters] = useAtom(activeSearchFiltersAtom);
  const { mutate: updateTask } = api.task.updateTask.useMutation({
    async onMutate({ taskId, taskDescription, taskStatus, taskAssignedTo }) {
      await utils.task.getTasks.cancel();
      const previousData = utils.task.getTasks.getInfiniteData({
        projectId: projectId,
        limit: INFINITE_QUERY_LIMIT,
        statuses: activeStatusFilters.map(
          (activeStatusFilter) => activeStatusFilter.value
        ),
        searches: activeSearchFilters.map((activeSearchFilter) => {
          return {
            category: getSearchType(activeSearchFilter.label),
            value: activeSearchFilter.value,
          };
        }),
      });
      utils.task.getTasks.setInfiniteData(
        {
          projectId: projectId,
          limit: INFINITE_QUERY_LIMIT,
          statuses: activeStatusFilters.map(
            (activeStatusFilter) => activeStatusFilter.value
          ),
          searches: activeSearchFilters.map((activeSearchFilter) => {
            return {
              category: getSearchType(activeSearchFilter.label),
              value: activeSearchFilter.value,
            };
          }),
        },
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
          {
            projectId: projectId,
            limit: INFINITE_QUERY_LIMIT,
            statuses: activeStatusFilters.map(
              (activeStatusFilter) => activeStatusFilter.value
            ),
            searches: activeSearchFilters.map((activeSearchFilter) => {
              return {
                category: getSearchType(activeSearchFilter.label),
                value: activeSearchFilter.value,
              };
            }),
          },
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
        {
          projectId: projectId,
          limit: INFINITE_QUERY_LIMIT,
          statuses: activeStatusFilters.map(
            (activeStatusFilter) => activeStatusFilter.value
          ),
          searches: activeSearchFilters.map((activeSearchFilter) => {
            return {
              category: getSearchType(activeSearchFilter.label),
              value: activeSearchFilter.value,
            };
          }),
        },
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
        statuses: activeStatusFilters.map(
          (activeStatusFilter) => activeStatusFilter.value
        ),
        searches: activeSearchFilters.map((activeSearchFilter) => {
          return {
            category: getSearchType(activeSearchFilter.label),
            value: activeSearchFilter.value,
          };
        }),
      });
    },
  });
  return {
    updateTask,
  };
};

export const useDeleteTask = ({ projectId }: { projectId: string }) => {
  const utils = api.useContext();
  const [activeStatusFilters] = useAtom(activeStatusFiltersAtom);
  const [activeSearchFilters] = useAtom(activeSearchFiltersAtom);
  const [, setTasksMutationCount] = useAtom(tasksMutationCountAtom);
  const { mutate: deleteTask } = api.task.deleteTask.useMutation({
    async onMutate({ taskId }) {
      setTasksMutationCount((prev) => prev + 1); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
      await utils.task.getTasks.cancel();
      const previousData = utils.task.getTasks.getInfiniteData({
        projectId: projectId,
        limit: INFINITE_QUERY_LIMIT,
        statuses: activeStatusFilters.map(
          (activeStatusFilter) => activeStatusFilter.value
        ),
        searches: activeSearchFilters.map((activeSearchFilter) => {
          return {
            category: getSearchType(activeSearchFilter.label),
            value: activeSearchFilter.value,
          };
        }),
      });
      utils.task.getTasks.setInfiniteData(
        {
          projectId: projectId,
          limit: INFINITE_QUERY_LIMIT,
          statuses: activeStatusFilters.map(
            (activeStatusFilter) => activeStatusFilter.value
          ),
          searches: activeSearchFilters.map((activeSearchFilter) => {
            return {
              category: getSearchType(activeSearchFilter.label),
              value: activeSearchFilter.value,
            };
          }),
        },
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
          {
            projectId: projectId,
            limit: INFINITE_QUERY_LIMIT,
            statuses: activeStatusFilters.map(
              (activeStatusFilter) => activeStatusFilter.value
            ),
            searches: activeSearchFilters.map((activeSearchFilter) => {
              return {
                category: getSearchType(activeSearchFilter.label),
                value: activeSearchFilter.value,
              };
            }),
          },
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
        {
          projectId: projectId,
          limit: INFINITE_QUERY_LIMIT,
          statuses: activeStatusFilters.map(
            (activeStatusFilter) => activeStatusFilter.value
          ),
          searches: activeSearchFilters.map((activeSearchFilter) => {
            return {
              category: getSearchType(activeSearchFilter.label),
              value: activeSearchFilter.value,
            };
          }),
        },
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
      setTasksMutationCount((prev) => prev - 1);
      await utils.task.getTasks.invalidate({
        projectId: projectId,
        limit: INFINITE_QUERY_LIMIT,
        statuses: activeStatusFilters.map(
          (activeStatusFilter) => activeStatusFilter.value
        ),
        searches: activeSearchFilters.map((activeSearchFilter) => {
          return {
            category: getSearchType(activeSearchFilter.label),
            value: activeSearchFilter.value,
          };
        }),
      });
    },
  });
  return {
    deleteTask,
  };
};
