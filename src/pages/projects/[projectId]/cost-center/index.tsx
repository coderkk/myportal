import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef} from "react";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { useGetCostCenters } from "../../../../hooks/costCenter";

const CreateButton = dynamic(
  () => import("../../../../components/costCenter/CreateButton")
);

const EditButton = dynamic(
  () => import("../../../../components/costCenter/EditButton")
);

const DeleteButton = dynamic(
  () => import("../../../../components/costCenter/DeleteButton")
);

const SiteDiary = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const { costCenters, isLoading } = useGetCostCenters({
    projectId: projectId
  });
  const pendingDeleteCountRef = useRef(0); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="flex h-[80vh]">
            <div className="m-auto">
              <div className="flex justify-between">
                <div className="text-lg font-medium">Cost Center</div>
                <CreateButton projectId={projectId} />
              </div>
              {costCenters?.map((costCenter) => (
                <div key={costCenter.id} className="flex">
                  <span className="w-full bg-blue-500 text-white hover:bg-blue-200 hover:text-blue-500">
                    <div>
                      <span className="mr-4">{costCenter.createdBy.name}</span>
                      <span className="mr-4">{costCenter.code}</span>
                      <span className="mr-4">{costCenter.name}</span>
                      <span className="mr-4">{costCenter.budget}</span>
                    </div>
                  </span>
                  <EditButton costCenter={costCenter} projectId={projectId} />
                  <DeleteButton
                    costCenterId={costCenter.id}
                    projectId={projectId}
                    pendingDeleteCountRef={pendingDeleteCountRef}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </PermissionToProject>
    </SessionAuth>
  );
};

export default SiteDiary;
