import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RecipeList from "../components/RecipeList";

const AdminPage = () => {
    return (
        <div className="min-h-screen text-white">
            <Navbar />
            <main className="p-4">
                {/* Upload Recipe Section */}
                <div className="m-6 p-6 dark:bg-zinc-800 rounded-xl">
                    <h1 className="text-lg font-bold mb-4">Upload New Recipe</h1>
                    <form>
                        <label className="block w-full mb-2 text-sm" htmlFor="recipe-title">
                            Recipe Title
                        </label>
                        <input
                            className="block w-full px-4 py-2 mb-2 text-gray-200 placeholder-gray-500 bg-white border rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
                            type="text"
                            id="recipe-title"
                            name="recipe-title"
                        />
                        
                        <label className="block w-full mb-2 text-sm" htmlFor="recipe-description">
                            Recipe Description
                        </label>
                        <textarea
                            className="block w-full px-4 py-2 mb-2 text-gray-200 placeholder-gray-500 bg-white border rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
                            id="recipe-description"
                            name="recipe-description"
                        />
                        
                        <button
                            className="w-full py-2 bg-green-600 rounded-full hover:bg-green-500"
                            type="submit"
                        >
                            Upload Recipe
                        </button>
                    </form>
                </div>

                {/* Manage Recipes Section */}
                <div className="m-6 p-6 dark:bg-zinc-800 rounded-xl">
                    <h1 className="text-lg font-bold mb-4">Manage Existing Recipes</h1>
                    <RecipeList />
                    <RecipeList />
                    <RecipeList />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminPage;
