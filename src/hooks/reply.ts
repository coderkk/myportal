import { useSession } from "next-auth/react";
import { api } from "../utils/api";

export const useGetReplies = ({
  requestForInformationId,
}: {
  requestForInformationId: string;
}) => {
  const { data, isLoading } = api.reply.getReplies.useQuery({
    requestForInformationId: requestForInformationId,
  });
  return {
    replies: data,
    isLoading: isLoading,
  };
};

export const useCreateReply = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createReply } = api.reply.createReply.useMutation({
    async onMutate({ requestForInformationId, description }) {
      await utils.reply.getReplies.cancel();
      const previousData = utils.reply.getReplies.getData();
      utils.reply.getReplies.setData(
        { requestForInformationId: requestForInformationId },
        (oldReplies) => {
          const optimisticUpdateObject = {
            id: Date.now().toString(),
            description: description,
            repliedBy: session.data?.user?.name || "You",
            repliedById: session.data?.user?.id || Date.now().toString(),
          };
          if (oldReplies) {
            return [...oldReplies, optimisticUpdateObject];
          } else {
            return oldReplies;
          }
        }
      );
      return () =>
        utils.reply.getReplies.setData(
          { requestForInformationId: requestForInformationId },
          previousData
        );
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    async onSettled() {
      await utils.reply.getReplies.invalidate();
    },
  });
  return {
    createReply,
  };
};
