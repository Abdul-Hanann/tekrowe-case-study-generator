# 🚀 Deployment Guide: Vercel + Render

This guide will help you deploy your case study generator on:
- **Frontend**: Vercel (React)
- **Backend**: Render (FastAPI)

## 📋 Prerequisites

- GitHub repository with your code
- OpenAI API key
- Vercel account (free)
- Render account (free)

## 🐍 Backend Deployment (Render)

### 1. Prepare Backend for Render

Your backend is already configured with:
- ✅ `render.yaml` - Render configuration
- ✅ Environment variable support
- ✅ Production-ready CORS settings

### 2. Deploy to Render

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `tekrowe-case-study-api`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

5. **Set Environment Variables:**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `ENVIRONMENT`: `production`
   - `ALLOWED_ORIGINS`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

6. **Click "Create Web Service"**

### 3. Get Your Backend URL

After deployment, you'll get a URL like:
```
https://tekrowe-case-study-api.onrender.com
```

## ⚛️ Frontend Deployment (Vercel)

### 1. Prepare Frontend for Vercel

Your frontend is already configured with:
- ✅ `vercel.json` - Vercel configuration
- ✅ Environment variable support
- ✅ Production-ready API calls

### 2. Deploy to Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project:**
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. **Set Environment Variables:**
   - `REACT_APP_API_URL`: Your Render backend URL (e.g., `https://tekrowe-case-study-api.onrender.com`)

6. **Click "Deploy"**

### 3. Get Your Frontend URL

After deployment, you'll get a URL like:
```
https://your-app.vercel.app
```

## 🔄 Update CORS Settings

After getting both URLs, update your backend CORS:

1. **Go back to Render dashboard**
2. **Edit your web service**
3. **Update Environment Variables:**
   - `ALLOWED_ORIGINS`: `https://your-app.vercel.app,http://localhost:3000`
4. **Redeploy** (Render will auto-redeploy)

## 🧪 Test Your Deployment

### 1. Test Backend
Visit: `https://your-backend-name.onrender.com/health`

### 2. Test Frontend
Visit: `https://your-app.vercel.app`

### 3. Test Full Flow
- Enter client name and project details
- Generate a case study
- Verify it works end-to-end

## 🔧 Troubleshooting

### Backend Issues (Render)

**Cold Start Delays:**
- Free tier has cold starts (15-30 seconds)
- Consider upgrading to paid plan for production

**Environment Variables:**
- Ensure `OPENAI_API_KEY` is set correctly
- Check `ALLOWED_ORIGINS` includes your Vercel domain

**Build Failures:**
- Check `requirements.txt` is in backend folder
- Verify Python version compatibility

### Frontend Issues (Vercel)

**API Connection Errors:**
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

**Build Failures:**
- Check all dependencies are in `package.json`
- Verify Node.js version compatibility

## 📱 Custom Domain (Optional)

### Vercel Custom Domain
1. Go to your Vercel project
2. Settings → Domains
3. Add your custom domain
4. Update DNS records

### Render Custom Domain
1. Go to your Render service
2. Settings → Custom Domains
3. Add your custom domain
4. Update DNS records

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use Render's secure environment variable storage
- Rotate API keys regularly

### CORS Configuration
- Only allow necessary origins
- Remove localhost from production CORS
- Consider implementing rate limiting

## 📊 Monitoring

### Render Monitoring
- Built-in logs and metrics
- Health check endpoint: `/health`
- Monitor response times and errors

### Vercel Monitoring
- Built-in analytics
- Performance insights
- Error tracking

## 🚀 Production Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] API endpoints tested
- [ ] Full user flow tested
- [ ] Custom domain configured (if needed)
- [ ] Monitoring set up
- [ ] Error handling verified

---

**🎉 Congratulations!** Your case study generator is now deployed and accessible worldwide!

## 🔗 Quick Links

- **Backend Health**: `https://your-backend.onrender.com/health`
- **API Docs**: `https://your-backend.onrender.com/docs`
- **Frontend**: `https://your-app.vercel.app`
