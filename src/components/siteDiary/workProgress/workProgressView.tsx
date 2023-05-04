import { type WorkProgress as _WorkProgress } from "@prisma/client";
import classNames from "classnames";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useDeleteWorkProgress } from "../../../hooks/workProgress";

export type WorkProgress = _WorkProgress & {
  createdBy: {
    name: string | null;
  };
};

const EditButton = dynamic(() => import("./EditButton"));

const DeleteButton = dynamic(() => import("../../common/DeleteButton"));

const bgColors = [
  "bg-green-500",
  "bg-pink-600",
  "bg-purple-600",
  "bg-yellow-500",
];

export const WorkProgressView = ({
  workProgresses,
}: {
  workProgresses: WorkProgress[];
}) => {
  const router = useRouter();
  const pendingDeleteCountRef = useRef(0);
  const siteDiaryId = router.query.siteDiaryId as string;
  const { deleteWorkProgress } = useDeleteWorkProgress({
    pendingDeleteCountRef: pendingDeleteCountRef,
    siteDiaryId: siteDiaryId,
  });
  return (
    <div className="mx-8">
      <ul
        role="list"
        className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {workProgresses.map((workProgress, i) => (
          <li
            key={workProgress.id}
            className="col-span-1 flex rounded-md shadow-sm"
          >
            <div
              className={classNames(
                bgColors[i % bgColors.length],
                "flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white"
              )}
            >
              {workProgress.comments
                .split(/\s/)
                .reduce(
                  (response, word) =>
                    (response += word.slice(0, 1).toLocaleUpperCase()),
                  ""
                )
                .slice(0, 3)}
            </div>
            <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
              <div className="flex-1 truncate px-4 py-2 text-sm hover:overflow-visible hover:whitespace-normal hover:break-all">
                <span className="font-medium text-gray-900 hover:text-gray-600">
                  {workProgress.comments}
                </span>
                <p className="mt-2 text-xs text-gray-500">
                  By: {workProgress.createdBy.name}
                </p>
              </div>

              <div className="flex-shrink-0 items-center pr-2">
                <EditButton
                  workProgress={workProgress}
                  siteDiaryId={siteDiaryId}
                />
                <DeleteButton
                  onDelete={() =>
                    deleteWorkProgress({
                      workProgressId: workProgress.id,
                    })
                  }
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
