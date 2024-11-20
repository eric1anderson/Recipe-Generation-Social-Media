const Footer = () => {
    return (
        <div className="w-full dark:bg-zinc-800 flex justify-between items-start p-6">
            {/* Left Section */}
            <div className="flex flex-col w-1/5 space-y-2">
                <h3 className="text-base font-bold text-white">Explore</h3>
                <span className="text-gray-300">Latest Recipes</span>
                <span className="text-gray-300">Popular Recipes</span>
            </div>

            {/* Right Section */}
            <div className="flex flex-col w-1/4 space-y-2 items-end">
                <h3 className="text-base font-bold text-white">Contact with Us</h3>
                <div className="flex justify-end space-x-4 w-full">
                    {/* Instagram */}
                    <a
                        href="#"
                        className="fa fa-instagram text-white text-3xl hover:text-gray-400"
                    ></a>

                    {/* Facebook */}
                    <a
                        href="#"
                        className="fa fa-facebook text-white text-3xl hover:text-gray-400"
                    ></a>

                    {/* Twitter */}
                    <a
                        href="#"
                        className="fa fa-twitter text-white text-3xl hover:text-gray-400"
                    ></a>
                </div>
            </div>
        </div>
    );
};

export default Footer;
