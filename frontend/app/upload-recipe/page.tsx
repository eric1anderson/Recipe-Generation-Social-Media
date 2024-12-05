"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadRecipe() {
    const [recipeTitle, setRecipeTitle] = useState("");
    const [recipeCuisine, setRecipeCuisine] = useState("");
    const [recipeIngredients, setRecipeIngredients] = useState<string[]>([]);
    const [newIngredient, setNewIngredient] = useState("");
    const [recipeContent, setRecipeContent] = useState("");
    const router = useRouter();

    const handleAddIngredient = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && newIngredient.trim() !== "") {
            event.preventDefault();
            setRecipeIngredients([...recipeIngredients, newIngredient]);
            setNewIngredient("");
        }
    };

    const handleUploadRecipe = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const recipeData = {
            title: recipeTitle,
            content: recipeContent,
            ingredients: recipeIngredients,
            cuisine: recipeCuisine,
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
                const data = await response.json();
                const response_social_media = await fetch(`http://127.0.0.1:5000/add_post`, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({recipe_id: data.id}),
                  });
                router.back();
            } else {
                alert("An error occurred while uploading the recipe.");
            }
        } catch (error) {
            console.error("Error uploading recipe:", error);
            alert("An error occurred. Please check your connection and try again.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow p-6">
                <div className="p-6 dark:bg-zinc-800 rounded-lg shadow max-w-2xl mx-auto">
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
                            placeholder="Title"
                            required
                        />

                        <label className="block w-full mb-2 text-sm mt-4" htmlFor="recipe-cuisine">
                            Recipe Cuisine
                        </label>
                        <input
                            className="block w-full px-4 py-2 mb-2 text-gray-200 placeholder-gray-500 bg-white border rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
                            id="recipe-title"
                            name="recipe-cuisine"
                            value={recipeCuisine}
                            onChange={(e) => setRecipeCuisine(e.target.value)}
                            placeholder="Cuisine"
                            required
                        />

                        <label className="block w-full mb-2 text-sm mt-4" htmlFor="recipe-ingredients">
                            Recipe Ingredients
                        </label>
                        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-zinc-700 p-2 rounded mb-2">
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
                        
                        <label className="block w-full mb-2 text-sm mt-4" htmlFor="recipe-description">
                            Recipe Description
                        </label>
                        <textarea
                            className="block w-full px-4 py-2 mb-4 text-gray-200 placeholder-gray-500 bg-white border rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
                            id="recipe-description"
                            name="recipe-description"
                            value={recipeContent}
                            placeholder="Content"
                            onChange={(e) => setRecipeContent(e.target.value)}
                            required
                        />
                        
                        <div className="flex items-center justify-center">
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-2 mt-4"
                                type="submit"
                            >
                                Upload Recipe
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};
