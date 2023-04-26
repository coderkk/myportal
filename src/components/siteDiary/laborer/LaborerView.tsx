import { type Laborer } from "@prisma/client";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useDeleteLaborer } from "../../../hooks/laborer";

export type LaborerProps = Laborer & {
  createdBy: {
    name: string | null;
  };
};

const CreateButton = dynamic(() => import("./CreateButton"));

const EditButton = dynamic(() => import("./EditButton"));

const DeleteButton = dynamic(() => import("../../common/DeleteButton"));

export const LaborerView = ({ laborers }: { laborers: LaborerProps[] }) => {
  const router = useRouter();
  const pendingDeleteCountRef = useRef(0);
  const siteDiaryId = router.query.siteDiaryId as string;
  const { deleteLaborer } = useDeleteLaborer({
    pendingDeleteCountRef: pendingDeleteCountRef,
    siteDiaryId: siteDiaryId,
  });
  return (
    <div className="flex justify-between">
      <ul>
        {laborers.map((laborer) => (
          <li key={laborer.id} className=" inline-flex gap-3">
            <span>{laborer.type}</span>
            <span>{laborer.amount}</span>
            <span>{laborer.createdBy.name}</span>
            <EditButton laborer={laborer} siteDiaryId={siteDiaryId} />
            <DeleteButton
              onDelete={() =>
                deleteLaborer({
                  laborerId: laborer.id,
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
