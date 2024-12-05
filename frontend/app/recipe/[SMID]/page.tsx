"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CommentList from "../../components/CommentList";
import Image from "next/image";
import { Post, Comment, Recipe } from "../../types"
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import likeIcon from "../../icons/like.svg";
import bookmarkIcon from "../../icons/bookmark.svg";

const API_BASE_URL = "http://127.0.0.1:5000";

const RecipePage = ({params}: {params: {SMID: string}}) => {
    const {SMID} = params;
    const [comments, setComments] = useState<Comment[]>([]);
    const [post, setPost] = useState<Post>();
    const [recipe, setRecipe] = useState<Recipe>();
    const [Likes, setLikes] = useState<number>(0);
    const [commentText, setCommentText] = useState<string>("");
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch(`${API_BASE_URL}/posts/${SMID}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setPost(data.post);
                    setRecipe(data.post.Recipe);
                    setLikes(data.post.Likes);
                    console.log(data);
                }
            } catch (err) {
                console.error("Failed to fetch comments:", err);
            }
        }
        const fetchComments = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch(`${API_BASE_URL}/comments/${SMID}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setComments(data.comments);
                    console.log(data);
                }

            }
            catch (err) {
                console.error("Failed to fetch comments:", err);
            }
        }
        fetchPost();
        fetchComments();
        
    }, [SMID]);
    
    const handlePostComment = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                alert("You need to log in to post a comment!");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/add_comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    smid: SMID,
                    comment_text: commentText,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result.message);

                // Clear the input and refresh the comments
                setCommentText("");
                const updatedComments = await fetch(`${API_BASE_URL}/comments/${SMID}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (updatedComments.ok) {
                    const data = await updatedComments.json();
                    setComments(data.comments);
                }
            } else {
                console.error("Failed to post comment:", response.statusText);
            }
        } catch (err) {
            console.error("Error posting comment:", err);
        }
    };

    const handleLike = async () => {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_BASE_URL}/like_post/${SMID}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            setLikes(data.Likes);
        }
    }

    const handleBookmark = async () => {

    }

    return (
        <div className="min-h-screen flex flex-col bg-black">
            <Navbar />
            <main className="flex-grow p-12">
                {/* Recipe Section */}
                <div className="dark:bg-zinc-800 text-white rounded-lg shadow flex flex-col gap-6 p-6">
                    <div className="flex flex-col lg:flex-row gap-6 relative">
                        <div className="p-4 flex-grow">
                            {recipe && (
                            <>
                                <h1 className="text-2xl font-bold mb-2">{recipe.RecipeName}</h1>
                                <ReactMarkdown className="mt-4">
                                {recipe.RecipeContent}
                                </ReactMarkdown>
                            </>
                            )}
                        </div>

                        {/* Buttons Section */}
                        <div className="flex flex-row space-x-4 absolute top-4 right-4">
                            <div className="w-8 h-8 cursor-pointer hover:opacity-80" onClick={handleLike}>
                                <Image
                                    src={likeIcon}
                                    alt="Like"
                                    width={32}
                                    height={32}
                                />
                            </div>

                            <div className="w-8 h-8 cursor-pointer hover:opacity-80" onClick={handleBookmark}>
                                <Image
                                    src={bookmarkIcon}
                                    alt="Bookmark"
                                    width={32}
                                    height={32}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center px-4 pb-4">
                        <span className="text-sm">{Likes} Likes</span>
                    </div>

                    {/* Comments Section */}
                    <div className="px-4 pb-4">
                        <h2 className="text-lg font-bold mb-2">Comments</h2>
                        <div className="space-y-2">
                            {comments.map((comment) => (
                                <CommentList key={comment.CommentID} comment={comment} />
                            ))}
                        </div>

                        {/* Comment Input */}
                        <div className="mt-4">
                            <textarea
                                className="w-full p-3 rounded-lg bg-zinc-700 text-white"
                                placeholder="Add a comment..."
                                rows={4}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button
                                onClick={handlePostComment}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mt-2 w-full lg:w-auto"
                            >
                                Post Comment
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default RecipePage;
