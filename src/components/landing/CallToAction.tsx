import Image from "next/image";

import { Button } from "../common/Button";
import { Container } from "../common/Container";

export const CallToAction = () => {
  return (
    <section
      id="get-started-today"
      className="relative overflow-hidden bg-blue-600 py-32"
    >
      <Image
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        src={"/images/background-call-to-action.jpg"}
        alt=""
        width={2347}
        height={1244}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            Get started today
          </h2>
          <p className="mt-4 text-lg tracking-tight text-white">
            It’s time to take control. Transform your project management
            approach and boost productivity with our software.
          </p>
          <Button href="sign-in" color="white" className="mt-10">
            Try for free
          </Button>
        </div>
      </Container>
    </section>
  );
};
