import json
from fastapi import APIRouter, Request, Depends, Response
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from database import get_db
from models import User
import bcrypt

router = APIRouter()
templates = Jinja2Templates(directory="templates")

@router.get('/login', response_class=HTMLResponse)
async def login_get(request: Request):
    error = None
    return templates.TemplateResponse('login.html', {'request': request, 'error': error})

@router.post('/login')
async def login_post(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    email = form.get('email')
    password = form.get('password').encode('utf-8')
    user = db.query(User).filter_by(Email=email).first()
    if user and bcrypt.checkpw(password, user.Password.encode('utf-8')):
        request.session.clear()
        request.session['user_id'] = user.UserID
        # return RedirectResponse(url='/recipes', status_code=302)
        return Response(
            content=json.dumps({ "message": "Success" }),
            status_code=200,
            headers={
                "Content-Type": "application/json"
            }
        )
    else:
        # error = 'Invalid email or password.'
        # return templates.TemplateResponse('login.html', {'request': request, 'error': error})
        return Response(
            content=json.dumps({ "message": "Failed" }),
            status_code=404,
            headers={
                "Content-Type": "application/json"
            }
        )

@router.get('/logout')
async def logout(request: Request):
    request.session.pop('user_id', None)
    request.session.clear()
    return RedirectResponse(url='/login', status_code=302)