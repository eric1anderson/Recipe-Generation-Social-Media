import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RecipeList from "../components/RecipeList";

const AdminPage = () => {
    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <Navbar />
            <main className="p-4">
                {/* Upload Recipe Section */}
                <div className="m-6 p-6 bg-gray-800 rounded-xl">
                    <h1 className="text-lg font-bold mb-4">Upload New Recipe</h1>
                    <form>
                        <label className="block w-full mb-2 text-sm" htmlFor="recipe-title">
                            Recipe Title
                        </label>
                        <input
                            className="w-full mb-4 p-2 bg-gray-700 rounded-md text-white"
                            type="text"
                            id="recipe-title"
                            name="recipe-title"
                        />
                        
                        <label className="block w-full mb-2 text-sm" htmlFor="recipe-description">
                            Recipe Description
                        </label>
                        <textarea
                            className="w-full mb-4 p-2 bg-gray-700 rounded-md text-white h-24"
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
                <div className="m-6 p-6 bg-gray-800 rounded-xl">
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
