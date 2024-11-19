How to run: 

from the backend directory:
- create and start new venv
- install requirements.txt
- python init_db.py (to set up the db)
- python test_data.py (to add a couple users)
- uvicorn shoppinglist:app --reload --port 5000 --log-level info   (to start the website)
- in your browser, navigate to localhost:5000/login (to use the app. Use credentials in the test_data.py)
