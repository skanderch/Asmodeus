# Deployment Guide for Asmodeus Application

## Quick Deployment with Railway (Recommended)

### Step 1: Prepare Your Code
1. Push your code to GitHub
2. Make sure all environment variables are ready

### Step 2: Deploy Backend
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `asmodeus-backend` folder
6. Add these environment variables in Railway dashboard:

```
DB_USER=postgres
DB_PASS=railway_will_generate_this
DB_SERVER=railway_will_provide_this
DB_NAME=railway
PORT=5000
JWT_SECRET=your_production_jwt_secret_here
CSRF_SECRET=your_production_csrf_secret_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=Pykeripper0@gmail.com
SMTP_PASS=your_gmail_app_password_here
SMTP_FROM=Pykeripper0@gmail.com
FRONTEND_URL=https://your-frontend-url.railway.app
APP_BASE_URL=https://your-frontend-url.railway.app
```

### Step 3: Deploy Frontend
1. Create another Railway project
2. Deploy the `asmodeus` folder
3. Add environment variable:
```
VITE_API_URL=https://your-backend-url.railway.app
```

### Step 4: Update URLs
1. Copy your backend URL from Railway
2. Update `FRONTEND_URL` in backend environment variables
3. Update `VITE_API_URL` in frontend environment variables

## Alternative: Vercel + Railway

### Frontend on Vercel:
1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Set root directory to `asmodeus`
4. Add environment variable:
```
VITE_API_URL=https://your-backend-url.railway.app
```

### Backend on Railway:
Same as above, but use Railway for backend only.

## Testing Your Deployment:
1. Visit your frontend URL
2. Try registering a new user
3. Test login functionality
4. Test password reset (make sure SMTP is working)

## Important Notes:
- Always use environment variables for sensitive data
- Never commit `.env` files to GitHub
- Test thoroughly before sharing with users
- Consider using a custom domain for professional appearance
