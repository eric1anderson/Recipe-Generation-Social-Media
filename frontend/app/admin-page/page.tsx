"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import RecipeList from "../components/RecipeList";

const AdminPage = () => {
    const [recipeTitle, setRecipeTitle] = useState("Title");
    const [recipeIngredients, setRecipeIngredients] = useState<string[]>([]);
    const [newIngredient, setNewIngredient] = useState("");
    const [recipeContent, setRecipeContent] = useState("Contents");
    const [recipes, setRecipes] = useState<any[]>([]);
    const router = useRouter();
    const fetchRecipes = async (setRecipes: React.Dispatch<React.SetStateAction<any[]>>) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/recipesall", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setRecipes(data);
            } else {
                alert("Failed to fetch recipes. Please try again.");
            }
        } catch (error) {
            console.error("Error fetching recipes:", error);
            alert("An error occurred. Please check your connection and try again.");
        }
    };

    useEffect(() => {
        fetchRecipes(setRecipes);
    }, []);

    const handleEditRecipe = (id: string) => {
        router.push(`/edit-recipe-page/?id=${id}`); // Navigate to the edit page
    };

    const handleDeleteRecipe = async (id: string) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/recipes/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });

            if (response.ok) {
                alert("Recipe deleted successfully!");
                setRecipes(recipes.filter((recipe) => recipe.RecipeID !== id)); // Remove the recipe from the state
            } else {
                alert("Failed to delete the recipe. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting recipe:", error);
            alert("An error occurred. Please check your connection and try again.");
        }
    };

    const handleAddIngredient = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && newIngredient.trim() !== "") {
            event.preventDefault();
            setRecipeIngredients([...recipeIngredients, newIngredient]);
            setNewIngredient("");
        }
    };

    const handleUploadRecipe = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // prevent page reload on form submission

        const recipeData = {
            title: recipeTitle,
            content: recipeContent,
            ingredients: recipeIngredients, // Pass the list of ingredients
            userGenerated: false,
        };

        try {
            const response = await fetch("http://127.0.0.1:5000/recipes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify(recipeData),
            });

            if (response.ok) {
                alert("Recipe uploaded successfully!");
                fetchRecipes(setRecipes); // Fetch the updated list of recipes
            } else {
                alert("Failed to upload recipe. Please try again.");
            }
        } catch (error) {
            console.error("Error uploading recipe:", error);
            alert("An error occurred. Please check your connection and try again.");
        }
    };

    return (
        <ProtectedRoute allowedRoles={[false]}>
            <div className="min-h-screen text-white">
                <Navbar />
                <main className="p-4">
                    {/* Upload Recipe Section */}
                    <div className="m-6 p-6 dark:bg-zinc-800 rounded-xl">
                        <h1 className="text-lg font-bold mb-4">Upload New Recipe</h1>
                        <form onSubmit={handleUploadRecipe}>
                            <label className="block w-full mb-2 text-sm" htmlFor="recipe-title">
                                Recipe Title
                            </label>
                            <input
                                className="block w-full px-4 py-2 mb-2 text-gray-200 placeholder-gray-500 bg-white border rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
                                id="recipe-title"
                                name="recipe-title"
                                value={recipeTitle}
                                onChange={(e) => setRecipeTitle(e.target.value)}
                                required
                            />

                            <label className="block w-full mb-2 text-sm" htmlFor="recipe-ingredients">
                                Recipe Ingredients
                            </label>
                            <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-zinc-700 p-2 rounded">
                                {recipeIngredients.map((ingredient, index) => (
                                    <span
                                        key={index}
                                        className="bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1"
                                    >
                                        {ingredient}
                                        <button
                                            onClick={() => setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index))}
                                            className="text-white bg-red-500 rounded px-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={newIngredient}
                                    onChange={(e) => setNewIngredient(e.target.value)}
                                    onKeyDown={handleAddIngredient}
                                    placeholder="Add ingredient"
                                    className="dark:bg-zinc-700 dark:text-white flex-1 rounded p-1"
                                />
                            </div>
                            
                            <label className="block w-full mb-2 text-sm" htmlFor="recipe-description">
                                Recipe Description
                            </label>
                            <textarea
                                className="block w-full px-4 py-2 mb-2 text-gray-200 placeholder-gray-500 bg-white border rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
                                id="recipe-description"
                                name="recipe-description"
                                value={recipeContent}
                                onChange={(e) => setRecipeContent(e.target.value)}
                                required
                            />
                            
                            <button
                                className="w-full py-2 bg-green-600 rounded-full hover:bg-green-500"
                                type="submit"
                            >
                                Upload Recipe
                            </button>
                        </form>
                    </div>

                    {/* Manage Recipes Section */}
                    <div className="m-6 p-6 dark:bg-zinc-800 rounded-xl">
                        <h1 className="text-lg font-bold mb-4">Manage Existing Recipes</h1>
                        {recipes.map((recipe) => (
                            <RecipeList
                                key={recipe.RecipeID}
                                id={recipe.RecipeID}
                                title={recipe.RecipeName}
                                onEdit={handleEditRecipe}
                                onDelete={handleDeleteRecipe} // Pass the delete handler
                            />
                        ))}
                    </div>
                </main>
                <Footer />
            </div>
        </ProtectedRoute>
    );
};

export default AdminPage;