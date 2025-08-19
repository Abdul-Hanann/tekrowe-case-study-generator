## Case Study Generator: 
A FastAPI-based backend API with React frontend that generates professional case studies for Tekrowe using the OpenAI API. **Ready for deployment on Render (backend) and Vercel (frontend).**

## 🏗️ Project Structure:
```
project-case-study/
├── 🐍 backend/                 # Backend API (Deploy to Render)
│   ├── main.py                 # FastAPI server
│   ├── run.py                  # Development server runner
│   ├── CaseStudy.py           # Original CLI script (legacy)
│   ├── requirements.txt        # Python dependencies
│   ├── env_template.txt        # Environment variables template
│   ├── render.yaml             # Render deployment configuration
│   └── start_backend.bat       # Local development startup
├── ⚛️ frontend/               # React frontend (Deploy to Vercel)
│   ├── src/                    # React source code
│   ├── public/                 # Static assets
│   ├── package.json            # Frontend dependencies
│   ├── vercel.json             # Vercel deployment configuration
│   ├── env_template.txt        # Environment variables template
│   └── start_frontend.bat      # Local development startup
├── 📖 README.md                # This file
├── 🚀 DEPLOYMENT_GUIDE.md      # Complete deployment instructions
└── 🎯 STARTUP_GUIDE.md         # Local development guide
```

## 🚀 Quick Start

### **Local Development:**
1. **Backend**: `cd backend && python run.py`
2. **Frontend**: `cd frontend && npm start`

### **Production Deployment:**
1. **Backend**: Deploy to Render using `DEPLOYMENT_GUIDE.md`
2. **Frontend**: Deploy to Vercel using `DEPLOYMENT_GUIDE.md`

## 🌐 Access Points

### **Local Development:**
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000

### **Production (After Deployment):**
- **Backend API**: `https://your-backend-name.onrender.com`
- **Frontend**: `https://your-app.vercel.app`

## 🎯 Features

- **🔹 Professional Case Studies**: AI-generated B2B case studies
- **📱 Responsive Design**: Works on all devices
- **🔄 Real-time Generation**: Live API calls to OpenAI
- **📊 Tabbed Interface**: View different sections separately
- **📋 Copy & Download**: Export generated content
- **🌍 Cloud Ready**: Deploy anywhere with environment variables

## 🔧 Technology Stack

### **Backend (FastAPI)**
- Python 3.10+
- FastAPI framework
- OpenAI API integration
- CORS configuration
- Environment variable support

### **Frontend (React)**
- React 18
- Modern CSS with responsive design
- Axios for API communication
- React Markdown for content rendering
- Environment variable support

## 📚 Documentation

- **🚀 DEPLOYMENT_GUIDE.md**: Complete deployment instructions
- **🎯 STARTUP_GUIDE.md**: Local development setup
- **📖 README.md**: This overview file

## 🔒 Environment Variables

### **Backend (.env)**
```bash
OPENAI_API_KEY=sk-your-api-key
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### **Frontend (.env.local)**
```bash
REACT_APP_API_URL=https://your-backend.onrender.com
```

## 🚀 Deployment

This project is configured for:
- **Backend**: Render (free tier) with `render.yaml`
- **Frontend**: Vercel (free tier) with `vercel.json`

See `DEPLOYMENT_GUIDE.md` for step-by-step instructions.

## 🎨 Customization

- **Backend prompts**: Edit system instructions in `backend/main.py`
- **Frontend styling**: Modify `frontend/src/App.css`
- **API endpoints**: Add new routes in `backend/main.py`
- **UI components**: Extend `frontend/src/App.js`

## 📱 Development Workflow

1. **Local development**: Use startup scripts in each directory
2. **Testing**: Both services auto-reload on changes
3. **Deployment**: Push to GitHub, auto-deploy on Render/Vercel
4. **Environment**: Separate configs for dev/production

---

**🎉 Ready to deploy!** Your case study generator is production-ready with cloud deployment configurations. 