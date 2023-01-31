import { useRef, type ReactNode, type RefObject } from "react";
import { useDialog } from "react-aria";

export function Dialog({ children, ...props }: { children: ReactNode }) {
  const ref: RefObject<HTMLDivElement> = useRef(null);
  const { dialogProps } = useDialog(props, ref);

  return (
    <div {...dialogProps} ref={ref}>
      {children}
    </div>
  );
}
