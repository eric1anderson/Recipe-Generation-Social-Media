"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";
import RecipeList from "../components/RecipeList";

const AdminPage = () => {
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

    return (
        <ProtectedRoute allowedRoles={[false]}>
            <div className="min-h-screen text-white">
                <Navbar />
                <main className="p-4">
                    <div className="m-6 p-6 dark:bg-zinc-800 rounded-xl">
                        <h1 className="text-lg font-bold mb-4">Manage Existing Recipes</h1>
                        {recipes.map((recipe) => (
                            <RecipeList
                                key={recipe.RecipeID}
                                id={recipe.RecipeID}
                                title={recipe.RecipeName}
                                onEdit={handleEditRecipe}
                                onDelete={handleDeleteRecipe}
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