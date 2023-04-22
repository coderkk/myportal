import { Mailbox } from "@styled-icons/bootstrap/Mailbox";
import { signIn } from "next-auth/react";
import React, { useState } from "react";

const EmailButton = () => {
  const [emailValue, setEmailValue] = useState<string>("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setEmailValue(event.target.value);
  return (
    <>
      <div>
        <div className="relative mb-6" data-te-input-wrapper-init>
          <input
            type="text"
            className="peer h-full w-full rounded-[7px] border border-white border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-white outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-white placeholder-shown:border-t-white focus:border-2 focus:border-blue-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-white"
            id="email"
            value={emailValue}
            onChange={handleChange}
            placeholder="Email address"
          />
          <label
            htmlFor="email"
            className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-white transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-white before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-white after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-white peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-blue-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-blue-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-white"
          >
            Email address
          </label>
        </div>
        <button
          type="button"
          className="relative inline-flex items-center justify-center rounded-md border border-gray-700 bg-gray-800 px-6 py-3 text-lg font-medium text-white shadow-sm hover:bg-gray-700 hover:text-gray-100"
          data-te-ripple-init
          onClick={() =>
            void signIn("email", {
              email: emailValue,
              callbackUrl: "/projects",
            })
          }
          data-te-ripple-color="light"
        >
          <span className="flex items-center">
            <span className="sr-only">Sign in with</span>
            <Mailbox className="mr-2 h-6 w-6" />
            <span> Sign in with email</span>
          </span>
        </button>
      </div>
    </>
  );
};

export default EmailButton;
