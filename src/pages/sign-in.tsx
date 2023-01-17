import DiscordButton from "../components/oauth/DiscordButton";
import FacebookButton from "../components/oauth/FacebookButton";
import GoogleButton from "../components/oauth/GoogleButton";
import MicrosoftButton from "../components/oauth/MicrosoftButton";
import TwitchButton from "../components/oauth/TwitchButton";
import TwitterButton from "../components/oauth/TwitterButton";

export default function signin() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-8 py-12 sm:px-6 lg:space-y-12 lg:px-8">
      <div className="w-full space-y-4 sm:mx-auto sm:max-w-md">
        <div className="flex min-h-screen flex-col items-center justify-center space-y-8 py-12 sm:px-6 lg:space-y-12 lg:px-8">
          <div className="border-y border-gray-700 bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:border-x sm:px-10">
            <div className="flex animate-fade-in flex-col justify-center text-center">
              <span className="text-sm font-medium text-gray-300">
                Sign in with
              </span>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <TwitchButton />
                <DiscordButton />
                <TwitterButton />
                <FacebookButton />
                <GoogleButton />
                <MicrosoftButton />
              </div>
              <p className="prose prose-sm mx-auto mt-6 max-w-[18rem] text-xs text-gray-500">
                By signing in, you agree to our{" "}
                <a href="/info/terms-of-service">Terms of Service</a> and{" "}
                <a href="/info/privacy-policy">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
