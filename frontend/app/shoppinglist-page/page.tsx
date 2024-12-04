"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";

const ShoppingListPage = () => {
  const [ingredients, setIngredients] = useState<string[]>([]); // Ingredients as array
  const [currentIngredient, setCurrentIngredient] = useState<string>(""); // Current input for chips
  const [loading, setLoading] = useState(false); // Loading state for fetching
  const [saving, setSaving] = useState(false); // Saving state for updating

  // Function to retrieve the session token from local storage
  const getSessionToken = (): string | null => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Session token is missing. Redirecting to login.");
      window.location.href = "/";
    }
    return token;
  };

  // Fetch ingredients from the backend
  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const sessionToken = getSessionToken();
      if (!sessionToken) return;

      const response = await fetch("http://localhost:5000/shopping_list", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // console.log(data.shopping_list) debug info
        setIngredients(data.shopping_list || []); // Ensure data is an array
      } else {
        alert("Failed to fetch ingredients. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update ingredients on the backend
    const updateIngredients = async () => {
        setSaving(true);
        try {
        const sessionToken = getSessionToken();
        if (!sessionToken) return;
    
        // Convert ingredients array to a comma-separated string
        const serializedIngredients = ingredients.join(',');
    
        const response = await fetch("http://localhost:5000/shopping_list", {
            method: "POST",
            headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ shopping_list: serializedIngredients }), // Send as a serialized string
        });
    
        if (response.ok) {
            alert("Shopping list updated successfully!");
        } else {
            alert("Failed to update the shopping list. Please try again.");
        }
        } catch (error) {
        console.error("Error updating ingredients:", error);
        } finally {
        setSaving(false);
        }
    };
  

  // Add a new chip
  const handleAddChip = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients((prev) => [...prev, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  // Remove a chip
  const handleRemoveChip = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch ingredients when component mounts
  useEffect(() => {
    getSessionToken();
    fetchIngredients();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <main className="flex-grow p-12">
        <div className="dark:bg-zinc-800 p-6 rounded-lg shadow">
          <h1 className="text-lg font-bold text-white mb-4">Shopping List</h1>
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-zinc-700 p-2 rounded mb-4">
            {ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1"
              >
                {ingredient}
                <button
                  onClick={() => handleRemoveChip(index)}
                  className="text-white bg-red-500 rounded px-1"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddChip();
                }
              }}
              placeholder="Add ingredient"
              className="dark:bg-zinc-700 dark:text-white flex-1 rounded p-1"
            />
          </div>
          <div className="flex justify-between mt-4">
            <button
              className={`py-2 px-4 rounded-lg ${
                loading
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
              onClick={fetchIngredients}
              disabled={loading}
            >
              {loading ? "Fetching..." : "Fetch Shopping List"}
            </button>
            <button
              className={`py-2 px-4 rounded-lg ${
                saving
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-500"
              }`}
              onClick={updateIngredients}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Shopping List"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShoppingListPage;
