import { useEffect, useState } from "react";
import axios from "axios";
import auth from "../config/firebase";

const STEPS = [
    "Placed",
    "Confirmed",
    "Shipped",
    "Out for Delivery",
    "Delivered"
];

function Orders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const token = await user.getIdToken();
                const res = await axios.get("https://kokart-ecommerce-website.onrender.com/api/orders", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchOrders();
    }, []);

    const cancelOrder = async (id) => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            await axios.put(
                `https://kokart-ecommerce-website.onrender.com/api/orders/cancel/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Order Cancelled");
            window.location.reload();
        } catch (err) {
            console.log(err);
            alert("Error cancelling order");
        }
    };

    return (
        <div className="p-6 mt-20 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">My Orders</h1>

            {orders.length === 0 && (
                <p className="text-gray-500 text-center mt-20">
                    No orders yet.
                </p>
            )}

            {orders.map((order) => (
                <div
                    key={order._id}
                    className="bg-white p-6 mb-6 rounded-xl shadow"
                >
                    {/* Order ID and Date */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="font-semibold text-gray-800">
                                Order ID: {order._id}
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                })}
                            </p>
                        </div>
                        <p className="font-bold text-green-600">
                            ₹{order.totalAmount}
                        </p>
                    </div>

                    {/* Products */}
                    {order.products.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 mb-3"
                        >
                            <img
                                src={item.product?.images?.[0]}
                                alt={item.product?.name}
                                className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                                <p className="font-medium">
                                    {item.product
                                        ? item.product.name
                                        : "Product not available"}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Qty: {item.quantity}
                                </p>
                            </div>
                        </div>
                    ))}

                    {order.status !== "Cancelled" ? (
                        <div className="mt-6">
                            <p className="text-sm font-semibold text-gray-600 mb-3">
                                Order Status
                            </p>

                            {/* Steps Row */}
                            <div className="flex items-center justify-between">
                                {STEPS.map((step, index) => {

                                    const currentStep = STEPS.indexOf(order.status);

                                    const isDone = index < currentStep;
                                    const isActive = index === currentStep;
                                    const isUpcoming = index > currentStep;

                                    return (
                                        <div
                                            key={step}
                                            className="flex flex-col items-center flex-1"
                                        >
                                            <div className="flex items-center w-full">

                                                {index !== 0 && (
                                                    <div
                                                        className={`flex-1 h-1 ${isDone || isActive
                                                            ? "bg-blue-500"
                                                            : "bg-gray-200"
                                                            }`}
                                                    />
                                                )}

                                                {/* Circle */}
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isDone
                                                        ? "bg-green-500 text-white"
                                                        : isActive
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-gray-200 text-gray-400"
                                                        }`}
                                                >
                                                    {isDone ? "✓" : index + 1}
                                                </div>

                                                {index !== STEPS.length - 1 && (
                                                    <div
                                                        className={`flex-1 h-1 ${isDone
                                                            ? "bg-blue-500"
                                                            : "bg-gray-200"
                                                            }`}
                                                    />
                                                )}

                                            </div>

                                            {/* Step label below circle */}
                                            <p
                                                className={`text-xs mt-2 text-center ${isDone
                                                    ? "text-green-600 font-semibold"
                                                    : isActive
                                                        ? "text-blue-600 font-semibold"
                                                        : "text-gray-400"
                                                    }`}
                                            >
                                                {step}
                                            </p>

                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        //  Show cancelled badge if order is cancelled
                        <div className="mt-4">
                            <span className="bg-red-100 text-red-600 font-semibold px-4 py-1.5 rounded-full text-sm">
                                Order Cancelled
                            </span>
                        </div>
                    )}

                    {/* Cancel button */}
                    {(order.status === "Placed" || order.status === "Confirmed") && (
                        <button
                            onClick={() => cancelOrder(order._id)}
                            className="mt-5 bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition text-sm cursor-pointer"
                        >
                            Cancel Order
                        </button>
                    )}

                </div>
            ))}
        </div>
    );
}

export default Orders;