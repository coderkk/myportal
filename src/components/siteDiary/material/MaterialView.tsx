import { type Material } from "@prisma/client";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";

export type MaterialProps = Material & {
  createdBy: {
    name: string | null;
  };
};

const CreateButton = dynamic(() => import("./CreateButton"));

const EditButton = dynamic(() => import("./EditButton"));

const DeleteButton = dynamic(() => import("./DeleteButton"));

export const MaterialView = ({ materials }: { materials: MaterialProps[] }) => {
  const router = useRouter();
  const pendingDeleteCountRef = useRef(0);
  const siteDiaryId = router.query.siteDiaryId as string;
  return (
    <div className="flex justify-between">
      <ul>
        {materials.map((material) => (
          <li key={material.id}>
            <span className="mr-4">{material.units}</span>
            <span className="mr-4">{material.amount}</span>
            <span className="mr-4">{material.createdBy.name}</span>
            <EditButton material={material} siteDiaryId={siteDiaryId} />
            <DeleteButton
              materialId={material.id}
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
