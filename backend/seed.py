from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import Category, MenuItem, User, DailyStat
from auth import get_password_hash
from datetime import date, timedelta
import random

def seed_data():
    with Session(engine) as session:
        # 0. Check/Create Admin User
        admin_user = session.exec(select(User).where(User.username == "admin")).first()
        if not admin_user:
            print("Creating default admin user...")
            admin_user = User(username="admin", hashed_password=get_password_hash("admin123"))
            session.add(admin_user)
            session.commit()
            print("Admin user created: admin / admin123")

        # 1. Check if categories exist
        existing_cat = session.exec(select(Category)).first()
        if existing_cat:
            print("Categories already exist. Skipping category/item seed.")
        else:
            # ۲. تعریف دسته‌بندی‌ها
            cat_steaks = Category(name="Signature Steaks", name_fa="استیک‌های ویژه", slug="signature-steaks")
            cat_local = Category(name="Local Favorites", name_fa="غذاهای محلی", slug="local-favorites")
            cat_seafood = Category(name="Seafood", name_fa="دریایی", slug="seafood")

            session.add(cat_steaks)
            session.add(cat_local)
            session.add(cat_seafood)
            session.commit() # ذخیره برای گرفتن ID دسته‌بندی‌ها

            # ۳. تعریف آیتم‌های منو (مطابق FALLBACK_DATA فرانت‌اند)
            items = [
                # Signature Steaks
                MenuItem(
                    name="Ribeye Steak",
                    name_fa="استیک ریب‌آی",
                    description="Wet aged beef with roasted vegetables...",
                    description_fa="گوساله بیات شده با سبزیجات کبابی و سس ترافل مخصوص.",
                    price=1250000,
                    rating=4.9,
                    calories=850,
                    time="25-30",
                    ingredients_en="Ribeye Cut,Asparagus",
                    ingredients_fa="راسته گوساله,مارچوبه",
                    image_url="https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800&auto=format&fit=crop",
                    category_id=cat_steaks.id
                ),
                MenuItem(
                    name="T-Bone Special",
                    name_fa="تی‌بون مخصوص",
                    description="Charcoal grilled with mushroom sauce",
                    description_fa="گریل ذغالی با سس قارچ",
                    price=1400000,
                    rating=4.8,
                    calories=920,
                    time="30-35",
                    ingredients_en="T-Bone,Wild Mushrooms",
                    ingredients_fa="تی‌بون,قارچ جنگلی",
                    image_url="https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?q=80&w=800&auto=format&fit=crop",
                    category_id=cat_steaks.id
                ),
                # Local Favorites
                MenuItem(
                    name="Mirza Ghasemi",
                    name_fa="میرزا قاسمی",
                    description="Smoked eggplant, garlic, eggs",
                    description_fa="بادمجان دودی، سیر، تخم مرغ",
                    price=600000,
                    rating=5.0,
                    calories=420,
                    time="15-20",
                    ingredients_en="Eggplant,Garlic",
                    ingredients_fa="بادمجان,سیر",
                    image_url="https://images.unsplash.com/photo-1618449840665-9ed506d73a34?q=80&w=800&auto=format&fit=crop",
                    category_id=cat_local.id
                ),
                MenuItem(
                    name="Kebab Torsh",
                    name_fa="کباب ترش",
                    description="Beef marinated in pomegranate paste & walnuts",
                    description_fa="گوساله مزه‌دار شده با رب انار و گردو",
                    price=900000,
                    rating=4.7,
                    calories=650,
                    time="20-25",
                    ingredients_en="Beef Fillet,Walnuts",
                    ingredients_fa="فیله گوساله,گردو",
                    image_url="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop",
                    category_id=cat_local.id
                ),
                # Seafood
                MenuItem(
                    name="Grilled Salmon",
                    name_fa="سالمون کبابی",
                    description="With lemon butter sauce",
                    description_fa="با سس کره لیمو",
                    price=1100000,
                    rating=4.6,
                    calories=580,
                    time="20",
                    ingredients_en="Salmon Fillet,Lemon",
                    ingredients_fa="فیله سالمون,لیمو",
                    image_url="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop",
                    category_id=cat_seafood.id
                ),
            ]

            session.add_all(items)
            session.commit()
            
            # Add a special platter
            item_platter = MenuItem(
                name="Seafood Platter",
                name_fa="سینی دریایی",
                description="Lobster, shrimp, calamari, mussels",
                description_fa="لابستر، میگو، کالاماری، صدف",
                price=2800000,
                rating=4.9,
                calories=1200,
                time="40-45",
                ingredients_en="Lobster,Shrimp,Mussels",
                ingredients_fa="لابستر,میگو,صدف",
                image_url="https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=800&auto=format&fit=crop",
                category_id=cat_seafood.id
            )
            session.add(item_platter)
            session.commit()

            print("Successfully seeded categories and menu items!")

        # 4. Seed Daily Stats (Last 7 Days) - Check independently
        print("Checking daily stats...")
        today = date.today()
        # Check if we have stats for TODAY (or just checks generally if DB is empty of stats)
        # Better: Check if we have stats for the last 7 days.
        # Simplification: If no stats for Today, try to seed last 7 days (checking each).
        
        for i in range(7):
            day = today - timedelta(days=i)
            # Check if stat exists for this specific day
            stat = session.exec(select(DailyStat).where(DailyStat.date == day)).first()
            if not stat:
                print(f"Seeding stats for {day}...")
                daily_stat = DailyStat(
                    date=day,
                    total_visits=random.randint(50, 200),
                    total_orders=random.randint(10, 50),
                    total_revenue=random.randint(5000000, 25000000)
                )
                session.add(daily_stat)
            else:
                pass # Stat exists
        
        session.commit()
        print("Daily stats verification/seeding complete!")

if __name__ == "__main__":
    create_db_and_tables() # اطمینان از وجود جداول
    
    # --- Schema Migration for DailyStat (Direct Execution Fix) ---
    try:
        from database import engine
        from sqlmodel import Session, text
        with Session(engine) as session:
            # Add total_orders column if missing
            session.exec(text("ALTER TABLE dailystat ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0"))
            session.commit()
            print("Migration (seed.py): 'total_orders' column added/verified.")
    except Exception as e:
        print(f"Migration warning (seed.py): {e}")

    seed_data()
