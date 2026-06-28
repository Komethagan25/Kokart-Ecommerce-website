import { useEffect, useState } from "react";
import axios from "axios";
import auth from "../config/firebase";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  //  fetch all stats
  const fetchStats = async () => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const { data } = await axios.get(
        "https://kokart-ecommerce-website.onrender.com/api/admin/stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStats(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20 text-xl">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Admin NavBar */}
      <div className="bg-white shadow px-8 py-4 flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800 mr-6">
          Admin Panel
        </h1>

        {/* Dashboard */}
        <button
          onClick={() => navigate("/admin")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
        >
          Dashboard
        </button>

        {/* Products */}
        <button
          onClick={() => navigate("/admin/products")}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
        >
          Products
        </button>

        {/* Orders */}
        <button
          onClick={() => navigate("/admin/orders")}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
        >
          Manage Orders
        </button>
      </div>

      <div className="p-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">

          {/* Total Orders */}
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.totalOrders}
            </p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.totalUsers}
            </p>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Total Products</p>
            <p className="text-3xl font-bold text-orange-500">
              {stats.totalProducts}
            </p>
          </div>

        </div>


        <div className="grid md:grid-cols-2 gap-6">

          {/* Bar Chart — Revenue  */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Revenue — Last 7 Days
            </h2>

            {/* ResponsiveContainer makes chart fit the div width */}
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.revenueByDay}>

                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                {/* X axis — dates */}
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />

                {/* Y axis — revenue amounts */}
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(value) => `₹${value}`}
                />

                {/* tooltip when hovering a bar */}
                <Tooltip
                  formatter={(value) => [`₹${value}`, "Revenue"]}
                />

                {/* the actual bars */}
                <Bar
                  dataKey="revenue"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Recent Orders
              </h2>
              <button
                onClick={() => navigate("/admin/orders")}
                className="text-sm text-blue-600 hover:underline cursor-pointer"
              >
                View all →
              </button>
            </div>

            {/* Orders list */}
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between items-center border-b pb-3 last:border-0"
                >
                  <div>
                    {/* Customer name */}
                    <p className="font-semibold text-sm text-gray-800">
                      {order.user?.name || "Unknown"}
                    </p>
                    {/* Date */}
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        }
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    {/* Amount */}
                    <p className="font-semibold text-sm text-green-600">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </p>

                    {/* Status badge */}
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.status === "Delivered"
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

              {/* if no orders yet */}
              {stats.recentOrders.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No orders yet.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;