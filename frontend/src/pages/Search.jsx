import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Search() {
  const { keyword } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(`https://kokart-ecommerce-website.onrender.com/api/products/suggest/${keyword}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.log(err));
  }, [keyword]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-24">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{keyword}"
      </h1>

      {products.length === 0 && (
        <p className="text-gray-500">No products found</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white p-4 rounded-xl shadow-md">
            <img
              src={product.image}
              alt=""
              className="w-full h-48 object-cover rounded-lg"
            />

            <h3 className="text-xl font-semibold mt-3">
              {product.name}
            </h3>

            <p className="text-gray-600 mt-1">₹{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;