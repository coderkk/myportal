import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useRef } from "react";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { useGetOrders } from "../../../../hooks/order";

const CreateButton = dynamic(
  () => import("../../../../components/order/CreateButton")
);

const DeleteButton = dynamic(
  () => import("../../../../components/order/DeleteButton")
);

const EditButton = dynamic(
  () => import("../../../../components/order/EditButton")
);

const Order = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const { orders, isLoading } = useGetOrders({
    projectId: projectId,
  });
  const pendingDeleteCountRef = useRef(0); // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache

  return (
    <SessionAuth>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex h-[80vh]">
          <div className="m-auto">
            <div className="flex justify-between">
              <div className="text-lg font-medium">Orders</div>
              <CreateButton projectId={projectId} />
            </div>
            {orders?.map((order) => (
              <div key={order.id} className="flex">
                <span className="w-full bg-blue-500 text-white hover:bg-blue-200 hover:text-blue-500">
                  <div>
                    <span className="mr-4">{order.createdBy.name}</span>
                    <span className="mr-4">{order.orderNumber}</span>
                    <span className="mr-4">{order.orderNote}</span>
                    <span className="mr-4">{order.arrivalOnSite}</span>
                  </div>
                </span>
                <EditButton order={order} projectId={projectId} />
                <DeleteButton
                  orderId={order.id}
                  projectId={projectId}
                  pendingDeleteCountRef={pendingDeleteCountRef}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </SessionAuth>
  );
};

export default Order;
