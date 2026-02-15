from sqlmodel import create_engine, SQLModel, Session

sqlite_file_name = "restaurant_database_v3.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# echo=True باعث می‌شود دستورات SQL را در ترمینال ببینی (برای دیباگ عالی است)
engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session