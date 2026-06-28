import { useEffect, useState } from "react";
import axios from "axios";
import auth from "../config/firebase";
import { useNavigate } from "react-router-dom";

function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  //fetch wishlist
  const fetchWishlist = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const { data } = await axios.get(
        "http://localhost:5000/api/wishlist",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWishlist(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  //  remove from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axios.delete(
        `http://localhost:5000/api/wishlist/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // remove from local state 
      setWishlist(wishlist.filter(
        item => item.productId._id !== productId
      ));
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 mt-16">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        My Wishlist
        <span className="text-gray-400 text-base font-normal ml-2">
          ({wishlist.length} items)
        </span>
      </h1>

      {/* Empty state */}
      {wishlist.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-4xl mb-4">♡</p>
          <p className="text-gray-500 text-lg mb-4">
            Your wishlist is empty
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item._id}
              className="bg-white p-4 rounded-xl shadow-md"
            >
              {/* Product Image  */}
              <div
                className="relative cursor-pointer"
                onClick={() => navigate(`/product/${item.productId._id}`)}
              >
                <img
                  src={item.productId?.images?.[0]}
                  alt={item.productId?.name}
                  className="w-full h-52 object-contain"
                />

                {/* filled red heart — click to remove */}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(item.productId._id);
                  }}
                  className="absolute top-2 right-2 text-red-500 text-2xl cursor-pointer hover:scale-110 transition"
                >
                  ❤️
                </span>
              </div>

              {/* Product Info */}
              <h3
                className="text-lg font-semibold mt-3 cursor-pointer hover:text-blue-600"
                onClick={() => navigate(`/product/${item.productId._id}`)}
              >
                {item.productId?.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                  {item.productId?.averageRating > 0
                    ? `${item.productId.averageRating} ★`
                    : "No rating"}
                </span>
                {item.productId?.totalReviews > 0 && (
                  <span className="text-xs text-gray-500">
                    ({item.productId.totalReviews})
                  </span>
                )}
              </div>

              {/* Price */}
              <p className="text-lg font-semibold mt-2">
                ₹{item.productId?.price}
              </p>

              {/* Remove button */}
              <button
                onClick={() => removeFromWishlist(item.productId._id)}
                className="mt-3 w-full rounded-xl border border-red-400 text-red-500 text-sm py-1.5 hover:bg-red-50 transition cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;