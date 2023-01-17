import { Twitch } from "@styled-icons/bootstrap/Twitch";

const TwitchButton = () => {
  return (
    <button
      className="relative inline-flex items-center justify-center rounded-md border border-gray-700 bg-gray-800 px-6 py-3 text-lg font-medium text-white shadow-sm hover:bg-gray-700 hover:text-gray-100"
      type="button"
    >
      <span className="flex items-center">
        <span className="sr-only">Sign in with</span>
        <Twitch className="mr-2 h-6 w-6" />
        <span>Twitch</span>
      </span>
    </button>
  );
};

export default TwitchButton;
