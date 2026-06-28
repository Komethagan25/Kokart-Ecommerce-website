import { useEffect, useState } from "react";
import axios from "axios";
import auth from "../config/firebase";
import { useNavigate } from "react-router-dom"; 

const STATUS_OPTIONS = [
  "Placed",
  "Confirmed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

function AdminOrders() {
  const navigate = useNavigate(); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const { data } = await axios.get(
        "http://localhost:5000/api/orders/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axios.put(
        `http://localhost:5000/api/orders/status/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Status updated to "${newStatus}"`);
      fetchOrders();

    } catch (err) {
      console.log(err);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-xl">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="bg-white shadow px-8 py-4 flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800 mr-6">
          Admin Panel
        </h1>

        <button
          onClick={() => navigate("/admin")}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/admin/products")}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
        >
          Products
        </button>

        <button
          onClick={() => navigate("/admin/orders")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
        >
          Manage Orders
        </button>
      </div>

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">All Orders</h1>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">
            No orders found.
          </p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow p-6"
              >
                {/* Order Header */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <p className="font-bold text-lg">
                      {order.user?.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.user?.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Order ID: {order._id}
                    </p>
                    <p className="text-xs text-gray-400">
                      Placed on:{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      ₹{order.totalAmount}
                    </p>
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-3 mb-5">
                  {order.products.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={item.product?.images?.[0]}
                        alt={item.product?.name}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {item.product?.name || "Product deleted"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                {order.address && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-5 text-sm text-gray-600">
                    <p className="font-semibold text-gray-700 mb-1">
                      Deliver to:
                    </p>
                    <p>{order.address.name} · {order.address.phone}</p>
                    <p>
                      {order.address.street}, {order.address.city},{" "}
                      {order.address.state} - {order.address.pincode}
                    </p>
                  </div>
                )}

                {/* Status Update */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-gray-600">
                    Update Status:
                  </span>

                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.status === "Shipped" ||
                            order.status === "Out for Delivery"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {order.status}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default AdminOrders;