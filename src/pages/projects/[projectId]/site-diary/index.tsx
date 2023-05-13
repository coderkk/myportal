import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef } from "react";
import {
  activeDateFiltersAtom,
  activeSearchFiltersAtom,
} from "../../../../atoms/siteDiaryAtoms";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { getDateFromActiveFilter } from "../../../../components/siteDiary/DateFilter";
import FilterBar from "../../../../components/siteDiary/FilterBar";
import {
  useDeleteSiteDiary,
  useGetSiteDiaries,
} from "../../../../hooks/siteDiary";
import { api } from "../../../../utils/api";

const CreateButton = dynamic(
  () => import("../../../../components/siteDiary/CreateButton")
);

const DeleteButton = dynamic(
  () => import("../../../../components/common/DeleteButton")
);

const EditButton = dynamic(
  () => import("../../../../components/siteDiary/EditButton")
);

const SiteDiary = () => {
  const router = useRouter();
  const utils = api.useContext();
  const projectId = router.query.projectId as string;
  const [activeSearchFilters] = useAtom(activeSearchFiltersAtom);
  const [activeDateFilters] = useAtom(activeDateFiltersAtom);
  const { siteDiaries, isLoading } = useGetSiteDiaries({
    projectId: projectId,
    siteDiaryNames: activeSearchFilters.map(
      (activeSearchFilter) => activeSearchFilter.value
    ),
    startDate: getDateFromActiveFilter(true, activeDateFilters),
    endDate: getDateFromActiveFilter(false, activeDateFilters),
  });
  const pendingDeleteCountRef = useRef(0); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache

  const { deleteSiteDiary } = useDeleteSiteDiary({
    pendingDeleteCountRef: pendingDeleteCountRef,
    projectId: projectId,
  });

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex w-full items-center justify-between">
              <h1 className="text-base font-semibold leading-6 text-gray-900">
                Site Diaries
              </h1>
              <CreateButton projectId={projectId} />
            </div>
            <div className="my-6">
              <FilterBar />
            </div>
            {siteDiaries === undefined || siteDiaries.length === 0 ? (
              <div className="flex h-[70vh]">
                <div className="m-auto">
                  <span className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="mx-auto h-12 w-12 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
                      />
                    </svg>

                    <span className="mt-2 block text-sm font-semibold text-gray-900">
                      No site diary found
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              <ul
                role="list"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {siteDiaries?.map((siteDiary) => (
                  <li
                    key={siteDiary.id}
                    className="col-span-1 divide-y divide-gray-200 rounded-lg bg-zinc-200/10 shadow hover:cursor-pointer hover:shadow-lg"
                  >
                    <span className="flex items-center justify-between">
                      <Link
                        className="flex w-full max-w-[80%] items-center justify-between space-x-6 p-6"
                        href={`/projects/${projectId}/site-diary/${siteDiary.id}`}
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
                        <div className="flex-1 truncate">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-md truncate font-medium text-gray-900">
                              {siteDiary.name}
                            </h3>
                          </div>
                          <p className="mt-1 truncate text-sm text-gray-500">
                            {siteDiary.date.toLocaleDateString()}
                          </p>
                          <p className="mt-1 truncate text-sm text-gray-500">
                            Created by: {siteDiary.createdBy.name || "unknown"}
                          </p>
                        </div>
                      </Link>
                      <span className="w-20">
                        <a
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-black transition duration-300 hover:scale-125  hover:shadow-xl"
                          href={`/projects/${projectId}/site-diary/${siteDiary.id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open site diary in new tab"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-5 w-5 text-white"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                            />
                          </svg>
                        </a>
                      </span>
                    </span>
                    <div>
                      <div className="-mt-px flex divide-x divide-gray-200">
                        <div className="flex w-0 flex-1">
                          <span className="inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-green-500">
                            <EditButton
                              siteDiary={siteDiary}
                              projectId={projectId}
                            />
                          </span>
                        </div>
                        <div className="-ml-px flex w-0 flex-1">
                          <span className="inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-red-500">
                            <DeleteButton
                              title={`Delete Site Diary ${siteDiary.name}`}
                              subtitle="Are you sure you want to permanently delete this site diary?"
                              triggerLabel="Delete"
                              onDelete={() => {
                                deleteSiteDiary({
                                  siteDiaryId: siteDiary.id,
                                });
                              }}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </PermissionToProject>
    </SessionAuth>
  );
};

export default SiteDiary;
