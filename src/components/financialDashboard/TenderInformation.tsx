import Image from "next/image";

const tenderInformationItems = [
  {
    id: 1,
    name: "Contract Value",
    imageUrl: "https://tailwindui.com/img/logos/48x48/tuple.svg",
    description: "RM 10 Million",
  },
  {
    id: 2,
    name: "Tender Costs",
    imageUrl: "https://tailwindui.com/img/logos/48x48/savvycal.svg",
    description: "RM 8 Million",
  },
  {
    id: 3,
    name: "Priced Margin",
    imageUrl: "https://tailwindui.com/img/logos/48x48/reform.svg",
    description: "RM 2 Million",
  },
  {
    id: 4,
    name: "Duration",
    imageUrl: "https://tailwindui.com/img/logos/48x48/reform.svg",
    description: "10 Months",
  },
];

const TenderInformation = () => {
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
            Stats and information before construction begins
          </p>
        </div>
        <div className="order-first flex-none rounded-lg bg-blue-400/10 px-4 py-2 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30 hover:cursor-pointer sm:order-none">
          Update
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8   px-2 py-2 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {tenderInformationItems.map((tenderInformationItem) => (
          <span
            key={tenderInformationItem.id}
            className="overflow-hidden rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
              <Image
                src={tenderInformationItem.imageUrl}
                alt={tenderInformationItem.name}
                className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
                width={48}
                height={48}
              />
              <div className="text-sm font-medium leading-6 text-gray-900">
                {tenderInformationItem.name}
              </div>
            </div>
            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <dd className="text-gray-700">
                  <span>{tenderInformationItem.description}</span>
                </dd>
              </div>
            </dl>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TenderInformation;
