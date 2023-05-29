import { useRouter } from "next/router";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { useGetSupplierInvoices } from "../../../../hooks/supplierInvoice";

const Invoices = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const { supplierInvoices, isLoading } = useGetSupplierInvoices({
    projectId: projectId,
  });

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        {isLoading ? (
          <div>Loading...</div>
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
                  <button
                    type="button"
                    onClick={() => {
                      void router.push(
                        "/projects/" + projectId + "/invoice/add"
                      );
                    }}
                    className="mx-2 block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Add Supplier Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void router.push(
                        "/projects/" + projectId + "/invoice/import"
                      );
                    }}
                    className="mx-2 block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Import Supplier Invoice
                  </button>
                </div>
              </div>
              <div className="mt-8 flow-root">
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
                              Total Amount
                            </th>
                            <th
                              scope="col"
                              className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                            >
                              <span className="sr-only">Edit</span>
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
                                {supplierInvoice.invoiceDate.toString()}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {supplierInvoice.totalAmount}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
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
                                  className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                  Edit
                                </button>
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
