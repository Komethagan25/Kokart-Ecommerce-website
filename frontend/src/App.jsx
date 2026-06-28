
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import AdminProducts from "./pages/AdminProducts";
import ProductDetails from "./pages/ProductDetails";
import Search from "./pages/Search";
import Footer from "./components/Footer";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import AdminOrders from "./pages/AdminOrders";
import AdminDashboard from "./pages/AdminDashboard";
import CategoryPage from "./pages/CategoryPage";
import WishlistPage from "./pages/Wishlist";

function App() {
  return (
    <Router>
      <Navbar />

      <div className="pt-18">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/search/:keyword" element={<Search />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/category/:name" element={<CategoryPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
}

export default App;