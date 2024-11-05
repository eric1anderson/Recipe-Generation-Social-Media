import './Navbar.css'

const Navbar = () => {
    return (
        <nav id="navbar">
            <div id="nav-left-container">
                <h1 id="nav-title">Recipe App</h1>
            </div>
            <div id="nav-right-container">
                <ul id='nav-list'>
                    <li className='nav-item'><a>Upload Recipe</a></li>
                    <li className='nav-item'><a>Recipes</a></li>
                    <li className='nav-item'><a>Logout</a></li>
                </ul>
            </div>
        </nav>
    )
}

export default Navbar