import { useEffect, useState } from "react";
import axios from "axios";
import auth from "../config/firebase";

function AddressModal({ onClose, onAddressSelected }) {
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "", phone: "", street: "", city: "", state: "", pincode: ""
  });

  const fetchAddresses = async () => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      const { data } = await axios.get("https://kokart-ecommerce-website.onrender.com/api/addresses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(data);

      // auto select first address if exists
      if (data.length > 0) setSelected(data[0]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveAddress = async () => {
    const { name, phone, street, city, state, pincode } = form;
    if (!name || !phone || !street || !city || !state || !pincode) {
      alert("Please fill all fields");
      return;
    }

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      const { data } = await axios.post(
        "https://kokart-ecommerce-website.onrender.com/api/addresses",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAddresses([...addresses, data]);
      setSelected(data);
      setShowForm(false);
      setForm({ name: "", phone: "", street: "", city: "", state: "", pincode: "" });
    } catch (err) {
      console.log(err);
      alert("Failed to save address");
    }
  };

  const deleteAddress = async (id) => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      await axios.delete(`https://kokart-ecommerce-website.onrender.com/api/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updated = addresses.filter(a => a._id !== id);
      setAddresses(updated);

      // if deleted address was selected, reset
      if (selected?._id === id) setSelected(updated[0] || null);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold">Select Delivery Address</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-3">

          {loading ? (
            <p className="text-center text-gray-500">Loading addresses...</p>
          ) : (
            <>
              {/* Saved Addresses */}
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => setSelected(addr)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition ${selected?._id === addr._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{addr.name}</p>
                      <p className="text-sm text-gray-600">{addr.phone}</p>
                      <p className="text-sm text-gray-600">
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAddress(addr._id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm cursor-pointer ml-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Address  */}
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition cursor-pointer"
                >
                  + Add New Address
                </button>
              ) : (
                <div className="border rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-gray-700">New Address</h3>

                  {[
                    { name: "name", placeholder: "Full Name" },
                    { name: "phone", placeholder: "Phone Number" },
                    { name: "street", placeholder: "Street / Area" },
                    { name: "city", placeholder: "City" },
                    { name: "state", placeholder: "State" },
                    { name: "pincode", placeholder: "Pincode" }
                  ].map((field) => (
                    <input
                      key={field.name}
                      type="text"
                      name={field.name}
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    />
                  ))}

                  <div className="flex gap-2">
                    <button
                      onClick={saveAddress}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    >
                      Save Address
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t">
          <button
            onClick={() => {
              if (!selected) {
                alert("Please select or add a delivery address");
                return;
              }
              onAddressSelected(selected);
            }}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition cursor-pointer"
          >
            Continue to Pay
          </button>
        </div>

      </div>
    </div>
  );
}

export default AddressModal;