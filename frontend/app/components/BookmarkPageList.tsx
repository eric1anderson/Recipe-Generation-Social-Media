"use client";

import { Bookmark } from "../types"
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { truncateContent } from "../utils/utils";
import DialogBox from "./DialogBox";

const API_BASE_URL = "http://127.0.0.1:5000";

const RecipePageList = ({ bookmark }: { bookmark: Bookmark }) => {
    const router = useRouter();
    const {SMID, Recipe, BookmarkID} = bookmark;
    const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "" });

    const showDialog = (title: string, message: string) => {
        setDialog({ isOpen: true, title, message });
    };

    const closeDialog = () => {
        setDialog({ isOpen: false, title: "", message: "" });
    };

    const handleAddtoShoppingList = async (recipeId: string) => {
        try {
          const response = await fetch(`http://127.0.0.1:5000/add_to_shopping_list/${recipeId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`
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

    return (
        <div 
            className="dark:bg-zinc-800 text-white rounded-lg shadow p-6 flex flex-col gap-4 relative hover:cursor-pointer hover:bg-zinc-700 transition-colors duration-300"
            onClick={() => router.push(`/recipe/${SMID}`)}
        >
            {/* Recipe Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{Recipe.RecipeName}</h2>
            </div>
            {/* Recipe Content */}
            <div className="flex flex-col gap-6">
                <div className="flex gap-6">
                    <ReactMarkdown className="mt-2">
                        {truncateContent(Recipe.RecipeContent, 3)}
                    </ReactMarkdown>
                </div>
                {/* Add to Shopping List Button */}
                <div className="flex justify-end">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => handleAddtoShoppingList(Recipe.RecipeID)}
                    >
                        Add to Shopping List
                    </button>
                </div>
            </div>
            <DialogBox
                isOpen={dialog.isOpen}
                title={dialog.title}
                message={dialog.message}
                onClose={closeDialog}
            />
        </div>
    );
};

export default RecipePageList;
