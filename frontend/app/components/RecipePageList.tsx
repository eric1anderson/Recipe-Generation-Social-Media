"use client";
import {Post} from "../types"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
const API_BASE_URL = "http://127.0.0.1:5000";

const RecipePageList = ({ post }: { post: Post }) => {
    const router = useRouter();
    const {SMID, Recipe} = post;
    const [likes, setLikes] = useState<number>(post.Likes);
    const handleLike = async () => {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_BASE_URL}/like_post/${SMID}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            setLikes(data.Likes);
        }
    }
    return (
        <div className="dark:bg-zinc-800 text-white rounded-lg shadow p-6 flex flex-col gap-4 relative">
            {/* Recipe Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" onClick={()=>router.push(`/recipe-page/${post.SMID}`)}>{Recipe.RecipeName}</h2>
                <div className="space-x-4">
                    <button className="bg-white text-black px-4 py-2 rounded hover:bg-gray-400" onClick={handleLike}>
                        Like
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Bookmark
                    </button>
                </div>
            </div>
            {/* Recipe Content */}
            <div className="flex flex-col gap-6">
                <div className="flex gap-6">
                    <img
                        src="https://via.placeholder.com/200"
                        alt="Recipe"
                        className="w-1/2 rounded-lg"
                    />
                    <p>
                        {Recipe.RecipeContent}
                    </p>
                </div>
                {/* Add to Shopping List Button */}
                <div className="flex justify-end">
                    <button
                        className="bg-blue-600 text-white px-6 py-3 rounded shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => alert("Ingredients added to shopping list!")}
                    >
                        Add to Shopping List
                    </button>
                </div>
                <div>
                    {likes} Likes
                </div>
            </div>
        </div>
    );
};

export default RecipePageList;
