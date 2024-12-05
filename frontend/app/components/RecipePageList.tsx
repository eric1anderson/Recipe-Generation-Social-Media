"use client";

import { Post } from "../types"
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { truncateContent } from "../utils/utils";

const RecipePageList = ({ post }: { post: Post }) => {
    const router = useRouter();
    const { SMID, Recipe } = post;
    const [likes, setLikes] = useState<number>(post.Likes);

    return (
        <div 
            className="dark:bg-zinc-800 text-white rounded-lg shadow p-6 flex flex-col gap-4 relative hover:cursor-pointer hover:bg-zinc-700 transition-colors duration-300"
            onClick={() => router.push(`/recipe/${post.SMID}`)}
        >
            {/* Recipe Header */}
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">{Recipe.RecipeName}</h2>
                <div className="space-x-4">
                    <div>
                        {likes} Likes
                    </div>
                </div>
            </div>
            {/* Recipe Content */}
            <div className="flex flex-col gap-6">
                <div className="flex gap-3">
                    <ReactMarkdown>
                        {truncateContent(Recipe.RecipeContent, 3)}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default RecipePageList;
