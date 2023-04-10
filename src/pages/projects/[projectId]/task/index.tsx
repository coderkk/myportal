import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { useGetTasks } from "../../../../hooks/task";

const CreateButton = dynamic(
  () => import("../../../../components/task/CreateButton")
);

const DeleteButton = dynamic(
  () => import("../../../../components/task/DeleteButton")
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

  return (
    <SessionAuth>
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
                  taskId={task.id}
                  projectId={projectId}
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

export default Task;
