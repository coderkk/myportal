import { useRouter } from "next/router";
import { useState } from "react";
import SessionAuth from "../../../../components/auth/SessionAuth";
import type { Invoice } from "../../../../utils/pdfparser";

import InvoiceUpload from '../../../../components/invoice/InvoiceUpload'

const InvoiceUploadPage = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;

  const [invoiceData, setInvoiceData] = useState<Invoice>({
    vendorName: "",
    supplierName: "",
    invoiceNo: "",
    invoiceDate: "",
    invoiceCosts: 0,
    description: "",
  });

  const handleData = (data: Invoice) => {
    setInvoiceData(data)
  }

  return (
    <SessionAuth>
      <div className="flex">
        <div className="m-auto">
          <section>
            <div className="max-w-screen-xl px-4 py-8 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
              <div className="mb-5 flex justify-between">
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Invoice Data Extraction
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-2  lg:gap-x-16">
                <div className="mx-auto max-w-lg text-left lg:mx-0 lg:text-left">
                  <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-base font-semibold leading-6 text-gray-900">
                        Automated Data
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Extract data from PDF file
                      </p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                      <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500">
                            Vendor name
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <input type="text" value={invoiceData.vendorName} />
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500">
                            Invoice No
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {invoiceData.invoiceNo}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500">
                            Invoice Date
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {invoiceData.invoiceDate}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500">
                            Invoice Costs
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {invoiceData.invoiceCosts}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500">
                            Invoice Description
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {invoiceData.description}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                          <dt className="text-sm font-medium text-gray-500">
                            Assign to
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            <select title="Assign to">
                              <option></option>
                            </select>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>

                <div>
                  <InvoiceUpload onData={handleData}></InvoiceUpload>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </SessionAuth>
  );
};

export default InvoiceUploadPage;
