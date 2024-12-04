"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

export default function GenerateRecipe() {
  const [question, setQuestion] = useState<string>("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState<string>("");
  const [currentDietaryRestriction, setCurrentDietaryRestriction] = useState<string>("");
  const [recipeResponse, setRecipeResponse] = useState<string | null>(null);
  const router = useRouter();

  const handleAddChip = (
    currentValue: string,
    valueArray: string[],
    setValue: React.Dispatch<React.SetStateAction<string[]>>,
    setCurrent: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (currentValue.trim() && !valueArray.includes(currentValue.trim())) {
      setValue((prev) => [...prev, currentValue.trim()]);
      setCurrent("");
    }
  };

  const handleRemoveChip = (
    index: number,
    setValue: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setValue((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateRecipe = async () => {
    try {

      const params = new URLSearchParams();
      params.append("question", question);
      ingredients.forEach((ingredient) => params.append("ingredients", ingredient));
      dietaryRestrictions.forEach((restriction) => params.append("dietary_restrictions", restriction));

      const response = await fetch(`http://127.0.0.1:5000/generate-recipe?${params.toString()}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecipeResponse(data.recipe);
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to generate recipe. Please try again.");
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      alert("Something went wrong. Please try again.");
    }
  };


  const handleSaveRecipe = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipe: recipeResponse }),
      });

      if (response.ok) {
        alert("Recipe saved successfully!");
        router.push("/user-page");
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to save recipe.");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={[true]}>
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />
        <main className="flex-grow p-6">
          <div className="dark:bg-zinc-800 text-white rounded-lg shadow p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Generate a New Recipe</h1>
            <div className="mb-4">
              <label className="block text-sm mb-2">Ask a question:</label>
              <textarea
                className="w-full rounded p-2 dark:bg-zinc-700 dark:text-white"
                placeholder="e.g., How can I make a healthy pasta?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">Ingredients to include:</label>
              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-zinc-700 p-2 rounded">
                {ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1"
                  >
                    {ingredient}
                    <button
                      onClick={() => handleRemoveChip(index, setIngredients)}
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
                      handleAddChip(
                        currentIngredient,
                        ingredients,
                        setIngredients,
                        setCurrentIngredient
                      );
                    }
                  }}
                  placeholder="Add ingredient"
                  className="dark:bg-zinc-700 dark:text-white flex-1 rounded p-1"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">Dietary restrictions:</label>
              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-zinc-700 p-2 rounded">
                {dietaryRestrictions.map((restriction, index) => (
                  <span
                    key={index}
                    className="bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1"
                  >
                    {restriction}
                    <button
                      onClick={() => handleRemoveChip(index, setDietaryRestrictions)}
                      className="text-white bg-red-500 rounded px-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={currentDietaryRestriction}
                  onChange={(e) => setCurrentDietaryRestriction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddChip(
                        currentDietaryRestriction,
                        dietaryRestrictions,
                        setDietaryRestrictions,
                        setCurrentDietaryRestriction
                      );
                    }
                  }}
                  placeholder="Add restriction"
                  className="dark:bg-zinc-700 dark:text-white flex-1 rounded p-1"
                />
              </div>
            </div>
            <button
              onClick={handleGenerateRecipe}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
            >
              Generate Recipe
            </button>
            {recipeResponse && (
              <div className="mt-4">
                <h2 className="text-lg font-bold">Generated Recipe:</h2>
                <p className="mt-2 dark:bg-zinc-700 p-4 rounded">{recipeResponse}</p>
                <button
                  onClick={handleSaveRecipe}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
                >
                  Save and Post Recipe
                </button>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};
