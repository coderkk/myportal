import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import defaultPhoto from "../../../../../public/images/default-photo.jpg";
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
  // const isCreator = false;
  const { isCreator } = useIsCreatorOfProject({
    projectId: projectId,
  });

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
        userImage: user.image || "",
        label: `${user.name || ""} (${user.email || ""}) ${
          userAlreadyInTeam ? "ADDED" : ""
        }`,
        disabled: userAlreadyInTeam ? true : false,
      };
    });

  const { removeFromProject } = useRemoveFromProject();
  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="mx-auto max-w-md p-4 sm:max-w-3xl">
            <div>
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <h2 className="mb-1 mt-2 text-base font-semibold capitalize leading-6 text-gray-900">
                  {isCreator && "Add"} team members
                </h2>
                {isCreator &&
                  usersForProject &&
                  usersForProject?.length <= 1 && (
                    <p className="text-sm text-gray-500">
                      You haven’t added any team members to your project yet.
                    </p>
                  )}
              </div>
              {isCreator && (
                <SearchAndAdd
                  projectId={projectId}
                  formattedUsers={formattedUsers || []}
                />
              )}
            </div>
            <div className="mt-10">
              <h3 className="text-sm font-medium capitalize text-gray-900">
                Team members
              </h3>
              <ul
                role="list"
                className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                {usersForProject?.map((userForProject) => (
                  <li key={userForProject.id}>
                    <button
                      type="button"
                      className="group flex w-full items-center justify-between space-x-3 rounded-full border border-gray-300 p-2 text-left shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span className="flex min-w-0 flex-1 items-center space-x-3">
                        <span className="block flex-shrink-0">
                          <Image
                            className="h-10 w-10 rounded-full"
                            src={userForProject?.image || defaultPhoto}
                            width={50}
                            height={50}
                            alt=""
                          />
                        </span>
                        <span className="block min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900">
                            {userForProject.name}
                          </span>
                          <span className="block truncate text-sm font-medium text-gray-500">
                            {userForProject.email}
                          </span>
                        </span>
                      </span>
                      {isCreator &&
                        session.data?.user?.id !== userForProject.id && (
                          <DeleteButton
                            title={`Remove ${
                              userForProject.name || ""
                            } from Team`}
                            subtitle="Are you sure you want to remove this team member from the project?"
                            deleteLabel="Remove"
                            onDelete={() =>
                              removeFromProject({
                                projectId: projectId,
                                userToBeRemovedId: userForProject.id,
                              })
                            }
                          />
                        )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </PermissionToProject>
    </SessionAuth>
  );
};

export default Team;
