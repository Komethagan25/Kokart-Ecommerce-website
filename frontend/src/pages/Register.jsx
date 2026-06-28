import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import auth from "../config/firebase";
import axios from "axios";

const googleProvider = new GoogleAuthProvider();

function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (user.password !== user.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(
        auth, user.email, user.password
      );

      await updateProfile(res.user, { displayName: user.name });

      const token = await res.user.getIdToken();
      localStorage.setItem("token", token);

      await axios.post(
        "https://kokart-ecommerce-website.onrender.com/api/users/save",
        { name: user.name, email: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await res.user.getIdToken(true);
      navigate("/");

    } catch (err) {
      console.log(err);
      setError("Registration failed. Try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      await axios.post(
        "https://kokart-ecommerce-website.onrender.com/api/users/save",
        {
          name: result.user.displayName,
          email: result.user.email
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("token", token);
      navigate("/");

    } catch (err) {
      console.log(err);
      setError("Google sign up failed. Try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-10 bg-white rounded-lg shadow-lg"
        style={{ width: "50%" }}
      >
        <h2 className="text-2xl font-bold mb-5 text-gray-800">Register</h2>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 px-4 rounded hover:bg-gray-50 transition cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          <span className="text-gray-700 font-medium">
            Continue with Google
          </span>
        </button>

        <div className="flex items-center gap-3 my-3">
          <hr className="flex-1 border-gray-300" />
          <span className="text-gray-400 text-sm">or</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Name:</label>
          <input
            type="text"
            name="name"
            required
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Email:</label>
          <input
            type="email"
            name="email"
            required
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Password:</label>
          <input
            type="password"
            name="password"
            required
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            required
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        {error && <p className="text-red-600 my-2">{error}</p>}

        <p
          className="text-blue-600 cursor-pointer my-2"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login here
        </p>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition mb-3"
        >
          Register
        </button>


      </form>
    </div>
  );
}

export default Register;