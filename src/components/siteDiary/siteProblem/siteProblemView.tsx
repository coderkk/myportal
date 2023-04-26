import { type SiteProblem } from "@prisma/client";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useDeleteSiteProblem } from "../../../hooks/siteProblem";

export type SiteProblemProps = SiteProblem & {
  createdBy: {
    name: string | null;
  };
};

const CreateButton = dynamic(() => import("./CreateButton"));

const EditButton = dynamic(() => import("./EditButton"));

const DeleteButton = dynamic(() => import("../../common/DeleteButton"));

export const SiteProblemView = ({
  siteProblems,
}: {
  siteProblems: SiteProblemProps[];
}) => {
  const router = useRouter();
  const pendingDeleteCountRef = useRef(0);
  const siteDiaryId = router.query.siteDiaryId as string;
  const { deleteSiteProblem } = useDeleteSiteProblem({
    pendingDeleteCountRef: pendingDeleteCountRef,
    siteDiaryId: siteDiaryId,
  });
  return (
    <div className="flex justify-between">
      <ul>
        {siteProblems.map((siteProblem) => (
          <li key={siteProblem.id} className=" inline-flex gap-3">
            <span>{siteProblem.comments}</span>
            <span>{siteProblem.createdBy.name}</span>
            <EditButton siteProblem={siteProblem} siteDiaryId={siteDiaryId} />
            <DeleteButton
              onDelete={() =>
                deleteSiteProblem({
                  siteProblemId: siteProblem.id,
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
