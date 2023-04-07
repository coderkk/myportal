import { useSession } from "next-auth/react";

const RenderIfAuthed = ({ component }: { component: React.ReactNode }) => {
  const { data: sessionData, status } = useSession();
  return (
    <>{status !== "loading" && (!sessionData ? <></> : <>{component}</>)}</>
  );
};

export default RenderIfAuthed;
