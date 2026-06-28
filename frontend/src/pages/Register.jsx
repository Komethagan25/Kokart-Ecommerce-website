import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import auth from "../config/firebase";
import { updateProfile } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";


function Register() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");

  //  Redirect if already logged in

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
        auth,
        user.email,
        user.password
      );

      //  update firebase profile 
      await updateProfile(res.user, {
        displayName: user.name
      });

      //  get token
      const token = await res.user.getIdToken();


      localStorage.setItem("token", token);

      await axios.post(
        "http://localhost:5000/api/users/save",
        { name: user.name, email: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await res.user.getIdToken(true);


      alert("Registered successfully");
      navigate("/");

    } catch (err) {
      setError("Registration failed. Try again.");
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
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;