import Link from "next/link";
import type { ReactNode } from "react";

export const NavLink = ({
  href,
  children,
  target,
  ...props
}: {
  href: string;
  target?: string;
  children: ReactNode;
}) => {
  return (
    <Link
      href={href}
      target={target}
      className="inline-block rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      {...props}
    >
      {children}
    </Link>
  );
};
