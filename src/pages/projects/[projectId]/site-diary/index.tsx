import { useRouter } from "next/router";
import SessionAuth from "../../../../components/auth/SessionAuth";
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
            <div className="text-lg font-medium">Site Diaries</div>
            <ul>
              {siteDiaries?.map((siteDiary) => (
                <li
                  key={siteDiary.id}
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
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </SessionAuth>
  );
};

export default SiteDiary;
