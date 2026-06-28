import { useEffect, useState } from "react";
import axios from "axios";
import auth from "../config/firebase";
import { User, MapPin, Plus, Trash2 } from "lucide-react";

function Profile() {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", street: "", city: "", state: "", pincode: ""
  });

  const getToken = async () => {
    const firebaseUser = auth.currentUser;
    return await firebaseUser.getIdToken();
  };

  // Fetch user info
  const fetchUser = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("https://kokart-ecommerce-website.onrender.com/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(data);
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("https://kokart-ecommerce-website.onrender.com/api/addresses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUser();
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
      const token = await getToken();
      const { data } = await axios.post(
        "https://kokart-ecommerce-website.onrender.com/api/addresses",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses([...addresses, data]);
      setShowForm(false);
      setForm({ name: "", phone: "", street: "", city: "", state: "", pincode: "" });
    } catch (err) {
      console.log(err);
      alert("Failed to save address");
    }
  };

  const deleteAddress = async (id) => {
    try {
      const token = await getToken();
      await axios.delete(`https://kokart-ecommerce-website.onrender.com/api/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(addresses.filter(a => a._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 mt-16">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* User Info  */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <User size={32} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {user?.name || "Loading..."}
              </h1>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Addresses Card */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">
                Saved Addresses
              </h2>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus size={14} />
              Add New
            </button>
          </div>

          {/* Add New Address Form */}
          {showForm && (
            <div className="border rounded-xl p-4 mb-4 space-y-3 bg-gray-50">
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
              <div className="flex gap-2 pt-1">
                <button
                  onClick={saveAddress}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer text-sm font-semibold"
                >
                  Save Address
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Saved Address List */}
          {addresses.length === 0 && !showForm ? (
            <p className="text-gray-400 text-sm text-center py-4">
              No saved addresses yet. Add one above.
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="flex justify-between items-start border rounded-xl p-4 hover:border-blue-300 transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{addr.name}</p>
                    <p className="text-sm text-gray-500">{addr.phone}</p>
                    <p className="text-sm text-gray-500">
                      {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAddress(addr._id)}
                    className="text-red-400 hover:text-red-600 transition cursor-pointer ml-4 mt-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;