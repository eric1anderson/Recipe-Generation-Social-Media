"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";

const ShoppingListPage = () => {
  const [ingredients, setIngredients] = useState<string[]>([]); // Ingredients as array
  const [newIngredients, setNewIngredients] = useState<string[]>([]); // Newly added ingredients
  const [currentIngredient, setCurrentIngredient] = useState<string>(""); // Current input for chips
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
    try {
      const sessionToken = getSessionToken();
      if (!sessionToken) return;

      const response = await fetch("http://127.0.0.1:5000/shopping_list", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIngredients(data.shopping_list || []); // Ensure data is an array
      } else {
        alert("Failed to fetch ingredients. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  // Update only newly created chips on the backend
  const updateIngredients = async () => {
    setSaving(true);
    try {
      const sessionToken = getSessionToken();
      if (!sessionToken || newIngredients.length === 0) return;

      const serializedIngredients = newIngredients.join("\n");

      const response = await fetch("http://127.0.0.1:5000/shopping_list", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ shopping_list: serializedIngredients }), // Send as a serialized string
      });

      if (response.ok) {
        alert("Shopping list updated successfully!");
        setNewIngredients([]); // Clear the new ingredients
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
      setNewIngredients((prev) => [...prev, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  // Remove a chip
  const handleRemoveChip = (index: number) => {
    const ingredientToRemove = ingredients[index];
    setIngredients((prev) => prev.filter((_, i) => i !== index));
    setNewIngredients((prev) => prev.filter((item) => item !== ingredientToRemove)); // Remove from new ingredients if it exists
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
        <div className="dark:bg-zinc-800 p-6 rounded-lg w-[80%] mx-auto shadow">
          <h1 className="text-lg font-bold text-white mb-4">Shopping List</h1>
          <div className="flex flex-col items-start gap-2 bg-white dark:bg-zinc-700 p-2 rounded mb-4">
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
          <div className="flex justify-center mt-4">
            <button
              className={`py-2 px-4 w-[60%] rounded-lg ${
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
