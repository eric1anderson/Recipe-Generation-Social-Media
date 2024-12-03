"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import React, { useState } from "react";

const UploadRecipePage = () => {
    // State to manage form inputs
    const [recipeTitle, setRecipeTitle] = useState("");
    const [recipeContent, setRecipeContent] = useState(
        ""
    );

    const handleUpdate = () => {
        // Add logic to handle the recipe update
        console.log("Updating Recipe:", { recipeTitle, recipeContent });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow p-6 text-white">
                <div className="max-w-4xl mx-auto dark:bg-zinc-800 p-6 rounded-lg shadow-lg">
                    {/* Recipe Image */}
                    <div className="mb-6 flex justify-center">
                        <img
                            src="https://via.placeholder.com/300"
                            alt="Recipe"
                            className="w-100 h-100 object-cover rounded-lg"
                        />
                    </div>

                    {/* Edit Form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdate();
                        }}
                        className="space-y-6"
                    >
                        {/* Recipe Title */}
                        <div>
                            <label
                                htmlFor="recipe-title"
                                className="block text-sm font-semibold mb-2"
                            >
                                Recipe Title
                            </label>
                            <input
                                id="recipe-title"
                                type="text"
                                value={recipeTitle}
                                onChange={(e) => setRecipeTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-white text-black border rounded-lg focus:ring focus:ring-blue-400 focus:outline-none"
                            />
                        </div>

                        {/* Recipe Content */}
                        <div>
                            <label
                                htmlFor="recipe-content"
                                className="block text-sm font-semibold mb-2"
                            >
                                Recipe Content
                            </label>
                            <textarea
                                id="recipe-content"
                                value={recipeContent}
                                onChange={(e) => setRecipeContent(e.target.value)}
                                className="w-full h-32 px-4 py-2 bg-white text-black border rounded-lg focus:ring focus:ring-blue-400 focus:outline-none"
                            ></textarea>
                        </div>

                        {/* Upload Button */}
                        <div className="text-center">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
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

export default UploadRecipePage;
