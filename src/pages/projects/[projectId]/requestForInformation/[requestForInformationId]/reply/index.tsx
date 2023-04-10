import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type BaseSyntheticEvent } from "react";
import type { FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Send } from "styled-icons/bootstrap";
import SessionAuth from "../../../../../../components/auth/SessionAuth";
import { useCreateReply, useGetReplies } from "../../../../../../hooks/reply";
import { useGetRequestForInformation } from "../../../../../../hooks/requestForInformation";

const Replies = () => {
  const router = useRouter();
  const session = useSession();
  const requestForInformationId = router.query
    .requestForInformationId as string;
  const { replies, isLoading } = useGetReplies({
    requestForInformationId: requestForInformationId,
  });

  const { requestForInformation } = useGetRequestForInformation({
    requestForInformationId: requestForInformationId,
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { createReply } = useCreateReply();

  const onSubmit = (
    data: FieldValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    reset();
    createReply({
      requestForInformationId: requestForInformationId,
      description: data.description as string,
    });
  };

  return (
    <SessionAuth>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex h-[80vh]">
          <div className="m-auto w-[80%]">
            <div className="flex justify-center">
              <div className="text-lg font-medium ">
                Replies for {requestForInformation?.topic}
              </div>
            </div>
            <div className="m-auto min-h-[40em] max-w-[40em] overflow-auto border-4 border-blue-500">
              {replies?.map((reply) => (
                <div key={reply.id} className="mx-2 mb-4 mt-2">
                  <div
                    className={`flex ${
                      reply.repliedById == session?.data?.user?.id
                        ? "flex-row-reverse"
                        : ""
                    }  items-center justify-start`}
                  >
                    <div className="">
                      <div className="relative  min-w-fit rounded-xl bg-indigo-100 py-2 px-4 text-sm shadow">
                        <div>{reply.description}</div>
                      </div>
                      <div className="mt-2 flex flex-row-reverse text-xs text-gray-500">
                        {reply.repliedBy}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
              <div className="mt-4 flex w-full items-center justify-center">
                <fieldset className="flex items-center">
                  <label
                    className="mr-4 w-24 text-right text-sm text-blue-300"
                    htmlFor="description"
                  >
                    Reply
                  </label>
                  <div>
                    <input
                      className={`inline-flex h-8 w-full flex-1 items-center justify-center rounded-md py-0 px-3 text-sm text-blue-500 shadow-sm shadow-blue-200 focus:border-2
                focus:border-blue-300 focus:outline-none ${
                  errors.description
                    ? "border-2 border-red-400 focus:border-2 focus:border-red-400"
                    : ""
                }`}
                      id="description"
                      defaultValue=""
                      {...register("description", {
                        required: true,
                      })}
                    />
                  </div>
                </fieldset>
                <button
                  className="ml-4 inline-flex h-9 items-center justify-center rounded-md bg-blue-100 py-0 px-4 text-sm font-medium text-blue-700 hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-200"
                  type="submit"
                  aria-label="send"
                  disabled={
                    !!(
                      errors.supplierEmailAddress ||
                      errors.orderNumber ||
                      errors.note ||
                      errors.arrivalOnSite
                    )
                  }
                >
                  <Send className="h-6 w-6 " />
                </button>
              </div>
              {errors.description && (
                <span className="flex justify-center text-xs italic text-red-400">
                  Reply cannot be empty
                </span>
              )}
              <div className="mt-6 flex justify-end"></div>
            </form>
          </div>
        </div>
      )}
    </SessionAuth>
  );
};

export default Replies;
