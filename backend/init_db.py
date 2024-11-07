from sqlalchemy import create_engine
from models import Base

def initialize_database():
    engine = create_engine('sqlite:///mydatabase.db')
    Base.metadata.create_all(engine)
    print("Database initialized successfully.")

if __name__ == '__main__':
    initialize_database()