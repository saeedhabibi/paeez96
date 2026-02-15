from sqlmodel import Session, select, create_engine
from models import Category, MenuItem, CategoryRead
from sqlalchemy.orm import joinedload

# Use the new database file
sqlite_file_name = "restaurant_database_v2.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url)

def test_query():
    with Session(engine) as session:
        print("--- Testing Database Query ---")
        statement = select(Category).options(joinedload(Category.items))
        results = session.exec(statement).unique().all()
        # Test Serialization without printing
        print(f"Found {len(results)} categories. First: {results[0].name}")
        
        # Test Pydantic Serialization
        print("\n--- Testing Pydantic Serialization ---")
        from fastapi.encoders import jsonable_encoder
        try:
            # Manually convert to Read models first to mimic FastAPI response_model
            read_models = [CategoryRead.from_orm(c) for c in results]
            json_data = jsonable_encoder(read_models)
            print("Serialization Successful!")
            print(f"First item name_fa: {json_data[0]['name_fa']}")
        except Exception as e:
            print(f"Serialization Failed: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test_query()
