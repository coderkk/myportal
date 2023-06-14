import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { useDeleteProject, useGetProject } from "../../../../hooks/project";

const DeleteButton = dynamic(
  () => import("../../../../components/common/DeleteButton")
);

const TenderInformation = dynamic(
  () => import("../../../../components/financialDashboard/TenderInformation")
);

const Table = dynamic(() => import("../../../../components/budget/Table"), {
  ssr: false,
});

const Index = () => {
  const { query } = useRouter();
  const projectId = query.projectId as string;
  const { project } = useGetProject({ projectId: projectId });

  const { deleteProject } = useDeleteProject();
  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        <main>
          <h1 className="m-4">
            <span className="font-semibold text-black">
              <div className="flex items-center justify-between gap-x-3">
                <h1 className="flex gap-x-3 text-base leading-7">
                  <span className="text-xl text-black">{project?.name}</span>
                </h1>
                <DeleteButton
                  title={`Delete Project ${project?.name || ""}`}
                  subtitle="Are you sure you want to permanently delete this project?"
                  onDelete={() => {
                    deleteProject({
                      projectId: projectId,
                    });
                  }}
                  navigateBack={true}
                />
              </div>
            </span>
          </h1>
          <TenderInformation />

          <div className="m-4 rounded-xl border-t border-white/10 bg-blue-100/10 pt-11">
            <h2 className="px-4 text-base font-semibold leading-7 text-black sm:px-6 lg:px-8">
              Budget VS Actual Costs
            </h2>
            <main className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
              <Table />
            </main>
          </div>
        </main>
      </PermissionToProject>
    </SessionAuth>
  );
};

export default Index;
