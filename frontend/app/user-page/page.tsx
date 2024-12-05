"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DialogBox from "../components/DialogBox";
import RecipePageList from "../components/RecipePageList";
import ProtectedRoute from "../components/ProtectedRoute";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Post } from "../types";

const API_BASE_URL = "http://127.0.0.1:5000";

export default function UserPage() {

    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedCuisine, setSelectedCuisine] = useState("");

    const router = useRouter();

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch(`${API_BASE_URL}/posts`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data.posts);
                    console.log(data);
                }
            }
            catch (err) {
                console.error("Failed to fetch recipes:", err);
            }
        }
        fetchRecipes();
    }, []);

    const handleCuisineChange = (event: any) => {
        setSelectedCuisine(event.target.value);
    };
    
    const filteredPosts = selectedCuisine
        ? posts.filter((post) => post.Recipe.Cuisine === selectedCuisine)
        : posts;

    return (
        <ProtectedRoute allowedRoles={[true]}>
            <div className="min-h-screen flex flex-col bg-black">
                <Navbar />
                    <main className="flex-grow p-6">
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-end mb-4">
                                <select
                                    value={selectedCuisine}
                                    onChange={handleCuisineChange}
                                    className="bg-zinc-800 text-white px-4 py-2 rounded"
                                >
                                <option value="">All Cuisines</option>
                                {Array.from(new Set(posts.map((post) => post.Recipe.Cuisine)))
                                    .filter(Boolean)
                                    .map((cuisine, index) => (
                                    <option key={index} value={cuisine}>
                                        {cuisine}
                                    </option>
                                ))}
                                </select>
                            </div>
                
                            {/* Posts Section */}
                            <div className="flex gap-6">
                                <div className="flex flex-col w-full lg:w-2/3 gap-4">
                                    {filteredPosts.length > 0 ? (
                                        filteredPosts.map((post) => (
                                        <div key={post.SMID}>
                                            <RecipePageList post={post} />
                                        </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400">No posts found for this cuisine.</p>
                                    )}
                                </div>
                
                                {/* Generate Recipe Section */}
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
                        </div>
                    </main>
                <Footer />
            </div>
        </ProtectedRoute>
        );
    };
    