import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import type { BaseSyntheticEvent } from "react";
import { useEffect, useRef, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import DebouncedInput from "../../../../components/common/DebounceInput";
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

type FormValues = {
  siteDiaryName: string;
  startDate?: Date;
  endDate?: Date;
};

const SiteDiary = () => {
  const router = useRouter();
  const utils = api.useContext();
  const projectId = router.query.projectId as string;
  const [siteDiaryName, setSiteDiaryName] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [unsavedChangesToastId, setUnsavedChangesToastId] = useState<
    string | undefined
  >(undefined);
  const { siteDiaries, isLoading } = useGetSiteDiaries({
    projectId: projectId,
    siteDiaryName: siteDiaryName,
    startDate: startDate,
    endDate: endDate,
  });
  const pendingDeleteCountRef = useRef(0); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
  const { handleSubmit, control, watch } = useForm<FormValues>();
  const {
    siteDiaryName: currentSiteDiaryName,
    startDate: currentStartDate,
    endDate: currentEndDate,
  } = watch();

  const onSubmit = (
    { siteDiaryName, startDate, endDate }: FormValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
      toast.error("Start date must be before end date");
      return;
    }
    setSiteDiaryName(siteDiaryName);
    setStartDate(startDate);
    setEndDate(endDate);
    toast.dismiss(unsavedChangesToastId);
    setUnsavedChangesToastId(undefined);
  };

  useEffect(() => {
    if (
      unsavedChangesToastId === undefined && // only show toast if there is no existing toast
      ((currentSiteDiaryName !== undefined && // siteDiaryName is never undefined
        currentSiteDiaryName !== siteDiaryName) ||
        currentStartDate?.getTime() !== startDate?.getTime() ||
        currentEndDate?.getTime() !== endDate?.getTime())
    ) {
      const toastId = toast(
        <span className="animate-bounce p-2 text-blue-500">
          You have unsaved changes
        </span>,
        {
          duration: Infinity,
          position: "bottom-center",
        }
      );
      setUnsavedChangesToastId(toastId);
    }
  }, [
    currentEndDate,
    currentSiteDiaryName,
    currentStartDate,
    endDate,
    siteDiaryName,
    startDate,
    unsavedChangesToastId,
  ]);

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <form
            className="m-8"
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          >
            <span className="mb-4 flex items-center">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="mr-4 w-full">
                <Controller
                  name="siteDiaryName"
                  control={control}
                  render={({ field }) => {
                    const { onChange, value } = field;
                    // we need a debounced input here because otherwise the input suffers from a race condition and we might see multiple toasts
                    return (
                      <DebouncedInput
                        type="text"
                        id="search"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-200/10 py-2 pl-10  text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Search site diary name"
                        value={value || ""}
                        onChange={(e) => onChange(e)}
                      />
                    );
                  }}
                />
              </div>
              <div className="hidden items-center md:flex">
                <span className="flex">
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => {
                      const { onChange, value } = field;
                      return (
                        <ReactDatePicker
                          selected={value}
                          className={classNames(
                            value ? "pr-2" : "px-2",
                            "h-10 w-full  text-center focus:border-blue-300 focus:outline-none sm:col-start-2"
                          )}
                          onChange={(date) => {
                            if (date) {
                              date.setHours(0, 0, 0, 0);
                              onChange(date);
                            }
                          }}
                          previousMonthButtonLabel=<ChevronLeftIcon />
                          nextMonthButtonLabel=<ChevronRightIcon />
                          popperClassName="react-datepicker-bottom"
                          placeholderText="From (dd/mm/yyyy)"
                          dateFormat="dd/MM/yyyy"
                        />
                      );
                    }}
                  />
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => {
                      const { onChange, value } = field;
                      return (
                        <div className="">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={classNames(
                              value ? "block" : "hidden",
                              "-ml-6 mt-2.5 h-5 w-5 rounded-full bg-white text-gray-500 transition duration-300 hover:scale-125 hover:text-gray-800 "
                            )}
                            onClick={() => {
                              onChange(undefined);
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      );
                    }}
                  />
                </span>
                <span className="mx-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                    />
                  </svg>
                </span>
                <span className="flex">
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => {
                      const { onChange, value } = field;
                      return (
                        <ReactDatePicker
                          selected={value}
                          className={classNames(
                            value ? "pr-2" : "px-2",
                            "h-10 w-full  text-center focus:border-blue-300 focus:outline-none sm:col-start-2"
                          )}
                          onChange={(date) => {
                            if (date) {
                              date.setHours(23, 59, 59, 999);
                              onChange(date);
                            }
                          }}
                          previousMonthButtonLabel=<ChevronLeftIcon />
                          nextMonthButtonLabel=<ChevronRightIcon />
                          popperClassName="react-datepicker-bottom"
                          placeholderText="To (dd/mm/yyyy)"
                          dateFormat="dd/MM/yyyy"
                        />
                      );
                    }}
                  />
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => {
                      const { onChange, value } = field;
                      return (
                        <div className="">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={classNames(
                              value ? "block" : "hidden",
                              "-ml-6 mt-2.5 h-5 w-5 rounded-full bg-white text-gray-500 transition duration-300 hover:scale-125 hover:text-gray-800 "
                            )}
                            onClick={() => {
                              onChange(undefined);
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      );
                    }}
                  />
                </span>
              </div>
              <span className="md:ml-2">
                <CreateButton projectId={projectId} />
              </span>
              <button
                type="submit"
                className="ml-2 hidden rounded-lg bg-blue-600 p-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none md:flex"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
                <span className="sr-only">Search</span>
              </button>
            </span>
            {/* Mobile UI */}
            <div className="mb-2 flex items-center justify-between md:hidden">
              <span className="flex items-center">
                <span className="flex">
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => {
                      const { onChange, value } = field;
                      return (
                        <ReactDatePicker
                          selected={value}
                          className={classNames(
                            value ? "pl-2" : "px-4 text-center",
                            "h-10 w-full max-w-[200px]  focus:border-blue-300 focus:outline-none sm:col-start-2"
                          )}
                          onChange={(date) => {
                            if (date) {
                              date.setHours(0, 0, 0, 0);
                              onChange(date);
                            }
                          }}
                          previousMonthButtonLabel=<ChevronLeftIcon />
                          nextMonthButtonLabel=<ChevronRightIcon />
                          popperClassName="react-datepicker-bottom"
                          placeholderText="From"
                          dateFormat="dd/MM/yyyy"
                        />
                      );
                    }}
                  />
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => {
                      const { onChange, value } = field;
                      return (
                        <div className="">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={classNames(
                              value ? "block" : "hidden",
                              "-ml-6 mt-2.5 h-5 w-5 rounded-full bg-white text-gray-500 transition duration-300 hover:scale-125 hover:text-gray-800 "
                            )}
                            onClick={() => {
                              onChange(undefined);
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      );
                    }}
                  />
                </span>
                <span className="mx-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                    />
                  </svg>
                </span>
                <span className="flex">
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => {
                      const { onChange, value } = field;
                      return (
                        <ReactDatePicker
                          selected={value}
                          className={classNames(
                            value ? "pl-2" : "px-4 text-center",
                            "h-10 w-full max-w-[200px]  focus:border-blue-300 focus:outline-none sm:col-start-2"
                          )}
                          onChange={(date) => {
                            if (date) {
                              date.setHours(23, 59, 59, 999);
                              onChange(date);
                            }
                          }}
                          previousMonthButtonLabel=<ChevronLeftIcon />
                          nextMonthButtonLabel=<ChevronRightIcon />
                          popperClassName="react-datepicker-bottom"
                          placeholderText="To"
                          dateFormat="dd/MM/yyyy"
                        />
                      );
                    }}
                  />
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => {
                      const { onChange, value } = field;
                      return (
                        <div className="">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={classNames(
                              value ? "block" : "hidden",
                              "-ml-6 mt-2.5 h-5 w-5 rounded-full bg-white text-gray-500 transition duration-300 hover:scale-125 hover:text-gray-800 "
                            )}
                            onClick={() => {
                              onChange(undefined);
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      );
                    }}
                  />
                </span>
              </span>
              <button
                type="submit"
                className="ml-2 flex rounded-lg bg-blue-600 p-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
                <span className="sr-only">Search</span>
              </button>
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
                className="grid grid-cols-1 gap-6  sm:grid-cols-2 lg:grid-cols-3"
              >
                {siteDiaries?.map((siteDiary) => (
                  <li
                    key={siteDiary.id}
                    className="col-span-1 divide-y divide-gray-200 rounded-lg bg-zinc-200/10 shadow hover:cursor-pointer hover:shadow-lg"
                  >
                    <span className="flex items-center justify-between">
                      <Link
                        className="flex w-full items-center justify-between space-x-6  p-6"
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
                              siteDiaryId={siteDiary.id}
                              projectId={projectId}
                              pendingDeleteCountRef={pendingDeleteCountRef}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </form>
        )}
      </PermissionToProject>
    </SessionAuth>
  );
};

export default SiteDiary;
