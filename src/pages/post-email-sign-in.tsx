import Image from "next/image";
import postEmailSignIn from "../../public/images/post-email-sign-in.avif";

export default function Example() {
  return (
    <main className="h-full w-full">
      <Image
        src={postEmailSignIn}
        alt="Background Image"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="mx-auto max-w-7xl px-6 py-32 text-center sm:py-40 lg:px-8">
        <p className="text-base font-semibold leading-8 text-white">Welcome!</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          You&apos;re almost there
        </h1>
        <p className="mt-4 text-base text-white/70 sm:mt-6">
          Check your email for a link to sign in. It might take a few minutes to
          arrive.
        </p>
      </div>
    </main>
  );
}
