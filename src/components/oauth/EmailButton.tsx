import { zodResolver } from "@hookform/resolvers/zod";
import { Mailbox } from "@styled-icons/bootstrap/Mailbox";
import { signIn } from "next-auth/react";
import type { BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { OAuthSchema } from "../../schema/oauth";
type FormValues = z.infer<typeof OAuthSchema>;

const EmailButton = ({ callbackUrl }: { callbackUrl: string }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(OAuthSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (
    data: FormValues,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    reset();
    void signIn("email", {
      email: data.email,
      callbackUrl: callbackUrl,
    });
  };
  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
      <div className="relative mb-2">
        <input
          type="text"
          className="peer h-full w-full rounded-[7px] border border-white border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-white placeholder-gray-500 placeholder-opacity-0 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-white placeholder-shown:border-t-white focus:border-2 focus:border-blue-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-white"
          id="email"
          placeholder="Email address"
          {...register("email", {
            required: true,
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Entered value does not match email format",
            },
          })}
        />
        <label
          htmlFor="email"
          className="before:content[' '] after:content[' '] pointer-events-none absolute -top-1.5 left-0 flex h-full w-full select-none text-[11px] font-normal leading-tight text-white transition-all before:pointer-events-none before:mr-1 before:mt-[6.5px] before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-l before:border-t before:border-white before:transition-all after:pointer-events-none after:ml-1 after:mt-[6.5px] after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-r after:border-t after:border-white after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-white peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:before:border-l-2 peer-focus:before:border-t-2 peer-focus:before:border-blue-500 peer-focus:after:border-r-2 peer-focus:after:border-t-2 peer-focus:after:border-blue-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-white"
        >
          Email address
        </label>
      </div>
      {errors.email && (
        <span className="flex justify-center text-xs italic text-red-400">
          {errors.email.message}
        </span>
      )}
      <button
        type="submit"
        className="relative mt-2 inline-flex items-center justify-center rounded-md border border-gray-700 bg-gray-800 px-6 py-3 text-lg font-medium text-white shadow-sm hover:bg-gray-700 hover:text-gray-100"
        data-te-ripple-init
        data-te-ripple-color="light"
        disabled={!!errors.email}
      >
        <span className="flex items-center">
          <span className="sr-only">Sign in with</span>
          <Mailbox className="mr-2 h-6 w-6" />
          <span> Sign in with email</span>
        </span>
      </button>
    </form>
  );
};

export default EmailButton;
