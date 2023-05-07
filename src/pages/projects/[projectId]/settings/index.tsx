import { useRouter } from "next/router";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import DangerZone from "../../../../components/settings/DangerZone";
import GeneralInformation from "../../../../components/settings/GeneralInformation";
import { useIsCreatorOfProject } from "../../../../hooks/me";
import { useGetProject } from "../../../../hooks/project";

const Settings = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const { project } = useGetProject({ projectId: projectId });
  const { isCreator } = useIsCreatorOfProject({
    projectId: projectId,
  });
  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        <div className="divide-y divide-white/5">
          {project && (
            <GeneralInformation
              project={project}
              isCreator={isCreator || false}
            />
          )}
          {isCreator && <DangerZone projectId={projectId} />}
        </div>
      </PermissionToProject>
    </SessionAuth>
  );
};

export default Settings;
