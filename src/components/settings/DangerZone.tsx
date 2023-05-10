import { useRouter } from "next/router";
import { useDeleteProject } from "../../hooks/project";
import DeleteButton from "../common/DeleteButton";

const DangerZone = ({
  projectId,
  projectName = "",
}: {
  projectId: string;
  projectName: string | undefined;
}) => {
  const router = useRouter();
  const { deleteProject } = useDeleteProject({});
  return (
    <span className="m-8 flex flex-col ">
      <>
        <span className="mb-4 text-xl text-red-500">Danger zone</span>

        <div className="mt-2 grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 border-2 border-red-500 bg-red-300/10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-800">
              Delete Project
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              You can delete your project here. This action is not reversible!
              All information related to this project will be deleted
              permanently.
            </p>
          </div>

          <div className="flex items-center md:col-span-2">
            <DeleteButton
              title={`Delete Project ${projectName}`}
              subtitle="Are you sure you want to permanently delete this project?"
              onDelete={() => {
                deleteProject({ projectId: projectId });
                void router.push("/");
              }}
              hideButton={true}
              triggerLabel={
                <div className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400">
                  Delete
                </div>
              }
            />
          </div>
        </div>
      </>
    </span>
  );
};

export default DangerZone;
