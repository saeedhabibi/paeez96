from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import Category, MenuItem, User
from auth import get_password_hash

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

        # 1. Check if database has data
        existing_cat = session.exec(select(Category)).first()
        if existing_cat:
            print("Database already has data. Skipping seed.")
            return

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
        print("Successfully seeded 3 categories and 5 menu items!")

if __name__ == "__main__":
    create_db_and_tables() # اطمینان از وجود جداول
    seed_data()
