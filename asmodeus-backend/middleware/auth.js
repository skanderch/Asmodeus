import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role_id: user.role_id 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (req, res, next) => {
  // Try to get token from httpOnly cookie first, then from Authorization header
  const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role_id !== 1) { // Assuming role_id 1 is admin
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Require that the authenticated user has access to a module name (in addition to role checks)
export const requireModule = (moduleName) => {
  return async (req, res, next) => {
    try {
      // Admins are not restrained by modules
      if (req.user && req.user.role_id === 1) {
        return next();
      }
      const { connectToDB } = await import('../config/database.js');
      const { default: sql } = await import('mssql');
      const pool = await connectToDB();
      const result = await pool.request()
        .input('userId', sql.Int, req.user.id)
        .input('moduleName', sql.NVarChar, moduleName)
        .query(`
          SELECT 1 FROM Modules m WHERE m.module_name = @moduleName AND m.module_id IN (
            SELECT module_id FROM RoleModules rm JOIN Users u ON u.role_id = rm.role_id WHERE u.user_id = @userId
            UNION
            SELECT module_id FROM UserModules WHERE user_id = @userId
          )`);
      if (result.recordset.length === 0) {
        return res.status(403).json({ message: 'Access denied. Missing module permission.' });
      }
      next();
    } catch (e) {
      return res.status(500).json({ message: 'Error checking module permission.' });
    }
  };
};