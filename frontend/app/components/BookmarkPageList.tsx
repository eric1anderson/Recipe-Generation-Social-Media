"use client";

import { Bookmark } from "../types"
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { truncateContent } from "../utils/utils";

const BookmarkPageList = ({ bookmark }: { bookmark: Bookmark }) => {
    const router = useRouter();
    const {SMID, Recipe, BookmarkID} = bookmark;

    return (
        <div 
            className="dark:bg-zinc-800 text-white rounded-lg shadow p-6 flex flex-col gap-4 relative hover:cursor-pointer hover:bg-zinc-700 transition-colors duration-300 m-6"
            onClick={() => router.push(`/recipe/${SMID}`)}
        >
            {/* Recipe Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{Recipe.RecipeName}</h2>
            </div>
            {/* Recipe Content */}
            <div className="flex flex-col gap-6">
                <div className="flex gap-6">
                    <ReactMarkdown className="mt-2">
                        {truncateContent(Recipe.RecipeContent, 3)}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default BookmarkPageList;
