from models import Base
from database import engine

def initialize_database():
    Base.metadata.create_all(engine)
    print("Database initialized successfully.")

if __name__ == '__main__':
    initialize_database()