
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import auth from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // review states
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  //  get current logged in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  //fetch product
  useEffect(() => {
    axios
      .get(`https://kokart-ecommerce-website.onrender.com/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  // fetch reviews
  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(
        `https://kokart-ecommerce-website.onrender.com/api/reviews/${id}`
      );
      setReviews(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // check if user purchased and already reviewed
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!currentUser) return;

      try {
        const token = await currentUser.getIdToken();

        // check orders
        const { data: orders } = await axios.get(
          "https://kokart-ecommerce-website.onrender.com/api/orders",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // check if any order has this product and is not cancelled
        const purchased = orders.some(
          (order) =>
            order.status !== "Cancelled" &&
            order.products.some((p) => p.product?._id === id)
        );
        setHasPurchased(purchased);

        // check if already reviewed
        const reviewed = reviews.some(
          (r) => r.userId === currentUser.uid ||
            r.userName === currentUser.displayName
        );
        setAlreadyReviewed(reviewed);

      } catch (err) {
        console.log(err);
      }
    };

    checkUserStatus();
  }, [currentUser, reviews, id]);

  //  submit review
  const submitReview = async () => {
    if (rating === 0) {
      alert("Please select a star rating");
      return;
    }
    if (!comment.trim()) {
      alert("Please write a comment");
      return;
    }

    try {
      setSubmitting(true);
      const token = await currentUser.getIdToken();

      await axios.post(
        `https://kokart-ecommerce-website.onrender.com/api/reviews/${id}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRating(0);
      setComment("");
      fetchReviews();

      // refresh product to get new averageRating
      const { data } = await axios.get(
        `https://kokart-ecommerce-website.onrender.com/api/products/${id}`
      );
      setProduct(data);

    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  //  delete review
  const deleteReview = async (reviewId) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`https://kokart-ecommerce-website.onrender.com/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();

      // refresh product rating
      const { data } = await axios.get(
        `https://kokart-ecommerce-website.onrender.com/api/products/${id}`
      );
      setProduct(data);

    } catch (err) {
      console.log(err);
    }
  };

  const addToCart = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login first");
      return;
    }
    const token = await user.getIdToken();
    await axios.post(
      "https://kokart-ecommerce-website.onrender.com/api/cart/add",
      { productId: product._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Added to cart");
  };

  const prevImage = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  if (!product) return <p className="p-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Product Card */}
        <div className="bg-white p-8 rounded-xl shadow-md grid md:grid-cols-2 gap-10">

          {/* Image Section */}
          <div>
            <div className="relative">
              <img
                src={product.images?.[currentIndex]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full w-9 h-9 flex items-center justify-center shadow cursor-pointer text-lg"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full w-9 h-9 flex items-center justify-center shadow cursor-pointer text-lg"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`thumb-${index}`}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-16 h-16 object-cover rounded cursor-pointer border-2 transition ${currentIndex === index
                      ? "border-blue-500"
                      : "border-transparent hover:border-gray-300"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h2 className="text-3xl font-bold">{product.name}</h2>

            {/*real average rating */}
            <div className="flex items-center gap-2 mt-3">
              <span className="bg-green-600 text-white text-sm px-2 py-0.5 rounded">
                {product.averageRating > 0
                  ? `${product.averageRating} ★`
                  : "No ratings yet"}
              </span>
              {product.totalReviews > 0 && (
                <span className="text-sm text-gray-500">
                  ({product.totalReviews} reviews)
                </span>
              )}
            </div>

            <p className="mt-4 text-gray-700">{product.description}</p>
            <p className="text-2xl text-green-600 mt-4">₹{product.price}</p>

            <button
              onClick={addToCart}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold mb-6">
            Reviews ({reviews.length})
          </h3>

          {/* Write Review Form */}
          {!currentUser ? (
            <p className="text-gray-500 mb-6">
              Please login to write a review.
            </p>
          ) : alreadyReviewed ? (
            <p className="text-blue-600 font-medium mb-6">
              You have already reviewed this product.
            </p>
          ) : !hasPurchased ? (
            <p className="text-gray-500 mb-6">
              Purchase this product to leave a review.
            </p>
          ) : (
            //  Review Form — only shown if purchased and not reviewed
            <div className="border rounded-xl p-5 mb-8 bg-gray-50">
              <h4 className="font-semibold text-lg mb-3">Write a Review</h4>

              {/* Star Selector */}
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl cursor-pointer transition"
                    style={{
                      color:
                        star <= (hoverRating || rating)
                          ? "#f59e0b"
                          : "#d1d5db"
                    }}
                  >
                    ★
                  </span>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-500 self-center">
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                  </span>
                )}
              </div>

              {/* Comment Box */}
              <textarea
                rows={3}
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 mb-3"
              />

              <button
                onClick={submitReview}
                disabled={submitting}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}

          {/* All Reviews List */}
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-6">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border rounded-xl p-4 hover:border-gray-300 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      {/* Reviewer name + stars */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="bg-blue-100 text-blue-700 font-semibold text-sm w-8 h-8 rounded-full flex items-center justify-center">
                          {review.userName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold">{review.userName}</span>
                      </div>

                      {/* Stars display */}
                      <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            style={{
                              color: star <= review.rating ? "#f59e0b" : "#d1d5db"
                            }}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-xs text-gray-400 ml-2 self-center">
                          {new Date(review.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>

                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>

                    {/*  Delete button — admin or own review */}
                    {currentUser && (
                      <button
                        onClick={() => deleteReview(review._id)}
                        className="text-red-400 hover:text-red-600 text-sm cursor-pointer ml-4"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProductDetails;