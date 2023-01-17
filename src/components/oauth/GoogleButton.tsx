import { Google } from "@styled-icons/bootstrap/Google";
import { signIn } from "next-auth/react";

const GoogleButton = () => {
  return (
    <button
      className="relative inline-flex items-center justify-center rounded-md border border-gray-700 bg-gray-800 px-6 py-3 text-lg font-medium text-white shadow-sm hover:bg-gray-700 hover:text-gray-100"
      type="button"
      onClick={() => void signIn("google", { callbackUrl: "/projects" })}
    >
      <span className="flex items-center">
        <span className="sr-only">Sign in with</span>
        <Google className="mr-2 h-6 w-6" />
        <span>Google</span>
      </span>
    </button>
  );
};

export default GoogleButton;
