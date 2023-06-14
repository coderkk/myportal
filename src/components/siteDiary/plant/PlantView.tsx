import { type Plant as _Plant } from "@prisma/client";
import classNames from "classnames";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useDeletePlant } from "../../../hooks/plant";

export type Plant = _Plant & {
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

export const PlantView = ({ plants }: { plants: Plant[] }) => {
  const router = useRouter();
  const siteDiaryId = router.query.siteDiaryId as string;
  const { deletePlant } = useDeletePlant({
    siteDiaryId: siteDiaryId,
  });
  return (
    <div className="mx-8">
      <ul
        role="list"
        className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {plants.map((plant, i) => (
          <li key={plant.id} className="col-span-1 flex rounded-md shadow-sm">
            <div
              className={classNames(
                bgColors[i % bgColors.length],
                "flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white"
              )}
            >
              {plant.type
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
                <span className="ffont-medium text-gray-900 hover:text-gray-600">
                  {plant.type}
                </span>
                <p className="text-gray-500">
                  {plant.amount} {plant.amount > 1 ? "units" : "unit"}
                </p>
              </div>

              <div className="flex-shrink-0 items-center pr-2">
                <EditButton plant={plant} siteDiaryId={siteDiaryId} />
                <DeleteButton
                  title={`Delete Plant ${plant.type}`}
                  subtitle="Are you sure you want to permanently delete this plant?"
                  flex={false}
                  onDelete={() =>
                    deletePlant({
                      plantId: plant.id,
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
