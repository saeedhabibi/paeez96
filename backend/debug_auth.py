from sqlmodel import Session, select
from database import engine
from models import User
from auth import verify_password

def check_admin():
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == "admin")).first()
        if not user:
            print("User 'admin' NOT FOUND")
            return

        print(f"User found: {user.username}")
        print(f"Hashed Password in DB: {user.hashed_password}")
        
        is_valid = verify_password("admin123", user.hashed_password)
        print(f"Password 'admin123' valid? {is_valid}")

if __name__ == "__main__":
    check_admin()
