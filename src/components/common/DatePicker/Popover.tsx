import type { AriaPopoverProps } from "@react-aria/overlays";
import { DismissButton, Overlay, usePopover } from "@react-aria/overlays";
import type { ReactNode, RefObject } from "react";
import { useRef } from "react";
import type { DatePickerState } from "react-stately";

type _PopoverProps = {
  state: DatePickerState;
  children: ReactNode;
  placement: string;
  triggerRef: RefObject<Element>;
} & AriaPopoverProps;

type PopoverProps = Omit<_PopoverProps, "popoverRef">;

const Popover = (props: PopoverProps) => {
  const ref = useRef(null);
  const { state, children } = props;

  const { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      popoverRef: ref,
    },
    state
  );

  return (
    <Overlay>
      <div {...underlayProps} className="fixed inset-0" />
      <div
        {...popoverProps}
        ref={ref}
        className="z-100 absolute top-full z-10 mt-2 rounded-md border border-gray-300 bg-white p-8  shadow-lg"
      >
        <DismissButton onDismiss={() => state.close()} />
        {children}
        <DismissButton onDismiss={() => state.close()} />
      </div>
    </Overlay>
  );
};

export { Popover };
