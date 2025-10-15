import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-key';

export const generateCSRFToken = (req, res, next) => {
  // Generate a random CSRF token
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const csrfToken = crypto.createHmac('sha256', CSRF_SECRET)
    .update(randomBytes)
    .digest('hex');
  
  // Store it in a httpOnly cookie
  res.cookie('csrf-token', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  // Also send it in response for frontend to use
  res.locals.csrfToken = csrfToken;
  next();
};

export const verifyCSRFToken = (req, res, next) => {
  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];
  
  if (!cookieToken || !headerToken) {
    return res.status(403).json({ message: 'CSRF token missing' });
  }
  
  // Verify the CSRF token using the secret
  try {
    const expectedToken = crypto.createHmac('sha256', CSRF_SECRET)
      .update(headerToken)
      .digest('hex');
    
    if (cookieToken !== expectedToken) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
  } catch (error) {
    return res.status(403).json({ message: 'CSRF token verification failed' });
  }
  
  next();
};
