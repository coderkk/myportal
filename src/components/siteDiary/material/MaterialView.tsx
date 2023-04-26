import { type Material } from "@prisma/client";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useDeleteMaterial } from "../../../hooks/material";

export type MaterialProps = Material & {
  createdBy: {
    name: string | null;
  };
};

const CreateButton = dynamic(() => import("./CreateButton"));

const EditButton = dynamic(() => import("./EditButton"));

const DeleteButton = dynamic(() => import("../../common/DeleteButton"));

export const MaterialView = ({ materials }: { materials: MaterialProps[] }) => {
  const router = useRouter();
  const pendingDeleteCountRef = useRef(0);
  const siteDiaryId = router.query.siteDiaryId as string;
  const { deleteMaterial } = useDeleteMaterial({
    pendingDeleteCountRef: pendingDeleteCountRef,
    siteDiaryId: siteDiaryId,
  });
  return (
    <div className="flex justify-between">
      <ul>
        {materials.map((material) => (
          <li key={material.id} className=" inline-flex gap-3">
            <span>{material.type}</span>
            <span>{material.units}</span>
            <span>{material.amount}</span>
            <span>{material.createdBy.name}</span>
            <EditButton material={material} siteDiaryId={siteDiaryId} />
            <DeleteButton
              onDelete={() =>
                deleteMaterial({
                  materialId: material.id,
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
