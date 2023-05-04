import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { useDeleteTask, useGetTasks } from "../../../../hooks/task";

const CreateButton = dynamic(
  () => import("../../../../components/task/CreateButton")
);

const DeleteButton = dynamic(
  () => import("../../../../components/common/DeleteButton")
);

const EditButton = dynamic(
  () => import("../../../../components/task/EditButton")
);

const Task = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const { tasks, isLoading } = useGetTasks({
    projectId: projectId,
  });
  const pendingDeleteCountRef = useRef(0); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache

  const { deleteTask } = useDeleteTask({
    pendingDeleteCountRef: pendingDeleteCountRef,
    projectId: projectId,
  });
  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="flex h-[80vh]">
            <div className="m-auto">
              <div className="flex justify-between">
                <div className="text-lg font-medium">Tasks</div>
                <CreateButton projectId={projectId} />
              </div>
              {tasks?.map((task) => (
                <div key={task.id} className="flex">
                  <span className="w-full bg-blue-500 text-white hover:bg-blue-200 hover:text-blue-500">
                    <div>
                      <span className="mr-4">{task.description}</span>
                      <span className="mr-4">{task.createdBy.name}</span>
                      <span className="mr-4">{task.assignedTo?.email}</span>
                      <span className="mr-4">{task.status}</span>
                    </div>
                  </span>
                  <EditButton task={task} projectId={projectId} />
                  <DeleteButton
                    onDelete={() => {
                      deleteTask({
                        taskId: task.id,
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </PermissionToProject>
    </SessionAuth>
  );
};

export default Task;
