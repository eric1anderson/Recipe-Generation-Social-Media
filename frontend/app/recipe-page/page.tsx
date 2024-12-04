import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CommentList from "../components/CommentList";

const RecipePage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-black">
            <Navbar />
            <main className="flex-grow p-12">
                {/* Recipe Section */}
                <div className="dark:bg-zinc-800 text-white rounded-lg shadow flex flex-col gap-6 p-6">
                    {/* Recipe Image and Description */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        <img
                            src="https://via.placeholder.com/200"
                            alt="Recipe"
                            className="w-1/4 lg:w-1/4 rounded-lg object-cover max-h-84"
                        />
                        <div className="p-4">
                            <h1 className="text-lg font-bold mb-2">Spaghetti Bolognese</h1>
                            <p className="text-sm">
                                This is a delicious recipe for Spaghetti Bolognese, perfect for a
                                hearty dinner with family or friends. Learn how to make it step-by-step
                                and enjoy a flavorful meal!
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center px-4 pb-4">
                        <button className="bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-400 w-auto">
                            Like
                        </button>
                        <span className="text-sm">100 Likes</span>
                    </div>

                    {/* Comments Section */}
                    <div className="px-4 pb-4">
                        <h2 className="text-lg font-bold mb-2">Comments</h2>
                        <div className="space-y-2">
                            <CommentList />
                            <CommentList />
                        </div>

                        {/* Comment Input */}
                        <div className="mt-4">
                            <textarea
                                className="w-full p-3 rounded-lg bg-zinc-700 text-white"
                                placeholder="Add a comment..."
                                rows={4}
                            />
                            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mt-2 w-full lg:w-auto">
                                Post Comment
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default RecipePage;
