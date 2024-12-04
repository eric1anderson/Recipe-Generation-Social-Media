"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DialogBox from "../components/DialogBox";
import RecipePageList from "../components/RecipePageList";
import ProtectedRoute from "../components/ProtectedRoute";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Recipe {
  SMID: string | null;
  RecipeID: string;
  RecipeName: string;
  RecipeContent: string;
  UserID: string;
  Likes: number;
}

export default function UserPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "" });

  const showDialog = (title: string, message: string) => {
    setDialog({ isOpen: true, title, message });
  };

  const closeDialog = () => {
    setDialog({ isOpen: false, title: "", message: "" });
  };

  const getSessionToken = (): string | null => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      showDialog("Session Error", "Session token is missing. Redirecting to login.");
      setTimeout(() => (window.location.href = "/"), 3000); // Redirect after 2 seconds
    }
    return token;
  };

  const fetchRecipes = async () => {
    const sessionToken = getSessionToken();
    try {
      const response = await fetch("http://127.0.0.1:5000/posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setRecipes(data.posts);
      } else {
        console.error("Failed to fetch recipes.");
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddtoShoppingList = async (recipeId: string) => {
    const sessionToken = getSessionToken();
    try {
      const response = await fetch(`http://127.0.0.1:5000/add_to_shopping_list/${recipeId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        showDialog("Success", data.message || "Ingredients added to shopping list!");
      } else {
        console.error("Failed to add ingredients to shopping list.");
        showDialog("Error", "Failed to add ingredients. Please try again.");
      }
    } catch (error) {
      console.error("Error adding ingredients to shopping list:", error);
      showDialog("Error", "An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    getSessionToken();
    fetchRecipes();
  }, []);

  return (
    <ProtectedRoute allowedRoles={[true]}>
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />
        <main className="flex-grow p-6">
          <div className="flex gap-6">
            <div className="flex flex-col w-full lg:w-2/3 gap-4">
              {loading ? (
                <p className="text-white">Loading recipes...</p>
              ) : (
                recipes.map((recipe) => (
                  <RecipePageList
                    key={recipe.RecipeID}
                    recipeName={recipe.RecipeName}
                    recipeContent={recipe.RecipeContent}
                    likes={recipe.Likes}
                    onAddToShoppingList={() => handleAddtoShoppingList(recipe.RecipeID)}
                  />
                ))
              )}
            </div>
            <div
              className="dark:bg-zinc-800 text-white rounded-lg shadow p-6 w-full lg:w-1/3 h-[200px] sticky top-[4.5rem] flex flex-col justify-between"
            >
              <h2 className="text-xl font-bold">Generate a New Recipe</h2>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => router.push("/generate-recipe")}
              >
                Generate Recipe
              </button>
            </div>
          </div>
        </main>
        <Footer />
        <DialogBox
          isOpen={dialog.isOpen}
          title={dialog.title}
          message={dialog.message}
          onClose={closeDialog}
        />
      </div>
    </ProtectedRoute>
  );
}
