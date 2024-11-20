const CommentList = () => {
    return (
        <div className="flex items-start gap-4">
            <img
                src="https://via.placeholder.com/50"
                alt="User"
                className="w-12 h-12 rounded-full"
            />
            <div>
                <h3 className="font-bold">John Doe</h3>
                <p>
                    This recipe looks amazing! Can't wait to try it out.
                </p>
            </div>
        </div>
    )
    
}

export default CommentList;