import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CommentList from "../components/CommentList";
import ProtectedRoute from "../components/ProtectedRoute";

const UserPage = () => {    
    return (
        <ProtectedRoute allowedRoles={[true]}>
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow p-6">
                    {/* Main Section */}
                    <div className="flex flex-wrap lg:flex-nowrap gap-6">
                        {/* Recipe Div */}
                        <div className="dark:bg-zinc-800 text-white rounded-lg shadow p-6 flex flex-col w-full lg:w-2/3">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Spaghetti Bolognese</h2>
                                <div className="space-x-4">
                                    <button className="bg-white text-black px-4 py-2 rounded hover:bg-gray-400">
                                        Like
                                    </button>
                                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                        Share
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <img
                                    src="https://via.placeholder.com/200"
                                    alt="Recipe"
                                    className="w-1/2 rounded-lg"
                                />
                                <p>
                                    This is a delicious recipe for Spaghetti Bolognese, perfect for a
                                    hearty dinner with family or friends. Learn how to make it step-by-step
                                    and enjoy a flavorful meal!
                                </p>
                            </div>
                        </div>

                        {/* Generate New Recipe Div */}
                        <div className="dark:bg-zinc-800 text-white rounded-lg shadow p-6 w-full lg:w-1/3 flex flex-col justify-between">
                            <h2 className="text-xl font-bold mb-4">Generate a New Recipe</h2>
                            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                Generate Recipe
                            </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="dark:bg-zinc-800 text-white rounded-lg shadow p-6 mt-6">
                        <h2 className="text-xl font-bold mb-4">Comments</h2>
                        <div className="space-y-4">
                            {/* Comment 1 */}
                            <CommentList />

                            {/* Comment 2 */}
                            <CommentList />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </ProtectedRoute>
    );
};

export default UserPage;
