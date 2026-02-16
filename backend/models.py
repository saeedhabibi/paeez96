from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import date as dt_date

# --- Base Models ---
class MenuItemBase(SQLModel):
    name: str
    name_fa: Optional[str] = None
    description: Optional[str] = None
    description_fa: Optional[str] = None
    price: float
    rating: float = Field(default=0.0)
    calories: int = Field(default=0)
    time: str = Field(default="")
    ingredients_en: str = Field(default="") # Comma-separated
    ingredients_fa: str = Field(default="") # Comma-separated
    image_url: Optional[str] = None
    is_available: bool = Field(default=True)
    category_id: int = Field(foreign_key="category.id")

class CategoryBase(SQLModel):
    name: str
    name_fa: Optional[str] = None
    slug: str = Field(unique=True)

# --- Table Models ---
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str

class DailyStat(SQLModel, table=True):
    date: dt_date = Field(primary_key=True)
    total_visits: int = Field(default=0)
    total_orders: int = Field(default=0)
    total_revenue: float = Field(default=0.0)
    
class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    google_id: str = Field(index=True, unique=True)
    author_name: str
    rating: int
    text: str
    profile_photo_url: str
    relative_time_description: str
    time: int # Unix timestamp
    created_at: int = Field(default_factory=lambda: int(__import__("time").time()))
    total_revenue: float = Field(default=0.0)

class Category(CategoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # Exclude items from default repr to avoid recursion if printed
    items: List["MenuItem"] = Relationship(back_populates="category")

    def __repr__(self):
        return f"<Category(name={self.name}, id={self.id})>"

class MenuItem(MenuItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    category: Optional[Category] = Relationship(back_populates="items")

    def __repr__(self):
        return f"<MenuItem(name={self.name}, id={self.id})>"

# --- Read Models ---
# Explicitly independent models to avoid any Relationship() side effects
class MenuItemRead(SQLModel):
    id: int
    name: str
    name_fa: Optional[str] = None
    description: Optional[str] = None
    description_fa: Optional[str] = None
    price: float
    rating: float
    calories: int
    time: str
    ingredients_en: str
    ingredients_fa: str
    image_url: Optional[str] = None
    is_available: bool
    category_id: int

class CategoryRead(SQLModel):
    id: int
    name: str
    name_fa: Optional[str] = None
    slug: str
    items: List[MenuItemRead] = []