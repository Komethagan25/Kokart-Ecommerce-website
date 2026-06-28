import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import auth from "../config/firebase";
import AddressModal from "../components/AddressModal";

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Fetch Cart
  const fetchCart = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const { data } = await axios.get(
        "http://localhost:5000/api/cart",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Calculate Total
  const totalAmount = cart.reduce(
    (sum, item) =>
      sum + (item.productId?.price || 0) * item.quantity,
    0
  );

  // Handle Payment
  const handlePayment = () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to place an order.");
      return;
    }
    setShowAddressModal(true);
  };

  const handleProceedToPayment = async (selectedAddress) => {
    setShowAddressModal(false);

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const { data } = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        { amount: totalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2️ Razorpay options
      const options = {
        key: "rzp_test_SSKiDvRbl6va5w",
        amount: data.amount,
        currency: "INR",
        name: "KO Kart",
        description: "Order Payment",
        order_id: data.id,

        handler: async function (response) {
          alert("Payment Successful");

          try {
            //  Save order
            await axios.post(
              "http://localhost:5000/api/orders",
              {
                products: cart
                  .filter(item => item.productId)
                  .map(item => ({
                    product: item.productId._id,
                    quantity: item.quantity
                  })),
                totalAmount: totalAmount,
                paymentId: response.razorpay_payment_id
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            alert("Order Placed");

            // Redirect to my orderspage
            navigate("/orders");

          } catch (err) {
            console.log(err);
            alert("Error saving order");
          }
        },

        prefill: {
          name: user.displayName || "Customer",
          email: user.email || "test@gmail.com",
        },

        theme: {
          color: "#3399cc",
        },
      };

      //  Open Razorpay popup
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.log(error);
      alert("Payment Failed");
    }
  };

  // Update Quantity Methods
  const increaseQty = async (id) => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    await axios.put(
      `http://localhost:5000/api/cart/increase/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCart();
  };

  const decreaseQty = async (id) => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    await axios.put(
      `http://localhost:5000/api/cart/decrease/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCart();
  };

  const removeItem = async (id) => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    await axios.delete(
      `http://localhost:5000/api/cart/remove/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCart();
  };

  // Render logic
  if (loading)
    return <div className="text-center mt-20 text-xl">Loading...</div>;

  if (cart.length === 0)
    return (
      <div className="text-center mt-20 text-xl">
        🛒 Your cart is empty
      </div>
    );


  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {showAddressModal && (
        <AddressModal
          onClose={() => setShowAddressModal(false)}
          onAddressSelected={handleProceedToPayment}
        />
      )}
      <h1 className="text-3xl font-bold mb-8 text-center">Your Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.filter(item => item.productId).map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between bg-white p-4 rounded-xl shadow"
            >
              <div
                className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition"
                onClick={() => navigate(`/product/${item.productId?._id}`)}
              >
                <img
                  src={item.productId?.images?.[0]}
                  alt={item.productId.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h2 className="font-semibold">
                    {item.productId?.name}
                  </h2>
                  <p>₹{item.productId?.price}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => decreaseQty(item._id)}
                  className="px-3 py-1 bg-gray-300 rounded cursor-pointer"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => increaseQty(item._id)}
                  className="px-3 py-1 bg-gray-300 rounded cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item._id)}
                className="p-2 text-white bg-red-600 hover:bg-red-700 transition-colors rounded-full cursor-pointer"
                aria-label="Remove item"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow h-fit">
          <h2 className="text-xl font-semibold mb-4">
            Order Summary
          </h2>

          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
          <button
            onClick={handlePayment}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition cursor-pointer"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;