import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import SearchAndAdd from "../../../../components/team/SearchAndAdd";
import { useIsCreatorOfProject } from "../../../../hooks/me";
import { useRemoveFromProject } from "../../../../hooks/project";
import { useGetUsers, useGetUsersForProject } from "../../../../hooks/user";

const DeleteButton = dynamic(
  () => import("../../../../components/common/DeleteButton")
);

const Team = () => {
  const router = useRouter();
  const session = useSession();
  const projectId = router.query.projectId as string;
  const { usersForProject } = useGetUsersForProject({
    projectId: projectId,
  });
  const { users, isLoading } = useGetUsers();
  const { isCreator } = useIsCreatorOfProject({
    projectId: projectId,
  });
  const pendingRemoveCountRef = useRef(0);

  const usersForProjectIds = usersForProject?.map((userForProject) => {
    return userForProject.id;
  });
  const formattedUsers = users
    ?.filter((user) => {
      if (!(user.name && user.email)) return false;
      return true;
    })
    .map((user) => {
      const userAlreadyInTeam = usersForProjectIds?.find(
        (usersForProjectId) => usersForProjectId === user.id
      );
      return {
        value: user.id,
        userName: user.name || "", // ' || "" ' only here for TS, the actual filtering is done by "filter"
        userEmail: user.email || "",
        label: `${user.name || ""} (${user.email || ""}) ${
          userAlreadyInTeam ? "ADDED" : ""
        }`,
        disabled: userAlreadyInTeam ? true : false,
      };
    });

  const { removeFromProject } = useRemoveFromProject({
    pendingRemoveCountRef: pendingRemoveCountRef,
  });
  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="flex h-[80vh]">
            <div className="m-auto">
              <div className="flex justify-between">
                <div className="text-lg font-medium">Team</div>
              </div>
              {usersForProject?.map((userForProject) => (
                <div key={userForProject.id} className="flex">
                  <span className="w-full bg-blue-500 text-white hover:bg-blue-200 hover:text-blue-500">
                    <div>
                      <span className="mr-4">{userForProject.name}</span>
                      <span className="mr-4">{userForProject.email}</span>
                    </div>
                  </span>
                  {isCreator &&
                    session.data?.user?.id !== userForProject.id && (
                      <DeleteButton
                        onDelete={() =>
                          removeFromProject({
                            projectId: projectId,
                            userToBeRemovedId: userForProject.id,
                          })
                        }
                      />
                    )}
                </div>
              ))}
              <div className="mt-4 flex max-w-md justify-between">
                {isCreator && (
                  <SearchAndAdd
                    projectId={projectId}
                    formattedUsers={formattedUsers || []}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </PermissionToProject>
    </SessionAuth>
  );
};

export default Team;
