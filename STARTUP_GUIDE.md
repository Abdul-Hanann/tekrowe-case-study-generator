# 🚀 Quick Startup Guide

## Prerequisites Check
Make sure you have:
- ✅ Python 3.10+ installed
- ✅ Node.js 16+ installed
- ✅ OpenAI API key ready

## 🐍 Backend Setup (FastAPI)

### 1. Create Environment File
Copy `backend/env_template.txt` to `backend/.env` and add your API key:
```bash
# Copy this line to backend/.env file
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 2. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Start FastAPI Backend
```bash
# Option 1: Using the startup script (recommended)
start_backend.bat

# Option 2: From backend directory
cd backend
python run.py

# Option 3: Direct command
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Verify Backend is Running
- 🌐 API: http://localhost:8000
- 📖 Swagger Docs: http://localhost:8000/docs
- 🔍 ReDoc: http://localhost:8000/redoc
- 🏥 Health Check: http://localhost:8000/health

## ⚛️ Frontend Setup (React)

### 1. Install Node Dependencies
```bash
cd frontend
npm install
```

### 2. Start React Development Server
```bash
# Option 1: Using the startup script (recommended)
start_frontend.bat

# Option 2: From the frontend directory
cd frontend
npm start
```

### 3. Verify Frontend is Running
- 🌐 React App: http://localhost:3000
- 🔄 Auto-reload on code changes

## 🎯 Test the Complete System

### 1. Backend Test
Visit http://localhost:8000/health to verify API is working

### 2. Frontend Test
- Open http://localhost:3000
- Enter a client name and project details
- Click "Generate Full Case Study"
- Watch the AI generate your case study!

## 🔧 Troubleshooting

### Backend Issues
- **Port 8000 in use**: Change port in `backend/run.py` or kill existing process
- **API key error**: Check `backend/.env` file exists and has correct format
- **Import errors**: Ensure all dependencies installed with `cd backend && pip install -r requirements.txt`

### Frontend Issues
- **Port 3000 in use**: React will automatically suggest another port
- **Build errors**: Clear `node_modules` and run `npm install` again
- **API connection**: Ensure backend is running on port 8000

### Common Commands
```bash
# Kill processes on specific ports (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill processes on specific ports (macOS/Linux)
lsof -ti:8000 | xargs kill -9

# Restart backend
start_backend.bat

# Restart frontend
start_frontend.bat
```

## 📱 Development Workflow

1. **Backend changes**: Save `backend/main.py` → auto-reloads
2. **Frontend changes**: Save React files → auto-reloads
3. **API testing**: Use Swagger UI at http://localhost:8000/docs
4. **Frontend testing**: Browser auto-refreshes on save

## 🎨 Customization

- **Backend prompts**: Edit system instructions in `backend/main.py`
- **Frontend styling**: Modify `frontend/src/App.css`
- **API endpoints**: Add new routes in `backend/main.py`
- **UI components**: Extend `frontend/src/App.js`

## 🚀 Production Deployment

- **Backend**: Use `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000` (no --reload)
- **Frontend**: Run `cd frontend && npm run build` and serve the `build` folder
- **Environment**: Set production environment variables in `backend/.env`
- **CORS**: Update allowed origins in `backend/main.py`

---

**Happy coding! 🎉**
Your FastAPI + React case study generator is ready to use!
