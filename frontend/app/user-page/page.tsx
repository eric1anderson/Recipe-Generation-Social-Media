import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RecipePageList from "../components/RecipePageList";
import ProtectedRoute from "../components/ProtectedRoute";

const UserPage = () => {
    return (
        <ProtectedRoute allowedRoles={[true]}>
            <div className="min-h-screen flex flex-col bg-black">
                <Navbar />
                <main className="flex-grow p-6">
                    {/* Main Section */}
                    <div className="flex gap-6">
                        {/* Left Column: RecipePageLists */}
                        <div className="flex flex-col w-full lg:w-2/3 gap-4">
                            <RecipePageList />
                            <RecipePageList />
                            <RecipePageList />
                        </div>

                        {/* Right Column: Generate New Recipe Div */}
                        <div
                            className="dark:bg-zinc-800 text-white rounded-lg shadow p-6 w-full lg:w-1/3 h-[200px] sticky top-[4.5rem] flex flex-col justify-between"
                        >
                            <h2 className="text-xl font-bold">Generate a New Recipe</h2>
                            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                Generate Recipe
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </ProtectedRoute>
    );
};

export default UserPage;
