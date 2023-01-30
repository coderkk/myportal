import { type Laborer } from "@prisma/client";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";

export type LaborerProps = Laborer & {
  createdBy: {
    name: string | null;
  };
};

const CreateButton = dynamic(() => import("./CreateButton"));

const EditButton = dynamic(() => import("./EditButton"));

const DeleteButton = dynamic(() => import("./DeleteButton"));

export const LaborerView = ({ laborers }: { laborers: LaborerProps[] }) => {
  const router = useRouter();
  const pendingDeleteCountRef = useRef(0);
  const siteDiaryId = router.query.siteDiaryId as string;
  return (
    <div className="flex justify-between">
      <ul>
        {laborers.map((laborer) => (
          <li key={laborer.id}>
            <span className="mr-4">{laborer.type}</span>
            <span className="mr-4">{laborer.amount}</span>
            <span className="mr-4">{laborer.createdBy.name}</span>
            <EditButton laborer={laborer} siteDiaryId={siteDiaryId} />
            <DeleteButton
              laborerId={laborer.id}
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
