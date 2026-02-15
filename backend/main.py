from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select, delete
from typing import List
from datetime import timedelta
from pydantic import BaseModel
from sqlalchemy.orm import joinedload

import httpx
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import from other modules
from database import create_db_and_tables, get_session
from models import Category, MenuItem, CategoryRead, User, DailyStat, Review
from auth import Token, authenticate_user, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

app = FastAPI(title="Modern Menu API")

# --- CORS Configuration ---
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://paeez96.vercel.app",  # Example Vercel domain
    "https://*.up.railway.app",    # Railway domains
    "*",                           # Allow all for now during setup (safer to restrict later)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- API Endpoints ---

class Token(BaseModel):
    access_token: str
    token_type: str

@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not authenticate_user(form_data.password, user.hashed_password): # Changed verify_password to authenticate_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/menu", response_model=List[CategoryRead])
def read_menu(session: Session = Depends(get_session)):
    # Use joinedload to fetch items with categories
    statement = select(Category).options(joinedload(Category.items))
    results = session.exec(statement)
    return results.unique().all()

# --- Protected Endpoints (Require Login) ---

@app.post("/api/categories")
def create_category(category: Category, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

@app.delete("/api/categories/{category_id}")
def delete_category(category_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    session.delete(category)
    session.commit()
    return {"ok": True}

@app.post("/api/items")
def create_menu_item(item: MenuItem, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@app.put("/api/items/{item_id}")
def update_menu_item(item_id: int, item_data: MenuItem, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(MenuItem, item_id)
    if not item:
         raise HTTPException(status_code=404, detail="Item not found")
    
    # Update fields
    item_data_dict = item_data.dict(exclude_unset=True)
    for key, value in item_data_dict.items():
        if key != "id": # Don't update ID
             setattr(item, key, value)
             
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@app.delete("/api/items/{item_id}")
def delete_menu_item(item_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    item = session.get(MenuItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    session.delete(item)
    session.commit()
    return {"ok": True}

# --- Stats Endpoints ---

@app.get("/api/stats")
def get_stats(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # 1. Total Counts
    total_items = session.exec(select(MenuItem)).all()
    total_categories = session.exec(select(Category)).all()
    
    # 2. Daily Stats (Last 7 days)
    # Since we can't easily query date ranges with string dates in sqlite efficiently without deeper logic,
    # we'll just fetch all or last 30 and filter in python for now (low scale)
    stats = session.exec(select(DailyStat)).all()
    # Sort by date
    stats = sorted(stats, key=lambda x: x.date)
    
    return {
        "total_items": len(total_items),
        "total_categories": len(total_categories),
        "daily_stats": stats
    }

@app.post("/api/track-visit")
def track_visit(session: Session = Depends(get_session)):
    from datetime import date
    today = date.today()
    
    stat = session.get(DailyStat, today)
    if not stat:
        stat = DailyStat(date=today, total_visits=1)
        session.add(stat)
    else:
        stat.total_visits += 1
        session.add(stat)
    
    session.commit()
    return {"ok": True}

@app.get("/")
def root():
    return {"status": "online", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
