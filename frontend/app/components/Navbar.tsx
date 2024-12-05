"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Navbar = () => {
    const router = useRouter();
    const [userName, setUserName] = useState<string>("");
    const [isAdmin, setIsAdmin] = useState<boolean>(false); // State to track if user is an admin
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    useEffect(() => {
        // Access localStorage only in the client-side effect
        const storedUserName = localStorage.getItem("username");
        const storedRole = localStorage.getItem("role"); // "false" for Admin
        if (storedUserName) {
            setUserName(storedUserName);
        }
        setIsAdmin(storedRole === "false"); // Set to true if role is "false"
    }, []);

    const handleLogout = async () => {
        try {
            localStorage.removeItem("access_token");
            localStorage.removeItem("username");
            localStorage.removeItem("role");
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className="w-full flex flex-wrap dark:bg-zinc-800 justify-between sticky top-0 z-10">
            <div className="w-1/5 ml-6 my-4">
                <a href="/user-page">
                    <h1 className="text-xl font-bold text-white">Recipe App</h1>
                </a>
            </div>
            <div className="flex items-center ml-auto mr-6 relative">
                <ul className="flex list-none m-0 p-0">
                    {/* If user is Admin (isAdmin is true), show only Upload Recipe and Logout */}
                    {isAdmin ? (
                        <>
                            <li className="mx-4 text-white hover:text-gray-300 cursor-pointer">
                                <a href="/upload-recipe-page">Upload Recipe</a>
                            </li>
                            <li
                                className="mx-4 text-white hover:text-gray-300 cursor-pointer"
                                onClick={handleLogout}
                            >
                                Logout
                            </li>
                        </>
                    ) : (
                        /* If not Admin, display the full menu */
                        <>
                            <li className="mx-4 text-white hover:text-gray-300 cursor-pointer">
                                <a href="/upload-recipe-page">Upload Recipe</a>
                            </li>
                            <li className="mx-4 text-white hover:text-gray-300 cursor-pointer">
                                <a href="/bookmarks">Bookmarks</a>
                            </li>
                            <li className="mx-4 text-white hover:text-gray-300 cursor-pointer">
                                <a href="/shoppinglist-page">Shopping List</a>
                            </li>
                            <li className="relative mx-4 text-white">
                                <button
                                    onClick={() => setDropdownOpen((prev) => !prev)}
                                    className="hover:text-gray-300 cursor-pointer"
                                >
                                    Hi, {userName || "Guest"}
                                </button>
                                {dropdownOpen && (
                                    <ul className="absolute right-0 bg-white dark:bg-gray-700 rounded-md shadow-lg mt-2">
                                        <li
                                            className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                                            onClick={() => router.push("/user-profile")}
                                        >
                                            Profile
                                        </li>
                                        <li
                                            className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                                            onClick={handleLogout}
                                        >
                                            Logout
                                        </li>
                                    </ul>
                                )}
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
