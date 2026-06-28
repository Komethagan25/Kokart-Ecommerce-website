import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-10">
            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Brand */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-3">KO Kart</h2>
                    <p className="text-sm">
                        Your one-stop online shopping store for electronics,
                        fashion, and daily essentials.
                    </p>
                </div>

                {/* Links */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
                    <ul className="space-y-2">
                        <li><Link to="/" className="hover:text-white">Home</Link></li>
                        <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
                        <li><Link to="/login" className="hover:text-white">Login</Link></li>
                        <li><Link to="/register" className="hover:text-white">Register</Link></li>
                    </ul>
                </div>

                {/* Customer */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Customer Service</h3>
                    <ul className="space-y-2">
                        <li className="hover:text-white cursor-pointer">Help Center</li>
                        <li className="hover:text-white cursor-pointer">Returns</li>
                        <li className="hover:text-white cursor-pointer">Shipping</li>
                        <li className="hover:text-white cursor-pointer">Privacy Policy</li>
                    </ul>
                </div>

                {/* Social */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Follow Us</h3>
                    <div className="flex space-x-4">
                        <a href="https://facebook.com" target="_blank" rel="noreferrer">
                            <Facebook className="w-6 h-6 hover:text-blue-500 transition" />
                        </a>

                        <a href="https://instagram.com" target="_blank" rel="noreferrer">
                            <Instagram className="w-6 h-6 hover:text-pink-500 transition" />
                        </a>

                        <a href="https://x.com" target="_blank" rel="noreferrer">
                            <Twitter className="w-6 h-6 hover:text-gray-300 transition" />
                        </a>

                        <a href="https://youtube.com" target="_blank" rel="noreferrer">
                            <Youtube className="w-6 h-6 hover:text-red-500 transition" />
                        </a>
                    </div>
                </div>

            </div>

            {/* Bottom */}
            <div className="border-t border-gray-700 text-center py-4 text-sm">
                © {new Date().getFullYear()} KO Kart. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;