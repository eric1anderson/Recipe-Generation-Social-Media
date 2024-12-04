"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DialogBox from "../components/DialogBox";
import { useState, useEffect } from "react";

const ShoppingListPage = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState({ isOpen: false, title: "", message: "" });

  const showDialog = (title: string, message: string) => {
    setDialog({ isOpen: true, title, message });
  };

  const closeDialog = () => {
    setDialog({ isOpen: false, title: "", message: "" });
  };

  const getSessionToken = (): string | null => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      showDialog("Session Error", "Session token is missing. Redirecting to login.");
      setTimeout(() => (window.location.href = "/"), 2000);
    }
    return token;
  };

  const fetchIngredients = async () => {
    try {
      const sessionToken = getSessionToken();
      if (!sessionToken) return;

      const response = await fetch("http://127.0.0.1:5000/shopping_list", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIngredients(data.shopping_list || []);
      } else {
        showDialog("Fetch Error", "Failed to fetch ingredients. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  const updateIngredients = async () => {
    setSaving(true);
    try {
      const sessionToken = getSessionToken();
      if (!sessionToken) return;

      const serializedIngredients = ingredients.join("\n");

      const response = await fetch("http://127.0.0.1:5000/shopping_list", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ shopping_list: serializedIngredients }),
      });

      if (response.ok) {
        showDialog("Success", "Shopping list updated successfully!");
      } else {
        showDialog("Update Error", "Failed to update the shopping list. Please try again.");
      }
    } catch (error) {
      console.error("Error updating ingredients:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    getSessionToken();
    fetchIngredients();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <main className="flex-grow p-12">
        <div className="dark:bg-zinc-800 p-6 rounded-lg w-[80%] mx-auto shadow">
          <h1 className="text-lg font-bold text-white mb-4">Shopping List</h1>
          <textarea
            value={ingredients.join("\n")}
            onChange={(e) => setIngredients(e.target.value.split("\n"))}
            rows={10}
            className="w-full dark:bg-zinc-700 dark:text-white rounded p-2"
            placeholder="Enter your shopping list, one item per line"
          ></textarea>
          <div className="flex justify-center mt-4">
            <button
              className={`py-2 px-4 w-[60%] rounded-lg ${
                saving
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-500"
              }`}
              onClick={updateIngredients}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Shopping List"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
      <DialogBox
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        onClose={closeDialog}
      />
    </div>
  );
};

export default ShoppingListPage;
