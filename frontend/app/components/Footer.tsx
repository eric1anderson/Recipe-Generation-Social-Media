const Footer = () => {
    const BASE_URL = "http://localhost:3000";
    return (
    <footer className= "w-full dark:bg-zinc-800 text-white py-8">
      <div className="container mx-auto px-6 lg:px-20 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left Section */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-2xl font-bold">Recipe App</h2>
          <p className="mt-2 text-sm text-gray-400">
            Explore Latest & Popular Recipes
          </p>
          <p className="mt-2 text-sm text-gray-400">
            CS520-Group 9
          </p>
        </div>

        {/* Center Section - Links */}
        <nav className="flex flex-wrap justify-center space-x-6">
          <a
            href={`${BASE_URL}/upload-recipe`}
            className="text-gray-400 hover:text-white text-sm transition cursor-pointer"
          >
            Upload Recipe
          </a>
          <a
            href={`${BASE_URL}/bookmarks`}
            className="text-gray-400 hover:text-white text-sm transition cursor-pointer"
          >
            Bookmarks
          </a>
          <a
            href={`${BASE_URL}/shoppinglist-page`}
            className="text-gray-400 hover:text-white text-sm transition cursor-pointer"
          >
            Shopping List
          </a>
          <a
            href={`${BASE_URL}/user-profile`}
            className="text-gray-400 hover:text-white text-sm transition cursor-pointer"
          >
            Profile
          </a>
        </nav>

        {/* Right Section - Social Links */}
        <div className="flex space-x-4">
            {/* GitHub Icon */}
            <a
                href="https://github.com/ibizabroker/520-project/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
            >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="currentColor"
                >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.6.113.793-.258.793-.577v-2.176c-3.338.725-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.419-1.304.763-1.604-2.665-.304-5.466-1.334-5.466-5.93 0-1.31.469-2.381 1.235-3.221-.123-.304-.536-1.527.117-3.176 0 0 1.008-.322 3.3 1.23a11.45 11.45 0 013.003-.404c1.02.005 2.046.138 3.003.404 2.291-1.553 3.3-1.23 3.3-1.23.653 1.649.24 2.872.117 3.176.767.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.625-5.479 5.92.43.37.814 1.102.814 2.22v3.293c0 .32.193.694.801.576C20.565 22.092 24 17.593 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
            </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
