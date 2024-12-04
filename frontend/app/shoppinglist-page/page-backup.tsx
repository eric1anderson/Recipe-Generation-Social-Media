"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";

const ShoppingListPage = () => {
    const [ingredients, setIngredients] = useState(""); // State to hold fetched ingredients
    const [loading, setLoading] = useState(false); // State to manage loading state for fetching
    const [saving, setSaving] = useState(false); // State to manage saving state for updates

    // Function to retrieve the session token from local storage
    const getSessionToken = () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            alert("Session token is missing. Redirecting to login.");
            window.location.href = "/";
        }
        return token;
    };
    

    // Function to fetch ingredients from the backend
    const fetchIngredients = async () => {
        setLoading(true); // Set loading to true when fetching begins
        try {
            const sessionToken = getSessionToken();
            if (!sessionToken) return; // Exit if no session token is found

            const response = await fetch("http://localhost:5000/shopping_list", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${sessionToken}`, // Include session token in headers
                },
            });
            if (response.ok) {
                const data = await response.json();
                setIngredients(data.shopping_list); // Join ingredients into a single string
            } else {
                console.error("Failed to fetch ingredients");
                alert("Failed to fetch ingredients. Please try again.");
            }
        } catch (error) {
            console.error("Error fetching ingredients:", error);
            alert("An error occurred while fetching ingredients.");
        } finally {
            setLoading(false); // Set loading to false when fetching completes
        }
    };

    // Function to update the shopping list on the backend
    const updateIngredients = async () => {
        setSaving(true); // Set saving to true while updating
        try {
            const sessionToken = getSessionToken();
            if (!sessionToken) return; // Exit if no session token is found

            const response = await fetch("http://localhost:5000/shopping_list", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${sessionToken}`, // Include session token in headers
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ shopping_list: ingredients }), // Send the shopping list as a form-urlencoded body
            });

            if (response.ok) {
                alert("Shopping list updated successfully!");
            } else {
                console.error("Failed to update the shopping list");
                alert("Failed to update the shopping list. Please try again.");
            }
        } catch (error) {
            console.error("Error updating ingredients:", error);
            alert("An error occurred while updating ingredients.");
        } finally {
            setSaving(false); // Set saving to false when the update completes
        }
    };

    // Fetch ingredients when the component mounts
    useEffect(() => {
        getSessionToken();
        fetchIngredients();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-black">
            <Navbar />
            <main className="flex-grow p-12">
                {/* Ingredients Textbox */}
                <div className="dark:bg-zinc-800 p-6 rounded-lg shadow">
                    <h1 className="text-lg font-bold text-white mb-4">Shopping List</h1>
                    <textarea
                        className="w-full h-64 p-4 text-gray-200 bg-black border rounded-lg dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)} // Allow editing
                    />
                    <div className="flex justify-between mt-4">
                        <button
                            className={`py-2 px-4 rounded-lg ${
                                loading
                                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-500"
                            }`}
                            onClick={fetchIngredients}
                            disabled={loading} // Disable the button when loading
                        >
                            {loading ? "Fetching..." : "Fetch Shopping List"}
                        </button>
                        <button
                            className={`py-2 px-4 rounded-lg ${
                                saving
                                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    : "bg-green-600 text-white hover:bg-green-500"
                            }`}
                            onClick={updateIngredients}
                            disabled={saving} // Disable the button when saving
                        >
                            {saving ? "Saving..." : "Save Shopping List"}
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ShoppingListPage;
