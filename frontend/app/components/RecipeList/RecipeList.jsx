import './RecipeList.css'

const RecipeList = () => {
    return (
        <div id="recipe-list-container">
            <h2 id="recipe-list-title">Spaghetti Bolognese</h2>
            <div id="recipe-btn-group">
                <button className='recipe-btn' id="recipe-edit">Edit</button>
                <button className='recipe-btn' id="recipe-delete">Delete</button>
            </div>
            
        </div>
    )
}

export default RecipeList