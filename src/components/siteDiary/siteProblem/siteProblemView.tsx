import { type SiteProblem } from "@prisma/client";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";

export type SiteProblemProps = SiteProblem & {
  createdBy: {
    name: string | null;
  };
};

const CreateButton = dynamic(() => import("./CreateButton"));

const EditButton = dynamic(() => import("./EditButton"));

const DeleteButton = dynamic(() => import("./DeleteButton"));

export const SiteProblemView = ({
  siteProblems,
}: {
  siteProblems: SiteProblemProps[];
}) => {
  const router = useRouter();
  const pendingDeleteCountRef = useRef(0);
  const siteDiaryId = router.query.siteDiaryId as string;
  return (
    <div className="flex justify-between">
      <ul>
        {siteProblems.map((siteProblem) => (
          <li key={siteProblem.id}>
            <span className="mr-4">{siteProblem.comments}</span>
            <span className="mr-4">{siteProblem.createdBy.name}</span>
            <EditButton siteProblem={siteProblem} siteDiaryId={siteDiaryId} />
            <DeleteButton
              siteProblemId={siteProblem.id}
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
