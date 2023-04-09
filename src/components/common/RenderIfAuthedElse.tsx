import { useSession } from "next-auth/react";

const RenderIfAuthedElse = ({
  authedComponent,
  notAuthedComponent,
}: {
  authedComponent: React.ReactNode;
  notAuthedComponent: React.ReactNode;
}) => {
  const { data: sessionData, status } = useSession();
  return (
    <>
      {status !== "loading" &&
        (!sessionData ? <>{notAuthedComponent}</> : <>{authedComponent}</>)}
    </>
  );
};

export default RenderIfAuthedElse;
