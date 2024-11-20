import React from "react";

interface RecipeListProps {
    id: string; // Unique identifier for the recipe
    title: string; // Title of the recipe
    onDelete: (id: string) => void; // Function to handle delete action
}

const RecipeList: React.FC<RecipeListProps> = ({ id, title, onDelete }) => {
    return (
        <div className="flex flex-wrap bg-black m-4 p-4 rounded-xl">
            <h2 className="text-white text-lg font-semibold">{title}</h2>
            <div className="ml-auto">
                <button className="bg-white text-black mx-2 py-1 px-3 rounded-full w-20 hover:bg-gray-200">
                    Edit
                </button>
                <button
                    className="bg-white text-black mx-2 py-1 px-3 rounded-full w-20 hover:bg-gray-200"
                    onClick={() => onDelete(id)} // Call the onDelete function with the recipe ID
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default RecipeList;
