"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import ReactMarkdown from "react-markdown";

export default function GenerateRecipe() {
  const [question, setQuestion] = useState<string>("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState<string>("");
  const [currentIngredient, setCurrentIngredient] = useState<string>("");
  const [currentDietaryRestriction, setCurrentDietaryRestriction] = useState<string>("");
  const [recipeResponse, setRecipeResponse] = useState<{
    title: string;
    content: string;
    ingredients: string[];
    userGenerated: boolean;
    cuisine: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/generate-recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          question,
          ingredients,
          dietary_restrictions: dietaryRestrictions,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setRecipeResponse({
          title: data.title,
          content: data.content,
          ingredients: data.ingredients,
          userGenerated: data.userGenerated,
          cuisine: data.cuisine,
        });
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to generate recipe. Please try again.");
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    await handleSaveRecipe();
  };
  
  const handleReject = () => {
    router.push("/user-page");
  };

  const handleSaveRecipe = async () => {
    try {
      console.log(recipeResponse);
      const response = await fetch("http://127.0.0.1:5000/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(recipeResponse),
      });

      if (response.ok) {
        const data = await response.json();
        const response_social_media = await fetch(`http://127.0.0.1:5000/add_post`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({recipe_id: data.id}),
        });
        router.push("/user-page");
      } else {
        const errorData = await response.json();
        alert("Failed to save recipe.");
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
            <div className="mb-6">
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
            <div className="flex items-center justify-center">
              {loading ? (
                <div className="flex justify-center animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
              ) : (recipeResponse == null &&
                <button
                  onClick={handleGenerateRecipe}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-2 mt-4"
                >
                  Generate Recipe
                </button>
              )}
            </div>
            {recipeResponse && (
              <div className="recipe-response dark:bg-zinc-700 mt-4 p-4 bg-gray-100 rounded shadow">
                <h2 className="text-xl font-bold">{recipeResponse.title}</h2>
                <ReactMarkdown className="mt-2">{recipeResponse.content}</ReactMarkdown>
                <h3 className="mt-4 font-semibold">Ingredients:</h3>
                <ul className="list-disc list-inside">
                  {Array.isArray(recipeResponse.ingredients) && recipeResponse.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={handleApprove}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
};
