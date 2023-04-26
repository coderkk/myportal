import { type Plant } from "@prisma/client";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useDeletePlant } from "../../../hooks/plant";

export type PlantProps = Plant & {
  createdBy: {
    name: string | null;
  };
};

const CreateButton = dynamic(() => import("./CreateButton"));

const EditButton = dynamic(() => import("./EditButton"));

const DeleteButton = dynamic(() => import("../../common/DeleteButton"));

export const PlantView = ({ plants }: { plants: PlantProps[] }) => {
  const router = useRouter();
  const pendingDeleteCountRef = useRef(0);
  const siteDiaryId = router.query.siteDiaryId as string;
  const { deletePlant } = useDeletePlant({
    pendingDeleteCountRef: pendingDeleteCountRef,
    siteDiaryId: siteDiaryId,
  });
  return (
    <div className="flex justify-between">
      <ul>
        {plants.map((plant) => (
          <li key={plant.id} className=" inline-flex gap-3">
            <span>{plant.type}</span>
            <span>{plant.amount}</span>
            <span>{plant.createdBy.name}</span>
            <EditButton plant={plant} siteDiaryId={siteDiaryId} />
            <DeleteButton
              onDelete={() =>
                deletePlant({
                  plantId: plant.id,
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
