"use client";

import { useRouter } from "next/navigation";

const Navbar = () => {
    const router = useRouter();

    const handleLogout = async () => {
        try {    
            localStorage.removeItem("access_token");
    
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
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
                    <li className="mx-4 text-white hover:text-gray-300 cursor-pointer"><a href="http://localhost:3000/recipe-page">Recipes</a></li>
                    <li className="mx-4 text-white hover:text-gray-300 cursor-pointer"><a href="http://localhost:3000/shoppinglist-page">Shopping List</a></li>
                    <li 
                        className="mx-4 text-white hover:text-gray-300 cursor-pointer"
                        onClick={handleLogout}
                    >
                        Logout
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
