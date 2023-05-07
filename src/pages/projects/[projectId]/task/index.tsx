import type { TaskStatus } from "@prisma/client";
import classNames from "classnames";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import Spinner from "../../../../components/common/Spinner";
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

const transformStatus = (status: TaskStatus) => {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "IN_PROGRESS":
      return "In Progress";
    case "NOT_STARTED":
      return "Not Started";
    default:
      return "";
  }
};

const Task = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const { tasks, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useGetTasks({
      projectId: projectId,
    });
  const pendingDeleteCountRef = useRef(0); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
  const observerTarget = useRef(null);

  const { deleteTask } = useDeleteTask({
    pendingDeleteCountRef: pendingDeleteCountRef,
    projectId: projectId,
  });

  useEffect(() => {
    const observerTargetCurrent = observerTarget.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (observerTargetCurrent) {
      observer.observe(observerTargetCurrent);
    }

    return () => {
      if (observerTargetCurrent) {
        observer.unobserve(observerTargetCurrent);
      }
    };
  }, [fetchNextPage, hasNextPage, observerTarget, isFetchingNextPage]);

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex w-full items-center justify-between">
              <h1 className="text-base font-semibold leading-6 text-gray-900">
                Tasks
              </h1>
              <CreateButton projectId={projectId} />
            </div>
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                        >
                          Assigned To
                        </th>
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
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Assigned By
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
                      {tasks?.map((task) => (
                        <tr key={task.id}>
                          <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                            <div className="flex items-center">
                              <div className="h-11 w-11 flex-shrink-0">
                                <Image
                                  className="h-11 w-11 rounded-full"
                                  src={
                                    task.assignedTo?.image ||
                                    "/images/default-photo.jpg"
                                  }
                                  alt="Assigned to photo"
                                  width={44}
                                  height={44}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">
                                  {task.assignedTo
                                    ? task.assignedTo.name
                                    : "Unassigned"}
                                </div>
                                <div className="mt-1 text-gray-500">
                                  {task.assignedTo?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                            <div className="text-gray-900">
                              {task.description}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                            <span
                              className={classNames(
                                task.status === "COMPLETED"
                                  ? "bg-green-50 text-green-700 ring-green-600/20"
                                  : task.status === "IN_PROGRESS"
                                  ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                                  : task.status === "NOT_STARTED"
                                  ? "bg-rose-50 text-rose-700 ring-rose-600/20"
                                  : "",
                                "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                              )}
                            >
                              {transformStatus(task.status)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                            <div className="flex items-center">
                              <div className="h-11 w-11 flex-shrink-0">
                                <Image
                                  className="h-11 w-11 rounded-full"
                                  src={
                                    task.createdBy?.image ||
                                    "/images/default-photo.jpg"
                                  }
                                  alt="Created by photo"
                                  width={44}
                                  height={44}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">
                                  {task.createdBy?.name}
                                </div>
                                <div className="mt-1 text-gray-500">
                                  {task.createdBy?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <span className="flex items-center justify-center">
                              <EditButton task={task} projectId={projectId} />
                              <DeleteButton
                                onDelete={() => {
                                  deleteTask({
                                    taskId: task.id,
                                  });
                                }}
                              />
                            </span>
                            <span className="sr-only">{task.description}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div ref={observerTarget}></div>
                </div>
              </div>
            </div>
            {isFetchingNextPage && <Spinner />}
          </div>
        )}
      </PermissionToProject>
    </SessionAuth>
  );
};

export default Task;
