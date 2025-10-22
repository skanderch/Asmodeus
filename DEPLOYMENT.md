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
