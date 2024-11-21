"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RecipeList from "../components/RecipeList";
import { useState } from "react";
import { useRouter } from "next/router";

const AdminPage = () => {
    const [recipeTitle, setRecipeTitle] = useState("")
    const [recipeContent, setRecipeContent] = useState("")
    const [recipes, setRecipes] = useState([
        { id: "1", title: "Spaghetti Bolognese" },
        { id: "2", title: "Chicken Curry" },
        { id: "3", title: "Vegetable Stir Fry" },
    ]);

    const router = useRouter();

    const handleEditRecipe = (id: string) => {
        router.push(`/edit-recipe-page/${id}`); // Navigate to the edit page with the recipe ID
    };

    const handleDeleteRecipe = async (id: string) => {
        try {
            const response = await fetch(`https://your-backend-url.com/api/recipes/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Recipe deleted successfully!");
                setRecipes(recipes.filter((recipe) => recipe.id !== id)); // Remove the recipe from the state
            } else {
                alert("Failed to delete the recipe. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting recipe:", error);
            alert("An error occurred. Please check your connection and try again.");
        }
    };

    const handleUploadRecipe = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // prevent page reload on form submission

        const recipeData = {
            title: recipeTitle,
            content: recipeContent
        };

        try {
            const resp = await fetch("", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(recipeData)
            });

            if(resp.ok) {
                // Clear the input fields
                setRecipeTitle("");
                setRecipeContent("")
            } else {
                alert("Failed to upload recipe. Please try again.");
            }
        } catch(err) {
            console.error("Error uploading recipe: ", err);
        } 
    }

    return (
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
                            key={recipe.id}
                            id={recipe.id}
                            title={recipe.title}
                            onEdit={handleEditRecipe}
                            onDelete={handleDeleteRecipe} // Pass the delete handler
                        />
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminPage;
