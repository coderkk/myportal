import clsx from "clsx";

export const Container = (props) => {
  const { className, ...rest } = props;
  return (
    <div
      className={clsx("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...rest}
    />
  );
};
