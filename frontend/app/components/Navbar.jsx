const Navbar = () => {
    return (
        <nav className="w-full flex flex-wrap bg-gray-800 justify-between sticky top-0 z-10">
            <div className="w-1/5 ml-6 my-4">
                <h1 className="text-xl font-bold text-white">Recipe App</h1>
            </div>
            <div className="flex items-center ml-auto mr-6">
                <ul className="flex list-none m-0 p-0">
                    <li className="mx-4 text-white hover:text-gray-300 cursor-pointer"><a>Upload Recipe</a></li>
                    <li className="mx-4 text-white hover:text-gray-300 cursor-pointer"><a>Recipes</a></li>
                    <li className="mx-4 text-white hover:text-gray-300 cursor-pointer"><a>Logout</a></li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
