
export type Recipe = {
    RecipeID: string;
    RecipeName: string;
    RecipeContent: string;
    Visibility: boolean;
    UserGenerated: boolean;
    UserID: string;
};

export type Post = {
    SMID: string;
    Likes: number;
    Recipe: Recipe;
};

export type Comment = {
    CommentID: string;
    UserID: string;
    CommentText: string;
    UserName: string;
}

export type Bookmark = {
    BookmarkID: string;
    SMID: string;
    Recipe: Recipe;
}