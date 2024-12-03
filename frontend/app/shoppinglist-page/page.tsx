import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ShoppingListCard from "../components/ShoppingListCard";

const ShoppingListPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-black">
            <Navbar />
            <main className="flex-grow p-12">
                {/* Recipe Section */}
                <ShoppingListCard />
                <ShoppingListCard />
            </main>
            <Footer />
        </div>
    );
};

export default ShoppingListPage;
