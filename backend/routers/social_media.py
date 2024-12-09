# social_media.py

from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import json
from models import (
    User,
    Recipe,
    SocialMedia,
    Bookmark,
    Comment,
    Ingredient,
    Allergy
)
from database import get_db
from routers.auth import get_current_user 

router = APIRouter()
templates = Jinja2Templates(directory="templates")

# def get_current_user(request: Request, db: Session):
#     if 'user_id' not in request.session:
#         raise HTTPException(status_code=401, detail="Unauthorized")
#     user = db.query(User).filter(User.UserID == request.session['user_id']).first()
#     if not user:
#         raise HTTPException(status_code=401, detail="Unauthorized")
#     return user

# Define Pydantic models for request bodies
class RecipeIDRequest(BaseModel):
    recipe_id: str

class SMIDRequest(BaseModel):
    smid: str

class CommentRequest(BaseModel):
    smid: str
    comment_text: str

@router.post("/add_post")
def add_post_on_social_media(
    request_body: RecipeIDRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    recipe_id = request_body.recipe_id
    recipe = db.query(Recipe).filter(Recipe.RecipeID == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if recipe.UserID != user.UserID:
        raise HTTPException(status_code=403, detail="Permission denied")
    recipe.Visibility = True

    # Create a SocialMedia entry if it doesn't exist
    social_media_entry = db.query(SocialMedia).filter(SocialMedia.RecipeID == recipe_id).first()
    if not social_media_entry:
        social_media_entry = SocialMedia(RecipeID=recipe_id, UserID=user.UserID)
        db.add(social_media_entry)

    db.commit()
    return Response(
    content=json.dumps({
        "message": "Recipe visibility updated to public and added to social media",
        "SMID": social_media_entry.SMID
    }),
    status_code=200,
    headers={"Content-Type": "application/json"}
)

    # return {
    #     "message": "Recipe visibility updated to public and added to social media",
    #     "SMID": social_media_entry.SMID
    # }



def serialize_recipe(recipe):
    """Helper function to serialize a Recipe object"""
    return {
        "RecipeID": recipe.RecipeID,
        "RecipeName": recipe.RecipeName,
        "RecipeContent": recipe.RecipeContent,
        "Visibility": recipe.Visibility,
        "UserGenerated": recipe.UserGenerated,
        "Cuisine": recipe.Cuisine,
        "UserID": recipe.UserID
    }

@router.get("/posts")
def fetch_posts(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Fetch all public recipes with social media data in one query
    social_media_posts = (
        db.query(SocialMedia)
        .options(joinedload(SocialMedia.recipe))  # Preload associated Recipe
        .all()
    )

    # Prepare the response
    posts = []
    for post in social_media_posts:
        ingredients = db.query(Ingredient).filter(Ingredient.RecipeID == post.RecipeID).all()
        ingredient_names = [ingredient.IngredientName for ingredient in ingredients]
        # get recipe based on recipeID
        recipe = db.query(Recipe).filter(Recipe.RecipeID == post.RecipeID).first()
        allergens = db.query(Allergy).filter(Allergy.UserID == user.UserID).all()
        allergen_names = [allergy.IngredientName for allergy in allergens]

        allergen_found = False
        for ingredient in ingredient_names:
            if ingredient in allergen_names:
                allergen_found = True
                break
        if not allergen_found:
            if not recipe:
                continue
            posts.append({
                "SMID": post.SMID,
                "Likes": post.Likes,
                "Recipe": serialize_recipe(recipe) if recipe else ""
            })

    return Response(
        content=json.dumps({"posts": posts}),
        status_code=200,
        headers={"Content-Type": "application/json"}
    )

@router.get("/posts/{smid}")
def fetch_post(smid: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    social_media_post = (
        db.query(SocialMedia)
        .options(joinedload(SocialMedia.recipe))  
        .filter(SocialMedia.SMID == smid)
        .first()
    )
    if not social_media_post:
        raise HTTPException(status_code=404, detail="Post not found on social media")
    social_media_post = {
        "SMID": social_media_post.SMID,
        "Likes": social_media_post.Likes,
        "Recipe": serialize_recipe(social_media_post.recipe) if social_media_post.recipe else None
    }
    return Response(
        content=json.dumps({"post": social_media_post}),
        status_code=200,
        headers={"Content-Type": "application/json"}
    )

    # return posts


@router.post("/like_post/{smid}")
def like_post(
    smid: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    social_media_entry = db.query(SocialMedia).filter(SocialMedia.SMID == smid).first()
    if not social_media_entry:
        raise HTTPException(status_code=404, detail="Post not found on social media")
    social_media_entry.Likes += 1
    db.commit()
    return Response(
    content=json.dumps({"message": "Post liked successfully", "Likes": social_media_entry.Likes}),
    status_code=200,
    headers={"Content-Type": "application/json"}
    )

    # return {"message": "Post liked successfully"}

@router.post("/unlike_post")
def unlike_post(
    request_body: SMIDRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    smid = request_body.smid
    social_media_entry = db.query(SocialMedia).filter(SocialMedia.SMID == smid).first()
    if not social_media_entry:
        raise HTTPException(status_code=404, detail="Post not found on social media")
    if social_media_entry.Likes > 0:
        social_media_entry.Likes -= 1
        db.commit()
        # return {"message": "Post unliked successfully"}
        return Response(
            content=json.dumps({"message": "Post unliked successfully"}),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )

    else:
        return Response(
            content=json.dumps({"message": "Cannot unlike, likes count is already zero"}),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )

        # return {"message": "Cannot unlike, likes count is already zero"}


@router.post("/add_bookmark")
def add_bookmark(
    request_body: RecipeIDRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    recipe_id = request_body.recipe_id
    new_bookmark = Bookmark(UserID=user.UserID, RecipeID=recipe_id)
    check_bookmark = db.query(Bookmark).filter(Bookmark.UserID == user.UserID, Bookmark.RecipeID == recipe_id).first()
    if check_bookmark:
        return Response(
            content=json.dumps({"message": "Bookmark already exists"}),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )

        # return {"message": "Bookmark already exists"}
    db.add(new_bookmark)
    db.commit()
    return Response(
        content=json.dumps({"message": "Bookmark added successfully"}),
        status_code=200,
        headers={"Content-Type": "application/json"}
    )

    # return {"message": "Bookmark added successfully"}

@router.get("/bookmarks")
def fetch_bookmarks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    bookmarks = db.query(Bookmark).filter(Bookmark.UserID == user.UserID).options(joinedload(Bookmark.recipe)).all()
    recipes = []
    bookmark_list = []
    for bookmark in bookmarks:
        if bookmark.recipe:
            recipe = bookmark.recipe
            smid = db.query(SocialMedia.SMID).filter(SocialMedia.RecipeID == recipe.RecipeID).first()
            if smid:   
                bookmark_list.append({
                    "BookmarkID": bookmark.BookmarkID,
                    "SMID": smid[0],
                    "Recipe": serialize_recipe(recipe)
                })
    return Response(
        content=json.dumps({"bookmarks": bookmark_list}),
        status_code=200,
        headers={"Content-Type": "application/json"}
    )

    # return recipes

@router.post("/add_comment")
def add_comment(
    request_body: CommentRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    smid = request_body.smid
    comment_text = request_body.comment_text
    new_comment = Comment(
        SMID=smid,
        UserID=user.UserID,
        CommentText=comment_text
    )
    db.add(new_comment)
    db.commit()
    return Response(
        content=json.dumps({"message": "Comment added successfully"}),
        status_code=200,
        headers={"Content-Type": "application/json"}
    )
    # return {"message": "Comment added successfully"}

@router.get("/comments/{smid}")
def fetch_comments(smid: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    comments = db.query(Comment).filter(Comment.SMID == smid).all()
    comments_with_user_info = []
    for comment in comments:
        commenter = db.query(User).filter(User.UserID == comment.UserID).first()
        comments_with_user_info.append({
            "CommentID": comment.CommentID,
            "CommentText": comment.CommentText,
            "UserID": commenter.UserID,
            "UserName": commenter.Name,
        })
    return Response(
        content=json.dumps({"comments": comments_with_user_info}),
        status_code=200,
        headers={"Content-Type": "application/json"}
    )
    # return comments_with_user_info
