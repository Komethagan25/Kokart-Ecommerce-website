import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

function Home() {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const [wishlistIds, setWishlistIds] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:5000/api/products")
            .then(res => setProducts(res.data))
            .catch(err => console.log(err));
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                fetchWishlist(user);
            } else {

                setWishlistIds([]);
            }
        });
        return () => unsubscribe();
    }, []);

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

    //add to cart
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
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">E-Commerce Store</h1>
            </div>

            {/* Banner Section */}

            <div className="mb-10 shadow-lg rounded-xl overflow-hidden">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    loop={true}
                    className="w-full"
                >
                    <SwiperSlide>
                        <div className="relative h-64 md:h-96 w-full">
                            <img
                                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
                                alt="Galaxy S26 Ultra smartphone pre-order promotional banner"
                                className="w-full h-full object-cover"
                            />

                            <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white text-center p-4">
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                                    Galaxy S26 Ultra
                                </h2>

                                <button className="mt-4 px-6 py-2 bg-blue-600 font-medium rounded-full transition">
                                    Pre-Order
                                </button>
                            </div>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className="relative h-64 md:h-96 w-full">
                            <img
                                src="https://images.unsplash.com/photo-1492724441997-5dc865305da7"
                                alt="Big sale discount offer banner up to fifty percent off"
                                className="w-full h-full object-cover"

                            />

                            <div className="absolute inset-0 bg-gradient from-black/70 via-black/40 to-transparent flex flex-col justify-center items-start text-white p-8 md:p-16">
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                                    Big Sale Offer
                                </h2>
                                <p className="mt-2 text-base md:text-lg text-gray-200">
                                    Up to 50% OFF on select electronics
                                </p>
                                <button className="mt-4 px-6 py-2 bg-white text-black hover:bg-gray-200 font-medium rounded-full transition">
                                    Shop Sale
                                </button>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>
            </div>


            {/* Category Tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
                <button className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white cursor-pointer">
                    All
                </button>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => navigate(`/category/${cat}`)}
                        className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition cursor-pointer"
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
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

                            <button
                                onClick={(e) => toggleWishlist(e, product._id)}
                                className="absolute top-2 right-2 text-2xl cursor-pointer hover:scale-110 transition"
                            >
                                {wishlistIds.includes(product._id) ? "❤️" : "♡"}
                            </button>
                        </div>

                        <h3 className="text-xl font-semibold mt-3">{product.name}</h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                                {product.averageRating > 0
                                    ? `${product.averageRating} ★`
                                    : "No rating"}
                            </span>
                            <span className="text-xs text-gray-500">
                                {product.totalReviews > 0
                                    ? `(${product.totalReviews})`
                                    : ""}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-semibold text-black">
                                ₹{product.price}
                            </span>
                            <span className="text-green-600 text-sm font-semibold">
                                40% off
                            </span>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product._id);
                            }}
                            className="mt-3 w-40 rounded-2xl bg-yellow-400 text-black text-sm py-1.5 hover:bg-yellow-500 cursor-pointer"
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;