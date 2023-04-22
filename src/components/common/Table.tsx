import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useReducer } from "react";

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import classNames from "classnames";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useGetBudgets } from "../../hooks/budget";
import { api } from "../../utils/api";
import DebouncedInput from "./DebounceInput";
import Spinner from "./Spinner";

const CreateButton = dynamic(() => import("../budget/CreateButton"));

const EditButton = dynamic(() => import("../budget/EditButton"));

const DeleteButton = dynamic(() => import("../budget/DeleteButton"));

type Budget = {
  id: string;
  costCode: string;
  description: string;
  expectedBudget: number;
  costsIncurred: number;
  difference: number;
};

const initialState = {
  queryPageIndex: 0,
  queryPageSize: 5,
  search_key: "",
};

const PAGE_CHANGED = "PAGE_CHANGED";
const PAGE_SIZE_CHANGED = "PAGE_SIZE_CHANGED";
const SEARCH_KEY_CHANGED = "SEARCH_KEY_CHANGED";

type actionType = (typeof actionType)[number];
type state = {
  queryPageIndex: number;
  queryPageSize: number;
  search_key: string;
};
type action = {
  type: actionType;
  payload: number | string;
};

const actionType = [
  "PAGE_CHANGED",
  "PAGE_SIZE_CHANGED",
  "SEARCH_KEY_CHANGED",
] as const;

const reducer = (state: state, action: action): state => {
  switch (action.type) {
    case PAGE_CHANGED:
      return {
        ...state,
        queryPageIndex: action.payload as number,
      };
    case PAGE_SIZE_CHANGED:
      return {
        ...state,
        queryPageSize: action.payload as number,
      };
    case SEARCH_KEY_CHANGED:
      return {
        ...state,
        search_key: action.payload as string,
      };
    default:
      throw new Error(`Unhandled action type`);
  }
};

const Button = ({
  children,
  className,
  onClick,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  onClick: () => void;
  disabled: boolean;
}) => {
  return (
    <button
      type="button"
      className={classNames(
        "relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50",
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const PageButton = ({
  children,
  className,
  onClick,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  onClick: () => void;
  disabled: boolean;
}) => {
  return (
    <button
      type="button"
      className={classNames(
        "relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50",
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const SortUpIcon = ({ className }: { className: string }) => {
  return (
    <svg
      className={className}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"></path>
    </svg>
  );
};

const SortDownIcon = ({ className }: { className: string }) => {
  return (
    <svg
      className={className}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"></path>
    </svg>
  );
};

const Table = () => {
  const utils = api.useContext();
  const { query } = useRouter();
  const projectId = query.projectId as string;
  const [{ queryPageIndex, queryPageSize, search_key }, dispatch] = useReducer(
    reducer,
    initialState
  );
  const { budgets, count, isLoading, isFetching } = useGetBudgets({
    projectId: projectId,
    pageSize: queryPageSize,
    pageIndex: queryPageIndex,
    searchKey: search_key,
  });
  const columnHelper = createColumnHelper<Budget>();
  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.costCode, {
        id: "costCode",
        cell: (info) => <i>{info.getValue()}</i>,
        header: () => <span>Costs Code</span>,
      }),
      columnHelper.accessor((row) => row.description, {
        id: "description",
        cell: (info) => <i>{info.getValue()}</i>,
        header: () => <span>Description</span>,
      }),
      columnHelper.accessor((row) => row.expectedBudget, {
        id: "budget",
        cell: (info) => (
          <i>
            <b>RM</b> {info.getValue()}
          </i>
        ),
        header: () => <span>Budget</span>,
      }),
      columnHelper.accessor((row) => row.costsIncurred, {
        id: "costsIncurred",
        cell: (info) => (
          <i>
            <b>RM</b> {info.getValue()}
          </i>
        ),
        header: () => <span>Costs Incurred</span>,
      }),
      columnHelper.accessor((row) => row.difference, {
        id: "difference",
        cell: (info) => (
          <i>
            <b>RM</b> {info.getValue()}
          </i>
        ),
        header: () => <span>Difference</span>,
      }),
      columnHelper.accessor((row) => row, {
        id: "id",
        cell: (info) => {
          const { id, description, expectedBudget, costsIncurred } =
            info.getValue();
          return (
            <>
              <EditButton
                budgetId={id}
                projectId={projectId}
                description={description}
                expectedBudget={expectedBudget}
                costsIncurred={costsIncurred}
                pageIndex={queryPageIndex}
                pageSize={queryPageSize}
                searchKey={search_key}
              />
              <DeleteButton budgetId={id} />
            </>
          );
        },
        header: () => <span>Actions</span>,
      }),
    ],
    [columnHelper, projectId, queryPageIndex, queryPageSize, search_key]
  );
  const table = useReactTable({
    data: budgets,
    columns,
    manualPagination: true,
    state: {
      globalFilter: search_key,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    pageCount: Math.ceil(count / queryPageSize),
    onGlobalFilterChange: (value: string) => {
      dispatch({ type: SEARCH_KEY_CHANGED, payload: value });
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  // use pageIndex, pageSize to update queryPageIndex, queryPageSize
  // react-table updates pageIndex, pageSize when user event occurs
  const { pageIndex, pageSize } = table.getState().pagination;

  useEffect(() => {
    dispatch({
      type: PAGE_CHANGED,
      payload: pageIndex,
    });
  }, [dispatch, table, pageIndex]);

  useEffect(() => {
    dispatch({
      type: PAGE_SIZE_CHANGED,
      payload: pageSize,
    });
    table.setPageIndex(0);
  }, [dispatch, table, pageSize]);

  const onInputChange = useCallback(
    (value: string | number) => {
      dispatch({
        type: SEARCH_KEY_CHANGED,
        payload: String(value),
      });
      table.setPageIndex(0);
    },
    [table]
  );

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="p-2">
          <div className="flex items-center justify-between gap-x-2">
            <DebouncedInput
              value={search_key ?? ""}
              onChange={onInputChange}
              className="font-lg border-block border p-2 shadow"
              placeholder="Search all columns..."
            />
            <span>
              <CreateButton
                pageIndex={pageIndex}
                pageSize={pageSize}
                searchKey={search_key}
                projectId={projectId}
              />
            </span>
          </div>
          <div className="mt-4 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => {
                            return (
                              <th
                                key={header.id}
                                colSpan={header.colSpan}
                                scope="col"
                                className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                              >
                                {header.isPlaceholder ? null : (
                                  <div
                                    {...{
                                      className: header.column.getCanSort()
                                        ? "cursor-pointer select-none flex items-center justify-between"
                                        : "flex items-center justify-between",
                                      onClick:
                                        header.column.getToggleSortingHandler(),
                                    }}
                                  >
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                                    {{
                                      asc: (
                                        <SortUpIcon className="h-4 w-4 text-gray-400" />
                                      ),
                                      desc: (
                                        <SortDownIcon className="h-4 w-4 text-gray-400" />
                                      ),
                                    }[header.column.getIsSorted() as string] ??
                                      null}
                                  </div>
                                )}
                              </th>
                            );
                          })}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {table.getRowModel().rows.map((row) => {
                        return (
                          <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => {
                              return (
                                <td
                                  key={cell.id}
                                  className="whitespace-nowrap px-6 py-4"
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              {isFetching && <Spinner size="w-4 h-4" />}
              <Button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div className="flex items-baseline gap-x-2">
                <span className="text-sm text-gray-700">
                  Page <span className="font-medium">{pageIndex + 1}</span> of{" "}
                  <span className="font-medium">{table.getPageCount()}</span>
                </span>
                <label>
                  <span className="sr-only">Items Per Page</span>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    value={pageSize}
                    onChange={(e) => {
                      table.setPageSize(Number(e.target.value));
                    }}
                  >
                    {[5, 10, 20].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        Show {pageSize}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {isFetching && <Spinner size="w-6 h-6" />}
              <div>
                <nav
                  className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <PageButton
                    className="rounded-l-md"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">First</span>
                    <ChevronDoubleLeftIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                      onMouseEnter={() => {
                        if (!table.getCanPreviousPage()) return;
                        void utils.budget.getBudgets.prefetch(
                          {
                            projectId: projectId,
                            searchKey: search_key,
                            pageSize: pageSize,
                            pageIndex: 0,
                          },
                          {
                            staleTime: Infinity,
                          }
                        );
                      }}
                    />
                  </PageButton>
                  <PageButton
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                      onMouseEnter={() => {
                        if (!table.getCanPreviousPage()) return;
                        void utils.budget.getBudgets.prefetch(
                          {
                            projectId: projectId,
                            searchKey: search_key,
                            pageSize: pageSize,
                            pageIndex: pageIndex - 1,
                          },
                          {
                            staleTime: Infinity,
                          }
                        );
                      }}
                    />
                  </PageButton>
                  <PageButton
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                      onMouseEnter={() => {
                        if (!table.getCanNextPage()) return;
                        void utils.budget.getBudgets.prefetch(
                          {
                            projectId: projectId,
                            searchKey: search_key,
                            pageSize: pageSize,
                            pageIndex: pageIndex + 1,
                          },
                          {
                            staleTime: Infinity,
                          }
                        );
                      }}
                    />
                  </PageButton>
                  <PageButton
                    className="rounded-r-md"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Last</span>
                    <ChevronDoubleRightIcon
                      onMouseEnter={() => {
                        if (!table.getCanNextPage()) return;
                        void utils.budget.getBudgets.prefetch(
                          {
                            projectId: projectId,
                            searchKey: search_key,
                            pageSize: pageSize,
                            pageIndex: table.getPageCount() - 1,
                          },
                          {
                            staleTime: Infinity,
                          }
                        );
                      }}
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </PageButton>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Table;
