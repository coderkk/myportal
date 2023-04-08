import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { api } from "../utils/api";

export type task = {
  id: string;
  name: string;
  date: string;
  createdBy: string | null;
};

export const useCreateTask = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createTask } = api.task.createTask.useMutation({
    async onMutate(values) {
      await utils.task.getTasks.cancel();
      const previousData = utils.task.getTasks.getData();
      utils.task.getTasks.setData(
        { projectId: values.projectId },
        (oldTasks) => {
          const optimisticUpdateObject = {
            id: Date.now().toString(),
            description: values.taskDescription,
            status: values.taskStatus || "NOT_STARTED",
            assignedTo: {
              id: values.taskAssignedTo?.id || Date.now().toString(),
              email: values.taskAssignedTo?.email || null,
            },
            createdBy: { name: session.data?.user?.name || "You" },
          };
          if (oldTasks) {
            return [...oldTasks, optimisticUpdateObject];
          } else {
            return [optimisticUpdateObject];
          }
        }
      );
      return () =>
        utils.task.getTasks.setData(
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
      await utils.task.getTasks.invalidate();
    },
  });
  return {
    createTask,
  };
};

export const useGetTasks = ({ projectId }: { projectId: string }) => {
  const { data, isLoading } = api.task.getTasks.useQuery({
    projectId: projectId,
  });
  return {
    tasks: data,
    isLoading: isLoading,
  };
};

export const useUpdateTask = ({ projectId }: { projectId: string }) => {
  const utils = api.useContext();
  const { mutate: updateTask } = api.task.updateTask.useMutation({
    async onMutate({ taskId, taskDescription, taskStatus, taskAssignedTo }) {
      await utils.task.getTasks.cancel();
      const previousData = utils.task.getTasks.getData();
      utils.task.getTasks.setData({ projectId: projectId }, (oldTasks) => {
        if (oldTasks) {
          const newTasks = oldTasks.map((oldTask) => {
            return { ...oldTask };
          });
          const taskToUpdateIndex = newTasks?.findIndex(
            (task) => task.id === taskId
          );
          const updatedTask = newTasks[taskToUpdateIndex];
          if (updatedTask) {
            updatedTask.description = taskDescription;
            updatedTask.status = taskStatus || "NOT_STARTED";
            updatedTask.assignedTo = {
              id: taskAssignedTo?.id || Date.now().toString(),
              email: taskAssignedTo?.email || null,
            };
            newTasks[taskToUpdateIndex] = updatedTask;
          }
          return newTasks;
        } else {
          return oldTasks;
        }
      });
      return () =>
        utils.task.getTasks.setData({ projectId: projectId }, previousData);
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    onSuccess(data, { taskId, taskDescription, taskStatus, taskAssignedTo }) {
      utils.task.getTasks.setData({ projectId: projectId }, (oldTasks) => {
        if (oldTasks) {
          const newTasks = oldTasks.map((oldTask) => {
            return { ...oldTask };
          });
          const taskToUpdateIndex = newTasks?.findIndex(
            (task) => task.id === taskId
          );
          const updatedTask = newTasks[taskToUpdateIndex];
          if (updatedTask) {
            updatedTask.description = taskDescription;
            updatedTask.status = taskStatus || "NOT_STARTED";
            updatedTask.assignedTo = {
              id: taskAssignedTo?.id || Date.now().toString(),
              email: taskAssignedTo?.email || null,
            };
            newTasks[taskToUpdateIndex] = updatedTask;
          }
          return newTasks;
        } else {
          return oldTasks;
        }
      });
    },
    async onSettled() {
      await utils.task.getTasks.invalidate();
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
      const previousData = utils.task.getTasks.getData();
      utils.task.getTasks.setData({ projectId: projectId }, (oldTasks) => {
        const newTasks = oldTasks?.filter((newTask) => newTask.id !== taskId);
        return newTasks;
      });
      return () =>
        utils.task.getTasks.setData({ projectId: projectId }, previousData);
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    onSuccess(data, { taskId }) {
      utils.task.getTasks.setData({ projectId: projectId }, (oldTasks) => {
        const newTasks = oldTasks?.filter((newTask) => newTask.id !== taskId);
        return newTasks;
      });
    },
    async onSettled() {
      if (pendingDeleteCountRef) {
        pendingDeleteCountRef.current -= 1;
        if (pendingDeleteCountRef.current === 0) {
          await utils.task.getTasks.invalidate();
        }
      } else {
        await utils.task.getTasks.invalidate();
      }
    },
  });
  return {
    deleteTask,
  };
};
