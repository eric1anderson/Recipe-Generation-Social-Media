"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DialogBox from "../components/DialogBox";

const UserProfilePage = () => {
  const [userName, setUserName] = useState<string>("");
  const [recipeCount, setRecipeCount] = useState<number>(0);
  const [allergies, setAllergies] = useState<{ AllergyID: string; IngredientName: string }[]>([]);
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
      setTimeout(() => (window.location.href = "/"), 2000);
    }
    return token;
  };

  const fetchAllergies = async () => {
    try {
      const sessionToken = getSessionToken();
      if (!sessionToken) return;

      const response = await fetch("http://127.0.0.1:5000/allergiesall", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllergies(data);
      } else {
        showDialog("Fetch Error", "Failed to fetch allergies. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching allergies:", error);
    }
  };

  const updateAllergies = async () => {
    setSaving(true);
    try {
      const sessionToken = getSessionToken();
      if (!sessionToken || newAllergies.length === 0) return;

      const promises = newAllergies.map((allergy) =>
        fetch(`http://127.0.0.1:5000/allergies?ingredient=${encodeURIComponent(allergy)}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
        })
      );

      await Promise.all(promises);
      showDialog("Success", "Allergic ingredients saved successfully!");
      setNewAllergies([]);
    } catch (error) {
      console.error("Error saving allergies:", error);
      showDialog("Error", "Failed to save allergic ingredients. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAllergy = () => {
    if (
      currentAllergy.trim() &&
      !allergies.some((allergy) => allergy.IngredientName === currentAllergy.trim())
    ) {
      setAllergies((prev) => [
        ...prev,
        { AllergyID: `temp-${Date.now()}`, IngredientName: currentAllergy.trim() },
      ]);
      setNewAllergies((prev) => [...prev, currentAllergy.trim()]);
      setCurrentAllergy("");
    }
  };

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
        setNewAllergies((prev) => prev.filter((allergy) => allergy !== allergyID));
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
            {allergies.map((allergy, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded flex items-center gap-1 ${
                  newAllergies.includes(allergy.IngredientName) ? "bg-blue-500" : "bg-red-600"
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
          <div className="flex justify-center mt-4">
            <button
              className={`py-2 px-4 w-[60%] rounded-lg ${
                saving
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-500"
              }`}
              onClick={updateAllergies}
              disabled={saving || newAllergies.length === 0}
            >
              {saving ? "Saving..." : "Save Allergies"}
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
