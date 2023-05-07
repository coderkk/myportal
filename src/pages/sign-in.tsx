import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DiscordButton from "../components/oauth/DiscordButton";
import EmailButton from "../components/oauth/EmailButton";
import FacebookButton from "../components/oauth/FacebookButton";
import GoogleButton from "../components/oauth/GoogleButton";
import MicrosoftButton from "../components/oauth/MicrosoftButton";
import TwitchButton from "../components/oauth/TwitchButton";
import TwitterButton from "../components/oauth/TwitterButton";

export default function Signin() {
  const router = useRouter();
  const session = useSession();
  const [callbackUrl, setCallbackUrl] = useState("/projects");
  useEffect(() => {
    if (router.query.error && router.query.error === "SessionRequired") {
      toast.error("Please sign in to continue");
    }
    if (
      router.query.callbackUrl &&
      typeof router.query.callbackUrl === "string"
    ) {
      setCallbackUrl(router.query.callbackUrl);
    }
    if (session.status === "authenticated") {
      void router.push("/projects");
    }
  }, [router, session.status]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-8 bg-[url('/images/background-auth.jpg')] bg-cover py-12 sm:px-6 lg:space-y-12 lg:px-8">
      <div className="w-full space-y-4 sm:mx-auto sm:max-w-md">
        <div className="flex min-h-screen flex-col items-center justify-center space-y-8 py-12 sm:px-6 lg:space-y-12 lg:px-8">
          <div className="border-y border-gray-700 bg-gray-800 px-4 py-8 shadow sm:rounded-lg sm:border-x sm:px-10">
            <div className="flex animate-fade-in flex-col justify-center text-center">
              <span className="text-sm font-medium text-gray-300">
                Sign in with
              </span>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <TwitchButton callbackUrl={callbackUrl} />
                <DiscordButton callbackUrl={callbackUrl} />
                <TwitterButton callbackUrl={callbackUrl} />
                <FacebookButton callbackUrl={callbackUrl} />
                <GoogleButton callbackUrl={callbackUrl} />
                <MicrosoftButton callbackUrl={callbackUrl} />
              </div>

              <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
                <p className="mx-4 mb-0 text-center font-semibold dark:text-white">
                  Or
                </p>
              </div>

              <EmailButton callbackUrl={callbackUrl} />

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
