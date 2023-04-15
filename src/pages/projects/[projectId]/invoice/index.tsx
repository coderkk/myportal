import { useRouter } from "next/router";
import { useRef, useState } from "react";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const Invoice = () => {
  // const router = useRouter();
  // const projectId = router.query.projectId as string;
  // const pendingDeleteCountRef = useRef(0); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache

  const [file, setFile] = useState<string>('/docs/invoice.pdf');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <SessionAuth>
        <div className="flex">
            <div className="m-auto">
                <section>
                    <div className="max-w-screen-xl px-4 py-8 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
                        <div
                            className="grid grid-cols-1 gap-y-8 lg:grid-cols-2  lg:gap-x-16"
                        >
                            <div className="mx-auto max-w-lg text-left lg:mx-0 lg:text-left">
                                <h2 className="text-3xl font-bold sm:text-4xl">Invoice Data Extraction</h2>

                                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                                    <div className="px-4 py-5 sm:px-6">
                                        <h3 className="text-base font-semibold leading-6 text-gray-900">Automated Data</h3>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Extract data from PDF file</p>
                                    </div>
                                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                                        <dl className="sm:divide-y sm:divide-gray-200">
                                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                                                <dt className="text-sm font-medium text-gray-500">Vendor name</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">Margot Foster</dd>
                                            </div>
                                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                                                <dt className="text-sm font-medium text-gray-500">Invoice No</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">Backend Developer</dd>
                                            </div>
                                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                                                <dt className="text-sm font-medium text-gray-500">Invoice Date</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">margotfoster@example.com</dd>
                                            </div>
                                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                                                <dt className="text-sm font-medium text-gray-500">Invoice Costs</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">$120,000</dd>
                                            </div>
                                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                                                <dt className="text-sm font-medium text-gray-500">Invoice Description</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu.</dd>
                                            </div>
                                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                                                <dt className="text-sm font-medium text-gray-500">Assign to</dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                    <select>
                                                        <option></option>
                                                    </select>
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                            </div>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                                    <Page pageNumber={pageNumber} renderTextLayer={false} />
                                </Document>
                                <p>
                                    Page {pageNumber} of {numPages}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </SessionAuth>
  );
};

export default Invoice;
