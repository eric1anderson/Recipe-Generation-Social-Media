import {Comment } from "../types";

const CommentList = ({comment}: {comment: Comment} ) => {
    return (
        <div className="flex items-start gap-4">
            <img
                src="https://via.placeholder.com/50"
                alt="User"
                className="w-12 h-12 rounded-full"
            />
            <div>
                <h3 className="font-bold">{comment.UserName}</h3>
                <p>
                    {comment.CommentText}
                </p>
            </div>
        </div>
    )
    
}

export default CommentList;