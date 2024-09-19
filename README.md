# Project for 520

## Frontend
- Nextjs
- Tailwind

## Backend
- FastAPI

### Initial Setup
```bash
git clone https://github.com/ibizabroker/520-project.git


# frontend
cd frontend
npm install
npm run dev # should run on port 3000


# backend
cd ../backend # if in root folder: cd backend
pip install virtualenv
virtualenv venv
# activate the environment
.\venv\Scripts\activate # windows
source venv/bin/activate # mac

pip install -r requirements.txt
python3 main.py # should run on port 5000
```