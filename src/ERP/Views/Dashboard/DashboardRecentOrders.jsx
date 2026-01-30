import { useEffect, useState } from "react";
import useSales from "@/Hooks/useSales";
import useCustomers from "@/Hooks/useCustomers";
import Pagination from "@/Components/Global/Pagination";

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    revenue: 0,
    completionRate: 0,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cancel modal state
  const [cancelingOrder, setCancelingOrder] = useState(null);

  // Hooks
  const { getAllOrdersMutation, updateOrderMutation, cancelOrderMutation } =
    useSales();
  const { getAllCustomersMutation } = useCustomers();

  // Update modal state
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState(""); // selected status

  useEffect(() => {
    // Fetch customers
    getAllCustomersMutation.mutate(undefined, {
      onSuccess: (res) => {
        const customers = res || [];

        // Fetch orders
        getAllOrdersMutation.mutate(undefined, {
          onSuccess: (res) => {
            const fetchedOrders = res.data || [];

            const enrichedOrders = fetchedOrders.map((order) => {
              const customer = customers.find((c) => c.id === order.customerId);
              return {
                ...order,
                customerName: customer ? customer.name : "Unknown",
                itemsCount: order.items?.length || 0,
              };
            });

            setOrders(enrichedOrders);

            // Calculate statistics
            const now = new Date();
            const todayOrders = enrichedOrders.filter(
              (o) =>
                new Date(o.createdAt).toDateString() === now.toDateString(),
            ).length;

            const weekOrders = enrichedOrders.filter((o) => {
              const orderDate = new Date(o.createdAt);
              return (now - orderDate) / (1000 * 60 * 60 * 24) <= 7;
            }).length;

            const revenue = enrichedOrders.reduce(
              (sum, o) => sum + o.totalAmount,
              0,
            );
            const completedOrders = enrichedOrders.filter(
              (o) => o.status === "Completed",
            ).length;
            const completionRate = enrichedOrders.length
              ? Math.round((completedOrders / enrichedOrders.length) * 100)
              : 0;

            setStats({
              today: todayOrders,
              week: weekOrders,
              revenue: revenue.toFixed(2),
              completionRate,
            });
          },
        });
      },
    });
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "processing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Update order
 // Inside your RecentOrders component

const confirmUpdateOrder = () => {
  if (!updatingOrder || !newStatus) return;

  // Prepare payload for backend
  const newDetails = (updatingOrder.items || []).map(item => ({
    id: item.id,                       // required by backend
    itemId: item.itemId,               // required
    itemVariantId: item.itemVariantId, // required
    quantity: item.quantity || 1,
    unitPrice: item.unitPrice || 0,
    totalPrice: item.totalPrice || 0,
    notes: item.notes || "",
  }));

  const updateData = {
    orderId: updatingOrder.id,
    newStatus,
    paidAmount: updatingOrder.paidAmount || 0,
    newDetails,
  };

  console.log("Payload to backend:", updateData);

  updateOrderMutation.mutate(updateData, {
    onSuccess: () => {
      // Update local state for UI
      setOrders(prev =>
        prev.map(o =>
          o.id === updatingOrder.id ? { ...o, status: newStatus } : o
        )
      );
      setUpdatingOrder(null);
      alert("Order updated successfully!");
    },
    onError: (err) => {
      console.error("Update failed:", err.response?.data || err);
      alert("Failed to update order. Check console for details.");
    },
  });
};

  // Cancel order
  const confirmCancelOrder = () => {
    if (!cancelingOrder) return;
    cancelOrderMutation.mutate(
      {
        id: cancelingOrder.id ?? cancelingOrder.orderId,
        reason: "Cancelled by admin",
      },
      {
        onSuccess: () => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === (cancelingOrder.id ?? cancelingOrder.orderId)
                ? { ...o, status: "Canceled" }
                : o,
            ),
          );
          setCancelingOrder(null);
          alert("Order canceled successfully!");
        },
        onError: (err) =>
          console.error("Cancel failed:", err.response?.data || err),
      },
    );
  };

  // Paginated orders
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <div className="p-6 animate-slideDown">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-light mb-2">
            Recent Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and track all customer orders
          </p>
        </div>
        <button className="btn-primary mt-4 md:mt-0">+ New Order</button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-light">
            {stats.today}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-light">
            {stats.week}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-light">
            ${stats.revenue}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-light">
            {stats.completionRate}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Completion Rate
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-4 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Order No
                </th>
                <th className="text-left py-4 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Customer
                </th>
                <th className="text-left py-4 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Date
                </th>
                <th className="text-left py-4 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Items
                </th>
                <th className="text-left py-4 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Total
                </th>
                <th className="text-left py-4 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="text-left py-4 px-4 font-medium text-gray-600 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-card/50 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-primary dark:text-dark-primary">
                    {order.orderNo || `#${order.id}`}
                  </td>
                  <td className="py-4 px-4 font-medium text-gray-800 dark:text-light">
                    {order.customerName}
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                      {order.itemsCount} items
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-gray-800 dark:text-light">
                    ${order.totalAmount?.toFixed(2)}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 flex gap-2">
                    <button
                      onClick={() => {
                        setUpdatingOrder(order);
                        setNewStatus(order.status); // pre-select current status
                      }}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setCancelingOrder(order)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(orders.length / itemsPerPage)}
          onPageChange={setCurrentPage}
        />

        {/* Update Status Modal */}
        {updatingOrder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-lg font-bold mb-4">Update Order Status</h2>
              <p className="mb-4">
                Select a new status for order #{updatingOrder.id}:
              </p>

              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border rounded p-2 mb-4"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
              </select>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setUpdatingOrder(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={confirmUpdateOrder} className="btn-primary">
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {cancelingOrder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-lg font-bold mb-4">Cancel Order?</h2>
              <p>Are you sure you want to cancel order #{cancelingOrder.id}?</p>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setCancelingOrder(null)}
                  className="btn-secondary"
                >
                  No
                </button>
                <button onClick={confirmCancelOrder} className="btn-danger">
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentOrders;
