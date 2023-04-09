import { FacebookCircle } from "@styled-icons/boxicons-logos";
import { signIn } from "next-auth/react";

const FacebookButton = () => {
  return (
    <button
      className="relative inline-flex items-center justify-center rounded-md border border-gray-700 bg-gray-800 px-6 py-3 text-lg font-medium text-white shadow-sm hover:bg-gray-700 hover:text-gray-100"
      type="button"
      onClick={() => void signIn("facebook", { callbackUrl: "/" })}
    >
      <span className="flex items-center">
        <span className="sr-only">Sign in with</span>
        <FacebookCircle className="mr-2 h-8 w-8" />
        <span>Facebook</span>
      </span>
    </button>
  );
};

export default FacebookButton;
