import { useRouter } from "next/router";
import { useRef } from "react";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { useIsCreatorOfProject } from "../../../../hooks/me";
import { useGetUsersForProject } from "../../../../hooks/user";

// const InviteButton = dynamic(
//   () => import("../../../../components/task/CreateButton")
// );

// const UninviteButton = dynamic(
//   () => import("../../../../components/task/DeleteButton")
// );

const Team = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const { users, isLoading, isError } = useGetUsersForProject({
    projectId: projectId,
  });
  const { isCreator } = useIsCreatorOfProject({
    projectId: projectId,
  });
  const pendingDeleteCountRef = useRef(0); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache

  return (
    <SessionAuth>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error!</div>
      ) : (
        <div className="flex h-screen">
          <div className="m-auto">
            <div className="flex justify-between">
              <div className="text-lg font-medium">Team</div>
              {/* {isCreator && <InviteButton projectId={projectId} />} */}
            </div>
            {users?.map((user) => (
              <div key={user.id} className="flex">
                <span className="w-full bg-blue-500 text-white hover:bg-blue-200 hover:text-blue-500">
                  <div>
                    <span className="mr-4">{user.name}</span>
                    <span className="mr-4">{user.email}</span>
                  </div>
                </span>
                {/* {isCreator && (
                  <UninviteButton
                    userId={user.id}
                    projectId={projectId}
                    pendingDeleteCountRef={pendingDeleteCountRef}
                  />
                )} */}
              </div>
            ))}
          </div>
        </div>
      )}
    </SessionAuth>
  );
};

export default Team;
