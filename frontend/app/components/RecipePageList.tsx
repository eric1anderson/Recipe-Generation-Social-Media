const RecipePageList = () => {
    return (
        <div className="dark:bg-zinc-800 text-white rounded-lg shadow p-6 flex flex-col gap-4">
            {/* Recipe Header */}
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
            {/* Recipe Content */}
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
    );
};

export default RecipePageList;
