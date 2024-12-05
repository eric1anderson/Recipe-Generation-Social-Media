"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Navbar = () => {
    const router = useRouter();
    const [userName, setUserName] = useState(() => {
        const storedUserName = localStorage.getItem("username");
        return storedUserName || ""; // Initialize state only once
    });
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = async () => {
        try {
            localStorage.removeItem("access_token");
            localStorage.removeItem("username");
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    return (
        <nav className="w-full flex flex-wrap dark:bg-zinc-800 justify-between sticky top-0 z-10">
            <div className="w-1/5 ml-6 my-4">
                <a href="http://localhost:3000/user-page">
                    <h1 className="text-xl font-bold text-white">Recipe App</h1>
                </a>
            </div>
            <div className="flex items-center ml-auto mr-6">
                <ul className="flex list-none m-0 p-0">
                    <li className="mx-4 text-white hover:text-gray-300 cursor-pointer"><a href="http://localhost:3000/upload-recipe-page">Upload Recipe</a></li>
                    <li className="mx-4 text-white hover:text-gray-300 cursor-pointer"><a href="http://localhost:3000/bookmarks">Bookmarks</a></li>
                    <li className="mx-4 text-white hover:text-gray-300 cursor-pointer"><a href="http://localhost:3000/shoppinglist-page">Shopping List</a></li>
                    <li className="relative mx-4 text-white">
                        <button onClick={toggleDropdown} className="hover:text-gray-300 cursor-pointer">Hi, {userName || "Guest"}</button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 dark:bg-zinc-800 rounded shadow-lg">
                                <ul className="py-2">
                                    <li className="px-4 py-2 hover:text-gray-300 cursor-pointer" onClick={() => router.push("/user-profile")}>Profile</li>
                                    <li className="px-4 py-2 hover:text-gray-300 cursor-pointer" onClick={handleLogout}>Logout</li>
                                </ul>
                            </div>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
