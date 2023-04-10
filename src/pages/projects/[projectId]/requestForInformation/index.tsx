import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef } from "react";
import { CommentDots } from "styled-icons/boxicons-regular";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { useGetRequestForInformations } from "../../../../hooks/requestForInformation";

const CreateButton = dynamic(
  () => import("../../../../components/requestForInformation/CreateButton")
);

const DeleteButton = dynamic(
  () => import("../../../../components/requestForInformation/DeleteButton")
);

const EditButton = dynamic(
  () => import("../../../../components/requestForInformation/EditButton")
);

const RequestForInformation = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const { requestForInformations, isLoading } = useGetRequestForInformations({
    projectId: projectId,
  });
  const pendingDeleteCountRef = useRef(0); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache

  return (
    <SessionAuth>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex h-[80vh]">
          <div className="m-auto">
            <div className="flex justify-between">
              <div className="text-lg font-medium">Request For Information</div>
              <CreateButton projectId={projectId} />
            </div>
            {requestForInformations?.map((requestForInformation) => (
              <div key={requestForInformation.id} className="flex">
                <span className="w-full bg-blue-500 text-white hover:bg-blue-200 hover:text-blue-500">
                  <div>
                    <span className="mr-4">
                      {requestForInformation.createdBy.name}
                    </span>
                    <span className="mr-4">{requestForInformation.topic}</span>
                    <span className="mr-4">{requestForInformation.status}</span>
                  </div>
                </span>
                <EditButton
                  requestForInformation={requestForInformation}
                  projectId={projectId}
                />
                <DeleteButton
                  requestForInformationId={requestForInformation.id}
                  projectId={projectId}
                  pendingDeleteCountRef={pendingDeleteCountRef}
                />
                <Link
                  target="_blank"
                  href={`/projects/${projectId}/requestForInformation/${requestForInformation.id}/reply`}
                >
                  <CommentDots className="h-6 w-6  text-blue-500" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </SessionAuth>
  );
};

export default RequestForInformation;
