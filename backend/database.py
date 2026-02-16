from sqlmodel import create_engine, SQLModel, Session
import os

# Production (PostgreSQL) vs Development (SQLite)
database_url = os.getenv("DATABASE_URL")

if database_url:
    # Railway provides 'postgres://', but SQLAlchemy needs 'postgresql://'
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    connect_args = {}
else:
    sqlite_file_name = "restaurant_database_v3.db"
    database_url = f"sqlite:///{sqlite_file_name}"
    connect_args = {"check_same_thread": False}

# echo=True only for dev/sqlite usually, but keeping it simple
engine = create_engine(database_url, echo=True, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session