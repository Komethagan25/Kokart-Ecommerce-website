import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import auth from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Footwear",
  "Food",
  "Books",
  "Beauty"
];

function CategoryPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);


  const [wishlistIds, setWishlistIds] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) fetchWishlist(user);
    });
    return () => unsubscribe();
  }, []);

  // fetch products for this category
  useEffect(() => {
    const fetchByCategory = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `http://localhost:5000/api/products/category/${name}`
        );
        setProducts(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchByCategory();
  }, [name]);

  const fetchWishlist = async (user) => {
    try {
      const token = await user.getIdToken();
      const { data } = await axios.get(
        "http://localhost:5000/api/wishlist",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const ids = data.map(item => item.productId._id);
      setWishlistIds(ids);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleWishlist = async (e, productId) => {
    e.stopPropagation();

    if (!currentUser) {
      alert("Please login first");
      return;
    }

    try {
      const token = await currentUser.getIdToken();

      if (wishlistIds.includes(productId)) {
        await axios.delete(
          `http://localhost:5000/api/wishlist/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistIds(wishlistIds.filter(id => id !== productId));
      } else {
        await axios.post(
          `http://localhost:5000/api/wishlist/${productId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistIds([...wishlistIds, productId]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const addToCart = async (productId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please login first");
        return;
      }
      const token = await user.getIdToken();
      await axios.post(
        "http://localhost:5000/api/cart/add",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart");
    } catch (error) {
      alert("Please login first");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="flex gap-2 flex-wrap mb-8 mt-4">

        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition cursor-pointer"
        >
          All
        </button>

        {/* category tab */}
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => navigate(`/category/${cat}`)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition cursor-pointer ${cat === name
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {name}
        <span className="text-gray-400 text-base font-normal ml-2">
          ({products.length} products)
        </span>
      </h1>

      {/* Loading */}
      {loading ? (
        <p className="text-center text-gray-500 mt-20">Loading...</p>
      ) : products.length === 0 ? (

        <div className="text-center mt-20">
          <p className="text-gray-500 text-lg">
            No products in {name} yet.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      ) : (
        // Products Grid
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              onClick={() => navigate(`/product/${product._id}`)}
              className="bg-white p-4 rounded-xl shadow-md cursor-pointer hover:scale-105 transition"
            >
              <div className="relative">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-52 object-contain"
                />

                <span
                  onClick={(e) => toggleWishlist(e, product._id)}
                  className="absolute top-2 right-2 text-2xl cursor-pointer hover:scale-110 transition"
                >
                  {wishlistIds.includes(product._id) ? "♥️" : "♡"}
                </span>
              </div>

              <h3 className="text-xl font-semibold mt-3">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                  {product.averageRating > 0
                    ? `${product.averageRating} ★`
                    : "No rating"}
                </span>
                {product.totalReviews > 0 && (
                  <span className="text-xs text-gray-500">
                    ({product.totalReviews})
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-semibold text-black">
                  ₹{product.price}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product._id);
                }}
                className="mt-3 w-40 rounded-2xl bg-yellow-400 text-black text-sm py-1.5 hover:bg-yellow-500"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;