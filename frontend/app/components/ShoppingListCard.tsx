const ShoppingListCard = () => {
    return (
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
                        A delicious recipe for Spaghetti Bolognese, perfect for a hearty dinner with family or friends.
                        Learn how to make it step-by-step and enjoy a flavorful meal!
                    </p>
                </div>
            </div>

            {/* Ingredients Section */}
            <div className="px-4 pb-4">
                <h2 className="text-lg font-bold mb-2">Shopping List</h2>
                <div className="space-y-4">
                    {/* Ingredient 1 */}
                    <div className="flex items-center space-x-4">
                        <input
                            type="checkbox"
                            id="ingredient-1"
                            className="h-5 w-5 text-green-600 focus:ring-0"
                        />
                        <label htmlFor="ingredient-1" className="text-sm">
                            1 lb Spaghetti
                        </label>
                    </div>

                    {/* Ingredient 2 */}
                    <div className="flex items-center space-x-4">
                        <input
                            type="checkbox"
                            id="ingredient-2"
                            className="h-5 w-5 text-green-600 focus:ring-0"
                        />
                        <label htmlFor="ingredient-2" className="text-sm">
                            1 lb Ground Beef
                        </label>
                    </div>

                    {/* Ingredient 3 */}
                    <div className="flex items-center space-x-4">
                        <input
                            type="checkbox"
                            id="ingredient-3"
                            className="h-5 w-5 text-green-600 focus:ring-0"
                        />
                        <label htmlFor="ingredient-3" className="text-sm">
                            2 cups Tomato Sauce
                        </label>
                    </div>

                    {/* Ingredient 4 */}
                    <div className="flex items-center space-x-4">
                        <input
                            type="checkbox"
                            id="ingredient-4"
                            className="h-5 w-5 text-green-600 focus:ring-0"
                        />
                        <label htmlFor="ingredient-4" className="text-sm">
                            1 Onion, chopped
                        </label>
                    </div>

                    {/* Ingredient 5 */}
                    <div className="flex items-center space-x-4">
                        <input
                            type="checkbox"
                            id="ingredient-5"
                            className="h-5 w-5 text-green-600 focus:ring-0"
                        />
                        <label htmlFor="ingredient-5" className="text-sm">
                            2 cloves Garlic, minced
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShoppingListCard;