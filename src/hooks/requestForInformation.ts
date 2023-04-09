import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { api } from "../utils/api";

export type requestForInformation = {
  id: string;
  name: string;
  date: string;
  createdBy: string | null;
};

export const useCreateRequestForInformation = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createRequestForInformation } =
    api.requestForInformation.createRequestForInformation.useMutation({
      async onMutate(values) {
        await utils.requestForInformation.getRequestForInformations.cancel();
        const previousData =
          utils.requestForInformation.getRequestForInformations.getData();
        utils.requestForInformation.getRequestForInformations.setData(
          { projectId: values.projectId },
          (oldRequestForInformations) => {
            const optimisticUpdateObject = {
              id: Date.now().toString(),
              topic: values.requestForInformationTopic,
              status: values.requestForInformationStatus || "PENDING",
              createdBy: { name: session.data?.user?.name || "You" },
            };
            if (oldRequestForInformations) {
              return [...oldRequestForInformations, optimisticUpdateObject];
            } else {
              return [optimisticUpdateObject];
            }
          }
        );
        return () =>
          utils.requestForInformation.getRequestForInformations.setData(
            { projectId: values.projectId },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      async onSettled() {
        await utils.requestForInformation.getRequestForInformations.invalidate();
      },
    });
  return {
    createRequestForInformation,
  };
};

export const useGetRequestForInformations = ({
  projectId,
}: {
  projectId: string;
}) => {
  const { data, isLoading } =
    api.requestForInformation.getRequestForInformations.useQuery({
      projectId: projectId,
    });
  return {
    requestForInformations: data,
    isLoading: isLoading,
  };
};

export const useGetRequestForInformation = ({
  requestForInformationId,
}: {
  requestForInformationId: string;
}) => {
  const { data, isLoading } =
    api.requestForInformation.getRequestForInformation.useQuery({
      requestForInformationId: requestForInformationId,
    });
  return {
    requestForInformation: data,
    isLoading: isLoading,
  };
};

export const useUpdateRequestForInformation = ({
  projectId,
}: {
  projectId: string;
}) => {
  const utils = api.useContext();
  const { mutate: updateRequestForInformation } =
    api.requestForInformation.updateRequestForInformation.useMutation({
      async onMutate({
        requestForInformationId,
        requestForInformationTopic,
        requestForInformationStatus,
      }) {
        await utils.requestForInformation.getRequestForInformations.cancel();
        const previousData =
          utils.requestForInformation.getRequestForInformations.getData();
        utils.requestForInformation.getRequestForInformations.setData(
          { projectId: projectId },
          (oldRequestForInformations) => {
            if (oldRequestForInformations) {
              const newRequestForInformations = oldRequestForInformations.map(
                (oldRequestForInformation) => {
                  return { ...oldRequestForInformation };
                }
              );
              const requestForInformationToUpdateIndex =
                newRequestForInformations?.findIndex(
                  (requestForInformation) =>
                    requestForInformation.id === requestForInformationId
                );
              const updatedRequestForInformation =
                newRequestForInformations[requestForInformationToUpdateIndex];
              if (updatedRequestForInformation) {
                updatedRequestForInformation.topic = requestForInformationTopic;
                updatedRequestForInformation.status =
                  requestForInformationStatus || "PENDING";
                newRequestForInformations[requestForInformationToUpdateIndex] =
                  updatedRequestForInformation;
              }
              return newRequestForInformations;
            } else {
              return oldRequestForInformations;
            }
          }
        );
        return () =>
          utils.requestForInformation.getRequestForInformations.setData(
            { projectId: projectId },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(
        data,
        {
          requestForInformationId,
          requestForInformationTopic,
          requestForInformationStatus,
        }
      ) {
        utils.requestForInformation.getRequestForInformations.setData(
          { projectId: projectId },
          (oldRequestForInformations) => {
            if (oldRequestForInformations) {
              const newRequestForInformations = oldRequestForInformations.map(
                (oldRequestForInformation) => {
                  return { ...oldRequestForInformation };
                }
              );
              const requestForInformationToUpdateIndex =
                newRequestForInformations?.findIndex(
                  (requestForInformation) =>
                    requestForInformation.id === requestForInformationId
                );
              const updatedRequestForInformation =
                newRequestForInformations[requestForInformationToUpdateIndex];
              if (updatedRequestForInformation) {
                updatedRequestForInformation.topic = requestForInformationTopic;
                updatedRequestForInformation.status =
                  requestForInformationStatus || "PENDING";
                newRequestForInformations[requestForInformationToUpdateIndex] =
                  updatedRequestForInformation;
              }
              return newRequestForInformations;
            } else {
              return oldRequestForInformations;
            }
          }
        );
      },
      async onSettled() {
        await utils.requestForInformation.getRequestForInformations.invalidate();
      },
    });
  return {
    updateRequestForInformation,
  };
};

export const useDeleteRequestForInformation = ({
  pendingDeleteCountRef,
  projectId,
}: {
  pendingDeleteCountRef?: MutableRefObject<number>;
  projectId: string;
}) => {
  const utils = api.useContext();

  const { mutate: deleteRequestForInformation } =
    api.requestForInformation.deleteRequestForInformation.useMutation({
      async onMutate({ requestForInformationId }) {
        if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1; // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
        await utils.requestForInformation.getRequestForInformations.cancel();
        const previousData =
          utils.requestForInformation.getRequestForInformations.getData();
        utils.requestForInformation.getRequestForInformations.setData(
          { projectId: projectId },
          (oldRequestForInformations) => {
            const newRequestForInformations = oldRequestForInformations?.filter(
              (newRequestForInformation) =>
                newRequestForInformation.id !== requestForInformationId
            );
            return newRequestForInformations;
          }
        );
        return () =>
          utils.requestForInformation.getRequestForInformations.setData(
            { projectId: projectId },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(data, { requestForInformationId }) {
        utils.requestForInformation.getRequestForInformations.setData(
          { projectId: projectId },
          (oldRequestForInformations) => {
            const newRequestForInformations = oldRequestForInformations?.filter(
              (newRequestForInformation) =>
                newRequestForInformation.id !== requestForInformationId
            );
            return newRequestForInformations;
          }
        );
      },
      async onSettled() {
        if (pendingDeleteCountRef) {
          pendingDeleteCountRef.current -= 1;
          if (pendingDeleteCountRef.current === 0) {
            await utils.requestForInformation.getRequestForInformations.invalidate();
          }
        } else {
          await utils.requestForInformation.getRequestForInformations.invalidate();
        }
      },
    });
  return {
    deleteRequestForInformation,
  };
};
