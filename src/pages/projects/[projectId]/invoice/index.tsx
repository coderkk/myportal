import { format } from "date-fns";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";
import { Edit } from "styled-icons/boxicons-solid";
import {
  activeDateFiltersAtom,
  activeSearchFiltersAtom,
} from "../../../../atoms/supplierInvoiceAtoms";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import Spinner from "../../../../components/common/Spinner";
import CsvExport from "../../../../components/invoice/CsvExport";
import { getDateFromActiveFilter } from "../../../../components/invoice/DateFilter";
import FilterBar from "../../../../components/invoice/FilterBar";
import {
  useDeleteSupplierInvoice,
  useGetSupplierInvoices,
} from "../../../../hooks/supplierInvoice";

const DeleteButton = dynamic(
  () => import("../../../../components/common/DeleteButton")
);

const Invoices = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const [activeSearchFilters] = useAtom(activeSearchFiltersAtom);
  const [activeDateFilters] = useAtom(activeDateFiltersAtom);

  const { supplierInvoices, isLoading } = useGetSupplierInvoices({
    projectId: projectId,
    budgetId: activeSearchFilters.map(
      (activeSearchFilter) => activeSearchFilter.value
    )[0],
    startDate: getDateFromActiveFilter(true, activeDateFilters),
    endDate: getDateFromActiveFilter(false, activeDateFilters),
  });

  const pendingDeleteCountRef = useRef(0); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
  const { deleteSupplierInvoice } = useDeleteSupplierInvoice({
    pendingDeleteCountRef: pendingDeleteCountRef,
    projectId: projectId,
  });

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        {isLoading ? (
          <div className="flex h-screen">
            <div className="m-auto">
              <div className="flex justify-between">
                <Spinner />
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-5">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-base font-semibold leading-6 text-gray-900">
                    Supplier Invoice
                  </h1>
                  <p className="mt-2 text-sm text-gray-700">
                    User will upload and enter the supplier invoice
                  </p>
                </div>
                <div className="mt-4 inline sm:ml-16 sm:mt-0 sm:flex">
                  <CsvExport projectId={projectId} />
                  <button
                    type="button"
                    onClick={() => {
                      void router.push(
                        "/projects/" + projectId + "/invoice/add"
                      );
                    }}
                    className="mx-2 block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Add Supplier Invoice
                  </button>
                </div>
              </div>
              <div className="mt-3 flow-root">
                <div className="mb-3">
                  <FilterBar />
                </div>
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                            >
                              Supplier Name
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Invoice No
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Invoice Date
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Cost Code
                            </th>

                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Total Amount
                            </th>
                            <th
                              scope="col"
                              className="py-3.5 pl-3 pr-4 sm:pr-6"
                            >
                              Actions
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {supplierInvoices?.map((supplierInvoice) => (
                            <tr key={supplierInvoice.id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {supplierInvoice.supplierName}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {supplierInvoice.invoiceNo}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {format(
                                  supplierInvoice.invoiceDate,
                                  "dd MMM Y"
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {supplierInvoice.budgetId}
                              </td>
                              <td className="flex gap-2 whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {supplierInvoice.paid ? (
                                  <div className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    Paid
                                  </div>
                                ) : (
                                  <div className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-red-600/20">
                                    Unpaid
                                  </div>
                                )}
                                {supplierInvoice.approved ? (
                                  <div className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    Approved
                                  </div>
                                ) : (
                                  <div className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-blue-600/20">
                                    Unapproved
                                  </div>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {supplierInvoice.grandTotal}
                              </td>
                              <td className="flex justify-center whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-6">
                                <button
                                  type="button"
                                  onClick={() => {
                                    void router.push(
                                      "/projects/" +
                                        projectId +
                                        "/invoice/" +
                                        supplierInvoice.id
                                    );
                                  }}
                                  className="mr-5"
                                >
                                  <Edit className="h-6 w-6  text-green-500" />
                                </button>
                                <DeleteButton
                                  title={`Delete Supplier Invoice ${supplierInvoice.invoiceNo}`}
                                  subtitle="Are you sure you want to permanently delete this supplier invoice?"
                                  onDelete={() => {
                                    deleteSupplierInvoice({
                                      supplierInvoiceId: supplierInvoice.id,
                                    });
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </PermissionToProject>
    </SessionAuth>
  );
};

export default Invoices;
