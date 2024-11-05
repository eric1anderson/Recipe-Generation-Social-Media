import Navbar from "../../components/Navbar/Navbar"
import Footer from "../../components/Footer/Footer"
import RecipeList from "../../components/RecipeList/RecipeList"
import './AdminPage.css'

const AdminPage = () => {
    return (
        <div>
            <Navbar />
            <main>
                <div className="admin-container">
                    <h1 className="admin-main-title">Upload New Recipe</h1>
                    <form>
                        <label className="admin-form-element" htmlFor="recipe-title">Recipe Title</label>
                        <input className="admin-form-element" type="text" id="recipe-title" name="recipe-title" />
                        
                        <label className="admin-form-element" htmlFor="recipe-description">Recipe Description</label>
                        <textarea className="admin-form-element" type="text" id="recipe-description" name="recipe-description" />

                        <button className="admin-form-element" id="admin-upload-btn" type="submit">Upload Recipe</button>
                    </form>
                </div>

                <div className="admin-container">
                    <h1 className="admin-main-title">Manage Existing Recipes</h1>
                    <RecipeList />
                    <RecipeList />
                    <RecipeList />
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default AdminPage;