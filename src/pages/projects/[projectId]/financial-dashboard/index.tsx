import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useGetProject } from "../../../../hooks/project";

const DeleteButton = dynamic(
  () => import("../../../../components/project/DeleteButton")
);

const TenderInformation = dynamic(
  () => import("../../../../components/financialDashboard/TenderInformation")
);

const ProjectInformation = dynamic(
  () => import("../../../../components/financialDashboard/ProjectInformation")
);

const Table = dynamic(() => import("../../../../components/common/Table"), {
  ssr: false,
});

const Index = () => {
  const { query } = useRouter();
  const projectId = query.projectId as string;
  const { project } = useGetProject({ projectId: projectId });

  return (
    <main>
      <h1 className="m-4">
        <span className="font-semibold text-black">
          <div className="flex items-center justify-between gap-x-3">
            <h1 className="flex gap-x-3 text-base leading-7">
              <span className="text-xl text-black">{project?.name}</span>
            </h1>
            <DeleteButton projectId={projectId} navigateBack={true} />
          </div>
        </span>
      </h1>
      <TenderInformation />
      <ProjectInformation />

      <div className="m-4 rounded-xl border-t border-white/10 bg-blue-100/10 pt-11">
        <h2 className="px-4 text-base font-semibold leading-7 text-black sm:px-6 lg:px-8">
          Budget VS Actual Costs
        </h2>
        <main className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
          <Table />
        </main>
      </div>
    </main>
  );
};

export default Index;
