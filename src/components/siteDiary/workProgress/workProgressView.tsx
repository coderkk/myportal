import { type WorkProgress } from "@prisma/client";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";

export type WorkProgressProps = WorkProgress & {
  createdBy: {
    name: string | null;
  };
};

const CreateButton = dynamic(() => import("./CreateButton"));

const EditButton = dynamic(() => import("./EditButton"));

const DeleteButton = dynamic(() => import("./DeleteButton"));

export const WorkProgressView = ({
  workProgresses,
}: {
  workProgresses: WorkProgressProps[];
}) => {
  const router = useRouter();
  const pendingDeleteCountRef = useRef(0);
  const siteDiaryId = router.query.siteDiaryId as string;
  return (
    <div className="flex justify-between">
      <ul>
        {workProgresses.map((workProgress) => (
          <li key={workProgress.id}>
            <span className="mr-4">{workProgress.comments}</span>
            <span className="mr-4">{workProgress.createdBy.name}</span>
            <EditButton workProgress={workProgress} siteDiaryId={siteDiaryId} />
            <DeleteButton
              workProgressId={workProgress.id}
              siteDiaryId={siteDiaryId}
              pendingDeleteCountRef={pendingDeleteCountRef}
            />
          </li>
        ))}
      </ul>
      <CreateButton siteDiaryId={siteDiaryId} />
    </div>
  );
};
