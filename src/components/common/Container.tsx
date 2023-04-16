import clsx from "clsx";
import type { ReactNode } from "react";

export const Container = ({
  className = "",
  children,
  ...props
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={clsx("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
};
