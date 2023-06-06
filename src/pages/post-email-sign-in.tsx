import Image from "next/image";

export default function Example() {
  return (
    <main className="h-full w-full">
      <Image
        src="https://images.unsplash.com/photo-1545972154-9bb223aac798?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3050&q=80&exp=8&con=-15&sat=-75"
        alt="Background Image"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-top"
        width={1920}
        height={1280}
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
