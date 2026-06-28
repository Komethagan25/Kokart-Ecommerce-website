import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import auth from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // forceRefresh
          const token = await currentUser.getIdToken(true);

          const res = await axios.get("http://localhost:5000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` }
          });

          setUser(res.data); 

        } catch (err) {
          console.log("Navbar auth error:", err);
          setUser(null); 
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  //  Search suggestions
  const handleSearch = async (value) => {
    setSearch(value);

    if (value.length > 1) {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products/suggest/${value}`
        );
        setSuggestions(res.data);
      } catch (err) {
        console.log(err);
      }
    } else {
      setSuggestions([]);
    }
  };

  //  Logout
  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  // Close menu
  useEffect(() => {
    const closeMenu = () => setShowMenu(false);
    window.addEventListener("click", closeMenu);

    return () => window.removeEventListener("click", closeMenu);
  }, []);

  return (
    <nav className="bg-blue-600 px-6 py-3 flex items-center justify-between fixed top-0 left-0 w-full shadow-md z-50">

      {/* Logo */}
      <div className="flex flex-col text-white">
        <Link to="/" className="text-2xl font-bold italic">
          KO Kart
        </Link>
        <span className="text-xs">
          Explore <span className="text-yellow-300 font-semibold">Plus ✨</span>
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative w-1/2 flex items-center bg-white rounded-md px-3 py-2 shadow-md">
        <Search className="text-gray-500 mr-2" size={18} />

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full outline-none text-sm"
        />

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 bg-white w-full shadow-lg rounded-md mt-1 z-50">
            {suggestions.map((product) => (
              <div
                key={product._id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSuggestions([]);
                  setSearch("");
                  navigate(`/product/${product._id}`);
                }}
              >
                {product.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-6 text-white">
        {user?.isAdmin && (
          <button
            onClick={() => {
              navigate("/admin");
              setShowMenu(false);
            }}
            className="flex items-center gap-1.5 bg-white text-blue-700 font-semibold text-sm px-3 py-1.5 rounded hover:bg-blue-50 transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Admin Panel
          </button>
        )}

        {/* If NOT logged in */}
        {!user ? (
          <Link
            to="/login"
            className="flex items-center space-x-1 bg-white text-blue-600 px-4 py-1 rounded font-semibold"
          >
            <User size={18} />
            <span>Login</span>
          </Link>
        ) : (
          <>
            {/* User Menu */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="relative flex items-center space-x-1 cursor-pointer"
            >
              <User size={18} />
              <span>{user.name}</span>

              {showMenu && (
                <div className="absolute top-10 left-0 bg-white text-black shadow-lg rounded p-2 w-40 z-50">
                  <div
                    onClick={() => {
                      navigate("/profile");
                      setShowMenu(false);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Profile
                  </div>
                  {!user?.isAdmin && (
                    <div
                      onClick={() => {
                        navigate("/orders");
                        setShowMenu(false);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      My Orders
                    </div>
                  )}

                  {/* Wishlist link */}
                  {!user?.isAdmin && (
                    <Link to="/wishlist" className="flex items-center space-x-1 p-2 hover:bg-gray-100 cursor-pointer">
                      <span>Wishlist</span>
                      <span className="text-lg">♡</span>
                    </Link>
                  )}
                </div>
              )}

            </div>

            {/* Logout */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              className="bg-red-500 px-3 py-1 rounded text-sm cursor-pointer"
            >
              Logout
            </button>
          </>
        )}

        {/* Cart */}
        {!user?.isAdmin && (
          <Link to="/cart" className="flex items-center space-x-1">
            <ShoppingCart size={20} />
            <span>Cart</span>
          </Link>
        )}



      </div>
    </nav>
  );
}

export default Navbar;