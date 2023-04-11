import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { useGetSiteDiaries } from "../../../../hooks/siteDiary";
import { api } from "../../../../utils/api";

const CreateButton = dynamic(
  () => import("../../../../components/siteDiary/CreateButton")
);

const DeleteButton = dynamic(
  () => import("../../../../components/siteDiary/DeleteButton")
);

const EditButton = dynamic(
  () => import("../../../../components/siteDiary/EditButton")
);

const SiteDiary = () => {
  const router = useRouter();
  const utils = api.useContext();
  const projectId = router.query.projectId as string;
  const { siteDiaries, isLoading } = useGetSiteDiaries({
    projectId: projectId,
  });
  const pendingDeleteCountRef = useRef(0); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache

  return (
    <SessionAuth>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex h-[80vh]">
          <div className="m-auto">
            <div className="flex justify-between">
              <div className="text-lg font-medium">Site Diaries</div>
              <CreateButton projectId={projectId} />
            </div>
            {siteDiaries?.map((siteDiary) => (
              <div key={siteDiary.id} className="flex">
                <span
                  className="w-full bg-blue-500 text-white hover:bg-blue-200 hover:text-blue-500"
                  onClick={() =>
                    void router.push(
                      `/projects/${projectId}/site-diary/${siteDiary.id}`
                    )
                  }
                  onMouseEnter={() => {
                    void utils.siteDiary.getSiteDiary.prefetch(
                      {
                        siteDiaryId: siteDiary.id,
                      },
                      {
                        staleTime: Infinity,
                      }
                    );
                  }}
                >
                  <div>
                    <span className="mr-4">{siteDiary.name}</span>
                    <span className="mr-4">{siteDiary.createdBy.name}</span>
                    <span className="mr-4">
                      {siteDiary.date.toLocaleDateString()}
                    </span>
                  </div>
                </span>
                <EditButton siteDiary={siteDiary} projectId={projectId} />
                <DeleteButton
                  siteDiaryId={siteDiary.id}
                  projectId={projectId}
                  pendingDeleteCountRef={pendingDeleteCountRef}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </SessionAuth>
  );
};

export default SiteDiary;
