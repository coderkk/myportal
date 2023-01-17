import { useRouter } from "next/router";

const Error = () => {
  const { query } = useRouter();
  if (query.error && query.error === "OAuthAccountNotLinked")
    return (
      <div>
        To confirm your identity, sign in with the same account you used
        originally.
      </div>
    );
  return <div>An error occcured</div>;
};

export default Error;
