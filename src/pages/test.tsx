import type { BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import Spinner from "../components/common/Spinner";
import { api } from "../utils/api";

type FormValues = {
  inputText: string;
};

const GPT = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const {
    data,
    isLoading,
    mutate: extractInvoiceInfo,
  } = api.gpt.extractInvoiceInfo.useMutation();

  const onSubmit = (
    data: FormValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    reset();
    extractInvoiceInfo({ inputText: data.inputText });
  };

  return (
    <div className="w-full">
      <div className="mx-auto mt-40 flex w-2/3 flex-col items-center justify-center text-center">
        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          className="my-12"
        >
          <p className="mb-6 font-bold">Please type your prompt</p>
          <input
            placeholder="Type here"
            className="input input-bordered input-secondary w-full max-w-xs"
            {...register("inputText", {
              required: true,
            })}
          />
          <button
            className="mt-12 inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-50 disabled:text-blue-200 sm:col-start-2"
            type="submit"
            disabled={!!errors.inputText}
          >
            Submit
          </button>
        </form>
        <div className="textarea">
          Output: {isLoading ? <Spinner /> : JSON.stringify(data || "")}
        </div>
      </div>
    </div>
  );
};

export default GPT;
