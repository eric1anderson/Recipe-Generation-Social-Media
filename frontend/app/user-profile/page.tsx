"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DialogBox from "../components/DialogBox"; // Reuse the dialog box component

const UserProfilePage = () => {
  const [userName, setUserName] = useState<string>("");
  const [recipeCount, setRecipeCount] = useState<number>(0);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergies, setNewAllergies] = useState<string[]>([]);
  const [currentAllergy, setCurrentAllergy] = useState<string>("");
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
      setTimeout(() => (window.location.href = "/"), 2000); // Redirect after 2 seconds
    }
    return token;
  };

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      const sessionToken = getSessionToken();
      if (!sessionToken) return;

      const response = await fetch("http://127.0.0.1:5000/user_profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserName(data.name || "Unknown User");
        setRecipeCount(data.recipe_count || 0);
        setAllergies(data.allergies || []);
      } else {
        showDialog("Fetch Error", "Failed to fetch user details. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Update allergies
  const updateAllergies = async () => {
    setSaving(true);
    try {
      const sessionToken = getSessionToken();
      if (!sessionToken || newAllergies.length === 0) return;

      const serializedAllergies = newAllergies.join("\n");

      const response = await fetch("http://127.0.0.1:5000/user_allergies", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ allergies: serializedAllergies }),
      });

      if (response.ok) {
        showDialog("Success", "Allergy preferences updated successfully!");
        setNewAllergies([]);
      } else {
        showDialog("Update Error", "Failed to update allergy preferences. Please try again.");
      }
    } catch (error) {
      console.error("Error updating allergies:", error);
    } finally {
      setSaving(false);
    }
  };

  // Add a new allergy
  const handleAddAllergy = () => {
    if (currentAllergy.trim() && !allergies.includes(currentAllergy.trim())) {
      setAllergies((prev) => [...prev, currentAllergy.trim()]);
      setNewAllergies((prev) => [...prev, currentAllergy.trim()]);
      setCurrentAllergy("");
    }
  };

  // Remove an allergy
  const handleRemoveAllergy = (index: number) => {
    const allergyToRemove = allergies[index];
    setAllergies((prev) => prev.filter((_, i) => i !== index));
    setNewAllergies((prev) => prev.filter((item) => item !== allergyToRemove));
  };

  useEffect(() => {
    getSessionToken();
    fetchUserDetails();
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
            {allergies.map((allergy, index) => (
              <span
                key={index}
                className="bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1"
              >
                {allergy}
                <button
                  onClick={() => handleRemoveAllergy(index)}
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
          <div className="flex justify-center mt-4">
            <button
              className={`py-2 px-4 w-[60%] rounded-lg ${
                saving
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-500"
              }`}
              onClick={updateAllergies}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Preferences"}
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

export default UserProfilePage;