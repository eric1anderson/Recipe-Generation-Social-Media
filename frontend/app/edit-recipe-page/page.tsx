"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import DialogBox from "../components/DialogBox";

const EditRecipePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [recipeTitle, setRecipeTitle] = useState("");
    const [recipeContent, setRecipeContent] = useState("");
    const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "" });

    const showDialog = (title: string, message: string) => {
        setDialog({ isOpen: true, title, message });
    };

    const closeDialog = () => {
        setDialog({ isOpen: false, title: "", message: "" });
    };

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/recipes/${id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setRecipeTitle(data.RecipeName);
                    setRecipeContent(data.RecipeContent);
                } else {
                    showDialog("Error", "Failed to fetch recipe. Please try again");
                }
            } catch (error) {
                console.error("Error fetching recipe:", error);
                showDialog("Error", "An error occurred. Please check your connection and try again.");
            }
        };
        if (id) {
            fetchRecipe();
        }
    }, [id]);

    const handleUpdateRecipe = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const recipeData = {
            title: recipeTitle,
            content: recipeContent,
        };

        try {
            const response = await fetch(`http://127.0.0.1:5000/recipes/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
                body: JSON.stringify(recipeData),
            });

            if (response.ok) {
                showDialog("Success", "Recipe updated successfully!");
                router.push("/admin");
            } else {
                showDialog("Error", "Failed to update recipe. Please try again.");
            }
        } catch (error) {
            console.error("Error updating recipe:", error);
            showDialog("Error", "An error occurred. Please check your connection and try again.");
        }
    };

    return (
        <ProtectedRoute allowedRoles={[false]}>
            <div className="min-h-screen text-white">
                <Navbar />
                <main className="p-4">
                    <div className="m-6 p-6 dark:bg-zinc-800 rounded-xl">
                        <h1 className="text-lg font-bold mb-4">Edit Recipe</h1>
                        <form onSubmit={handleUpdateRecipe}>
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
                            
                            <label className="block w-full mt-4 mb-2 text-sm" htmlFor="recipe-description">
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
                                className="w-full py-2 mt-4 bg-green-600 rounded-full hover:bg-green-500"
                                type="submit"
                            >
                                Update Recipe
                            </button>
                        </form>
                    </div>
                </main>
                <DialogBox
                    isOpen={dialog.isOpen}
                    title={dialog.title}
                    message={dialog.message}
                    onClose={closeDialog}
                />
                <Footer />
            </div>
        </ProtectedRoute>
    );
};


export default EditRecipePage;
