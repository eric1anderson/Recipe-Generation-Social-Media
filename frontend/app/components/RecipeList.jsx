const RecipeList = () => {
    return (
        <div className="flex flex-wrap bg-black m-4 p-4 rounded-xl">
            <h2 className="text-white text-lg font-semibold">Spaghetti Bolognese</h2>
            <div className="ml-auto">
                <button className="bg-white text-black mx-2 py-1 px-3 rounded-full w-20 hover:bg-gray-200">
                    Edit
                </button>
                <button className="bg-white text-black mx-2 py-1 px-3 rounded-full w-20 hover:bg-gray-200">
                    Delete
                </button>
            </div>
        </div>
    );
};

export default RecipeList;
