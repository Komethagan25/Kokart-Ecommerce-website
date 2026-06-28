import axios from "axios";
import { useEffect, useState } from "react";
import auth from "../config/firebase";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Footwear",
  "Food",
  "Books",
  "Beauty"
];

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("https://kokart-ecommerce-website.onrender.com/api/products");
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to do this.");
      return;
    }

    try {
      const token = await user.getIdToken();
      const formData = new FormData();

      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("category", category);

      images.forEach((img) => {
        formData.append("images", img);
      });

      await axios.post(
        "https://kokart-ecommerce-website.onrender.com/api/products",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("Product Added");
      setName("");
      setPrice("");
      setDescription("");
      setImages([]);
      setCategory("Electronics");
      fetchProducts();
    } catch (error) {
      console.error("Failed to add product:", error);
      alert("Error adding product.");
    }
  };

  const deleteProduct = async (id) => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to do this.");
      return;
    }

    try {
      const token = await user.getIdToken();
      await axios.delete(
        `https://kokart-ecommerce-website.onrender.com/api/products/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Product Deleted");
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Error deleting product.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Admin Nav Bar */}
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
        >
          Products
        </button>
        <button
          onClick={() => navigate("/admin/orders")}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
        >
          Manage Orders
        </button>
      </div>

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Products</h1>

        {/* Add Product Form */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Product</h2>

          <input
            type="text"
            placeholder="Name"
            value={name}
            className="border p-2 w-full mb-3 rounded"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            className="border p-2 w-full mb-3 rounded"
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            type="file"
            multiple
            className="border p-2 w-full mb-3 rounded"
            onChange={(e) => setImages(Array.from(e.target.files))}
          />
          <p className="text-xs text-gray-400 mb-3">
            You can select up to 5 images
          </p>

          <textarea
            placeholder="Description"
            value={description}
            className="border p-2 w-full mb-3 rounded"
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 w-full mb-3 rounded focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={addProduct}
            className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700"
          >
            Add Product
          </button>
        </div>

        {/* Product List */}
        <div className="grid md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="h-40 w-full object-cover rounded"
              />

              <h2 className="font-semibold mt-3">{product.name}</h2>
              <p>₹{product.price}</p>

              {/* show category badge */}
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                {product.category || "Uncategorized"}
              </span>

              <p className="text-xs text-gray-400 mt-1">
                {product.images?.length || 0} image(s)
              </p>

              <button
                onClick={() => deleteProduct(product._id)}
                className="bg-red-600 text-white px-3 py-1 mt-3 rounded cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;