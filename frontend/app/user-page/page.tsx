"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DialogBox from "../components/DialogBox"; // Reuse the dialog box component

const UserProfilePage = () => {
  const [userName, setUserName] = useState<string>("");
  const [recipeCount, setRecipeCount] = useState<number>(0);
  const [allergies, setAllergies] = useState<{ AllergyID: string; IngredientName: string }[]>([]);
  const [currentAllergy, setCurrentAllergy] = useState<string>("");
  const [unsavedAllergies, setUnsavedAllergies] = useState<string[]>([]);
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
      setTimeout(() => (window.location.href = "/"), 3000);
    }
    return token;
  };

  // Fetch all allergies on page load
  const fetchAllergies = async () => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/allergiesall", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllergies(data); // Set the entire array of objects with AllergyID and IngredientName
      } else {
        showDialog("Fetch Error", "Failed to fetch allergies. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching allergies:", error);
      showDialog("Error", "An unexpected error occurred. Please try again.");
    }
  };

  // Add a new allergy
  const handleAddAllergy = async () => {
    if (!currentAllergy.trim() || allergies.some((allergy) => allergy.IngredientName === currentAllergy.trim())) {
      return;
    }

    const sessionToken = getSessionToken();
    if (!sessionToken) return;

    const formData = new FormData();
    formData.append("ingredient", currentAllergy.trim());

    try {
      const response = await fetch("http://127.0.0.1:5000/allergies", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newAllergy = await response.json();
        setAllergies((prev) => [...prev, newAllergy]);
        setUnsavedAllergies((prev) => [...prev, currentAllergy.trim()]);
        setCurrentAllergy("");
        showDialog("Success", "Allergy added successfully!");
      } else {
        showDialog("Add Error", "Failed to add allergy. Please try again.");
      }
    } catch (error) {
      console.error("Error adding allergy:", error);
      showDialog("Error", "An unexpected error occurred. Please try again.");
    }
  };

  // Remove an allergy by AllergyID
  const handleRemoveAllergy = async (allergyID: string) => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/allergies/${encodeURIComponent(allergyID)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (response.ok) {
        setAllergies((prev) => prev.filter((allergy) => allergy.AllergyID !== allergyID));
        showDialog("Success", "Allergy removed successfully!");
      } else {
        showDialog("Delete Error", "Failed to remove allergy. Please try again.");
      }
    } catch (error) {
      console.error("Error removing allergy:", error);
      showDialog("Error", "An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUserName(storedUsername);
    }
    fetchAllergies();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <main className="flex-grow p-12">
        <div className="dark:bg-zinc-800 p-6 rounded-lg w-[80%] mx-auto shadow">
          <h1 className="text-lg font-bold text-white mb-4">User Profile</h1>
          <div className="text-white mb-6">
            <p>
              <strong>Name:</strong> {userName}
            </p>
            <p>
              <strong>Number of Recipes:</strong> {recipeCount}
            </p>
          </div>
          <h2 className="text-md font-bold text-white mb-2">Allergies</h2>
          <div className="flex flex-col items-start gap-2 bg-white dark:bg-zinc-700 p-2 rounded mb-4">
            {allergies.map((allergy) => (
              <span
                key={allergy.AllergyID}
                className={`px-2 py-1 rounded flex items-center gap-1 ${
                  unsavedAllergies.includes(allergy.IngredientName) ? "bg-blue-500" : "bg-red-600"
                } text-white`}
              >
                {allergy.IngredientName}
                <button
                  onClick={() => handleRemoveAllergy(allergy.AllergyID)}
                  className="text-white bg-gray-500 rounded px-1"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={currentAllergy}
              onChange={(e) => setCurrentAllergy(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddAllergy();
                }
              }}
              placeholder="Add allergy"
              className="dark:bg-zinc-700 dark:text-white flex-1 rounded p-1"
            />
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

export default UserProfilePage;
