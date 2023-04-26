import { type WorkProgress } from "@prisma/client";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useDeleteWorkProgress } from "../../../hooks/workProgress";

export type WorkProgressProps = WorkProgress & {
  createdBy: {
    name: string | null;
  };
};

const CreateButton = dynamic(() => import("./CreateButton"));

const EditButton = dynamic(() => import("./EditButton"));

const DeleteButton = dynamic(() => import("../../common/DeleteButton"));

export const WorkProgressView = ({
  workProgresses,
}: {
  workProgresses: WorkProgressProps[];
}) => {
  const router = useRouter();
  const pendingDeleteCountRef = useRef(0);
  const siteDiaryId = router.query.siteDiaryId as string;
  const { deleteWorkProgress } = useDeleteWorkProgress({
    pendingDeleteCountRef: pendingDeleteCountRef,
    siteDiaryId: siteDiaryId,
  });
  return (
    <div className="flex justify-between">
      <ul>
        {workProgresses.map((workProgress) => (
          <li key={workProgress.id} className=" inline-flex gap-3">
            <span>{workProgress.comments}</span>
            <span>{workProgress.createdBy.name}</span>
            <EditButton workProgress={workProgress} siteDiaryId={siteDiaryId} />
            <DeleteButton
              onDelete={() =>
                deleteWorkProgress({
                  workProgressId: workProgress.id,
                })
              }
            />
          </li>
        ))}
      </ul>
      <CreateButton siteDiaryId={siteDiaryId} />
    </div>
  );
};
