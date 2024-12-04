import React from "react";

interface RecipePageListProps {
  recipeName: string;
  recipeContent: string;
  likes: number;
  onAddToShoppingList: () => void; // Function to handle adding to the shopping list
}

const RecipePageList: React.FC<RecipePageListProps> = ({
  recipeName,
  recipeContent,
  likes,
  onAddToShoppingList,
}) => {
  return (
    <div className="dark:bg-zinc-800 text-white rounded-lg shadow p-6 flex flex-col gap-4 relative">
      {/* Recipe Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{recipeName}</h2>
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
      <div className="text-gray-300">{recipeContent}</div>

      {/* Likes */}
      <div className="mt-2 text-gray-400">Likes: {likes}</div>

      {/* Add to Shopping List Button */}
      <button
        className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={onAddToShoppingList}
      >
        Add to Shopping List
      </button>
    </div>
  );
};

export default RecipePageList;
