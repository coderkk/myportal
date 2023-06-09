import type { TaskStatus } from "@prisma/client";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import type { MutableRefObject } from "react";
import { useCallback, useRef } from "react";
import defaultPhoto from "../../../../../public/images/default-photo.jpg";
import {
  activeSearchFiltersAtom,
  activeStatusFiltersAtom,
} from "../../../../atoms/taskAtoms";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import Spinner from "../../../../components/common/Spinner";
import type { task } from "../../../../components/task/EditButton";
import EmptyState from "../../../../components/task/EmptyState";
import FilterBar from "../../../../components/task/FilterBar";
import {
  INFINITE_QUERY_LIMIT,
  getSearchType,
  useDeleteTask,
  useGetTasks,
} from "../../../../hooks/task";

const CreateButton = dynamic(
  () => import("../../../../components/task/CreateButton")
);

const DeleteButton = dynamic(
  () => import("../../../../components/common/DeleteButton")
);

const EditButton = dynamic(
  () => import("../../../../components/task/EditButton")
);

export const transformStatusToFrontendValue = (status: TaskStatus) => {
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
  const [activeStatusFilters] = useAtom(activeStatusFiltersAtom);
  const [activeSearchFilters] = useAtom(activeSearchFiltersAtom);

  const { tasks, hasNextPage, fetchNextPage, isFetching } = useGetTasks({
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
  const pendingDeleteCountRef = useRef(0); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache

  // https://tkdodo.eu/blog/avoiding-use-effect-with-callback-refs
  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0]?.isIntersecting) {
              void fetchNextPage();
            }
          },
          { threshold: 1 }
        );
        observer.observe(node);
      }
    },
    [fetchNextPage]
  );

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Tasks
            </h1>
            <CreateButton projectId={projectId} description="New Task" />
          </div>
          <div className="mt-6">
            <FilterBar />
          </div>
          {tasks.length === 0 && !isFetching ? (
            <EmptyState projectId={projectId} />
          ) : (
            <>
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
                        <AnimatePresence>
                          {tasks?.map((task) => (
                            <MotionTR
                              key={task.id}
                              task={task}
                              projectId={projectId}
                              pendingDeleteCountRef={pendingDeleteCountRef}
                            />
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {isFetching ? (
                <Spinner />
              ) : !hasNextPage ? (
                <span className="flex justify-center">
                  <p className="max-auto p-4 text-slate-500">End of tasks</p>
                </span>
              ) : (
                <div ref={observerRef} />
              )}
            </>
          )}
        </div>
      </PermissionToProject>
    </SessionAuth>
  );
};

const MotionTR = ({
  task,
  projectId,
  pendingDeleteCountRef,
}: {
  task: task;
  projectId: string;
  pendingDeleteCountRef: MutableRefObject<number>;
}) => {
  const { deleteTask } = useDeleteTask({
    pendingDeleteCountRef: pendingDeleteCountRef,
    projectId: projectId,
  });
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
      <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
        <div className="flex items-center">
          <div className="h-11 w-11 flex-shrink-0">
            <Image
              className="h-11 w-11 rounded-full"
              src={task.assignedTo?.image || defaultPhoto}
              alt="Assigned to photo"
              width={44}
              height={44}
            />
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">
              {!task.assignedTo ? "Unassigned" : task.assignedTo.name}
            </div>
            <div className="mt-1 text-gray-500">{task.assignedTo?.email}</div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
        <div className="text-gray-900">{task.description}</div>
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
          {transformStatusToFrontendValue(task.status)}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
        <div className="flex items-center">
          <div className="h-11 w-11 flex-shrink-0">
            <Image
              className="h-11 w-11 rounded-full"
              src={task.createdBy?.image || defaultPhoto}
              alt="Created by photo"
              width={44}
              height={44}
            />
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">
              {task.createdBy?.name}
            </div>
            <div className="mt-1 text-gray-500">{task.createdBy?.email}</div>
          </div>
        </div>
      </td>
      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
        <span className="flex items-center justify-center">
          <EditButton task={task} projectId={projectId} />
          <DeleteButton
            title={`Delete Task ${
              task.description.split(/\s/).length > 4
                ? task.description
                    .split(/\s/)
                    .reduce(
                      (response: string, word: string) =>
                        (response += response.length < 20 ? word + " " : ""),
                      ""
                    ) + "..."
                : task.description.length > 20
                ? task.description.slice(0, 20) + "..."
                : task.description
            }`}
            subtitle="Are you sure you want to permanently delete this task?"
            onDelete={() => {
              deleteTask({
                taskId: task.id,
              });
            }}
          />
        </span>
        <span className="sr-only">{task.description}</span>
      </td>
    </motion.tr>
  );
};

export default Task;
