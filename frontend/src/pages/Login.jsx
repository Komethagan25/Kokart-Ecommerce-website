import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import auth from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  //  redirect to home

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/");
    });

    return () => unsubscribe();
  }, []);



  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const token = await userCred.user.getIdToken();

      const res = await axios.get("https://kokart-ecommerce-website.onrender.com/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(res.data));

      navigate("/");

    } catch (err) {
      console.log(err);
      setError("Login failed");
    }
  };
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="p-10 bg-white rounded-lg shadow-lg"
        style={{ width: "50%" }}
      >
        <h2 className="text-2xl font-bold mb-5 text-gray-800">Login</h2>

        <div className="mb-4">
          <label className="block text-gray-700">Email:</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Password:</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        {error && <p className="text-red-600 my-2">{error}</p>}

        <p
          className="text-blue-600 cursor-pointer my-2"
          onClick={() => navigate("/register")}
        >
          New user? Register here
        </p>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;