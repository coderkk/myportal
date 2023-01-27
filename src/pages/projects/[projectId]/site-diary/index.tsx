import { useRouter } from "next/router";
import SessionAuth from "../../../../components/auth/SessionAuth";
import CreateButton from "../../../../components/siteDiary/CreateButton";
import DeleteButton from "../../../../components/siteDiary/DeleteButton";
import EditButton from "../../../../components/siteDiary/EditButton";
import { useGetSiteDiaries } from "../../../../hooks/siteDiary";
import { api } from "../../../../utils/api";

const SiteDiary = () => {
  const router = useRouter();
  const utils = api.useContext();
  const projectId = router.query.projectId as string;
  const { siteDiaries, isLoading, isError } = useGetSiteDiaries({
    projectId: projectId,
  });

  return (
    <SessionAuth>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error!</div>
      ) : (
        <div className="flex h-screen">
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
                    <span className="mr-4">{siteDiary.createdBy}</span>
                    <span className="mr-4">{siteDiary.date}</span>
                  </div>
                </span>
                <EditButton siteDiary={siteDiary} projectId={projectId} />
                <DeleteButton
                  siteDiaryId={siteDiary.id}
                  projectId={projectId}
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
