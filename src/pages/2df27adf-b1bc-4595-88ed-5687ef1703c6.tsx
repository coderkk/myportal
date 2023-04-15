import dynamic from "next/dynamic";

const Tablee = dynamic(() => import("../components/common/Tablee"), {
  ssr: false,
});

function Testing() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <main className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mt-6">
          <Tablee />
        </div>
      </main>
    </div>
  );
}

export default Testing;
