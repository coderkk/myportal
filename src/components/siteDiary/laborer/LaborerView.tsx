import { type Laborer as _Laborer } from "@prisma/client";
import classNames from "classnames";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useDeleteLaborer } from "../../../hooks/laborer";

export type Laborer = _Laborer & {
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

export const LaborerView = ({ laborers }: { laborers: Laborer[] }) => {
  const router = useRouter();
  const siteDiaryId = router.query.siteDiaryId as string;
  const { deleteLaborer } = useDeleteLaborer({
    siteDiaryId: siteDiaryId,
  });
  return (
    <div className="mx-8">
      <ul
        role="list"
        className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {laborers.map((laborer, i) => (
          <li key={laborer.id} className="col-span-1 flex rounded-md shadow-sm">
            <div
              className={classNames(
                bgColors[i % bgColors.length],
                "flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white"
              )}
            >
              {laborer.type
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
                  {laborer.type}
                </span>
                <p className="text-gray-500">
                  {laborer.amount} {laborer.amount > 1 ? "units" : "unit"}
                </p>
              </div>

              <div className="flex-shrink-0 items-center pr-2">
                <EditButton laborer={laborer} siteDiaryId={siteDiaryId} />
                <DeleteButton
                  title={`Delete Laborer ${laborer.type}`}
                  subtitle="Are you sure you want to permanently delete this laborer?"
                  flex={false}
                  onDelete={() =>
                    deleteLaborer({
                      laborerId: laborer.id,
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
