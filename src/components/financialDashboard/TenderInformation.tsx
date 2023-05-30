import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useGetExpectedBudgetSumAndCostsIncurredSum } from "../../hooks/budget";
import { useGetSupplierInvoices } from "../../hooks/supplierInvoice";

type tenderData = {
  id: number;
  name: string;
  icon: ReactNode;
  description: string;
};

const TenderInformation = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const { supplierInvoices: processedInvoices } = useGetSupplierInvoices({
    projectId: projectId,
  });
  const { supplierInvoices: approvedInvoices } = useGetSupplierInvoices({
    projectId: projectId,
    approved: true,
  });
  const { expectedBudgetSum, costsIncurredSum } =
    useGetExpectedBudgetSumAndCostsIncurredSum({
      projectId: projectId,
    });
  const tenderInformationItems = [
    {
      id: 1,
      name: "Total Budget",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      ),
      description: `RM ${expectedBudgetSum}`,
    },
    {
      id: 2,
      name: "Total Incurred Costs",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
        </svg>
      ),
      description: `RM ${costsIncurredSum}`,
    },
    {
      id: 3,
      name: "Processed Invoices",
      icon: (
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
            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      description: `${processedInvoices?.length || 0} ${
        processedInvoices?.length === 1 ? "Invoice" : "Invoices"
      }`,
    },
    {
      id: 4,
      name: "Approved Invoices",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      description: `${approvedInvoices?.length || 0} ${
        approvedInvoices?.length === 1 ? "Invoice" : "Invoices"
      }`,
    },
  ];
  return (
    <div className="m-4 rounded-xl bg-blue-100/10">
      <div className="flex flex-col items-start justify-between gap-x-8 gap-y-4  px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-x-3">
            <div className="flex-none rounded-full bg-green-400/10 p-1 text-green-400">
              <div className="h-2 w-2 rounded-full bg-current" />
            </div>
            <h1 className="flex gap-x-3 text-base leading-7">
              <span className="font-semibold text-black">
                Tender Information
              </span>
            </h1>
          </div>
          <p className="text-xs leading-6 text-gray-400">
            Stats and information related to you project
          </p>
        </div>
        <div className="order-first flex-none rounded-lg bg-blue-400/10 px-4 py-2 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30 hover:cursor-pointer sm:order-none">
          Update
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8   px-2 py-2 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {tenderInformationItems.map((tenderInformationItem) => (
          <CardComponent
            key={tenderInformationItem.id}
            tenderInformationItem={tenderInformationItem}
          />
        ))}
      </div>
    </div>
  );
};

const CardComponent = ({
  tenderInformationItem,
}: {
  tenderInformationItem: tenderData;
}) => {
  return (
    <span
      key={tenderInformationItem.id}
      className="overflow-hidden rounded-xl border border-gray-200"
    >
      <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
          aria-hidden="true"
        >
          <span className="text-indigo-400">{tenderInformationItem.icon}</span>
        </span>
        <div className="text-sm font-medium leading-6 text-gray-900">
          {tenderInformationItem.name}
        </div>
      </div>
      <div className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
        <div className="flex justify-between gap-x-4 py-3">
          <div className="text-gray-700">
            <span>{tenderInformationItem.description}</span>
          </div>
        </div>
      </div>
    </span>
  );
};

export default TenderInformation;
