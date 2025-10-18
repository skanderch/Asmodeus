import sql from 'mssql';
import { connectToDB } from '../config/database.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../middleware/auth.js';
import { connectToDB as db } from '../config/database.js';

export const registerUser = async (req, res) => {
  const { username, password_hash, full_name, email } = req.body;

  if (!username || !password_hash || !email) {
    return res.status(400).json({ message: "Username, email and password are required." });
  }

  try {
    const pool = await connectToDB();

    // Vérifier si username ou email existent déjà
    const checkExisting = await pool.request()
      .input("username", sql.VarChar, username)
      .input("email", sql.VarChar, email)
      .query(`
        SELECT * FROM Users 
        WHERE username = @username OR email = @email
      `);

    if (checkExisting.recordset.length > 0) {
      const existing = checkExisting.recordset[0];
      const field = existing.username === username ? "username" : "email";
      return res.status(400).json({ message: `❌ This ${field} is already in use.` });
    }

    // Valeurs par défaut
    const role_id = 4;
    const status = "active";

    // Hash the incoming password before saving
    const hashedPassword = await bcrypt.hash(password_hash, 10);

    // Create user and get new ID
    const insertUser = await pool.request()
      .input("username", sql.VarChar, username)
      .input("password_hash", sql.VarChar, hashedPassword)
      .input("full_name", sql.VarChar, full_name)
      .input("email", sql.VarChar, email)
      .input("role_id", sql.Int, role_id)
      .input("status", sql.VarChar, status)
      .query(`
        INSERT INTO Users (username, password_hash, full_name, email, role_id, status, created_at)
        OUTPUT INSERTED.user_id AS user_id
        VALUES (@username, @password_hash, @full_name, @email, @role_id, @status, GETDATE())
      `);

    const newUserId = insertUser.recordset?.[0]?.user_id;

    // Ensure default module 'espace_candidat' exists
    let moduleId;
    const modCheck = await pool.request()
      .input('moduleName', sql.NVarChar, 'espace_candidat')
      .query(`SELECT module_id FROM Modules WHERE module_name = @moduleName`);
    if (modCheck.recordset.length === 0) {
      const modInsert = await pool.request()
        .input('moduleName', sql.NVarChar, 'espace_candidat')
        .input('description', sql.NVarChar, 'Espace Candidat')
        .input('routePrefix', sql.NVarChar, '/espace')
        .query(`
          INSERT INTO Modules (module_name, description, route_prefix)
          OUTPUT INSERTED.module_id AS module_id
          VALUES (@moduleName, @description, @routePrefix)
        `);
      moduleId = modInsert.recordset[0].module_id;
    } else {
      moduleId = modCheck.recordset[0].module_id;
    }

    // Assign default module to the new user
    if (newUserId && moduleId) {
      await pool.request()
        .input('userId', sql.Int, newUserId)
        .input('moduleId', sql.Int, moduleId)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM UserModules WHERE user_id = @userId AND module_id = @moduleId)
          INSERT INTO UserModules (user_id, module_id) VALUES (@userId, @moduleId)
        `);
    }

    res.status(201).json({ message: "✅ Account created successfully as viewer. Please login." });
  } catch (error) {
    console.error("❌ Registration failed:", error);
    res.status(500).json({ message: "Error registering user.", error });
  }
};
export const loginUser = async (req, res) => {
  const { username, password_hash } = req.body;

  if (!username || !password_hash) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const pool = await connectToDB();

    const result = await pool.request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM Users WHERE username = @username");

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Block login if user status is not active
    if (user.status && user.status !== 'active') {
      return res.status(403).json({ message: `Account is ${user.status}. Please contact support.` });
    }

    // Compare plaintext password with stored hash
    const isValid = await bcrypt.compare(password_hash, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const userData = {
      id: user.user_id,
      username: user.username,
      role_id: user.role_id,
      full_name: user.full_name,
      email: user.email,
    };

    const token = generateToken(userData);

    // Update last_login timestamp
    await pool.request()
      .input("userId", sql.Int, user.user_id)
      .query("UPDATE Users SET last_login = GETDATE() WHERE user_id = @userId");

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,        // Prevents XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',    // CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 24 hours (same as JWT expiration)
    });

    res.status(200).json({
      message: "✅ Login successful.",
      user: userData,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

export const getProfile = async (req, res) => {
  try {
    const pool = await connectToDB();
    
    const result = await pool.request()
      .input("userId", sql.Int, req.user.id)
      .query("SELECT user_id, username, full_name, email, role_id, status, created_at FROM Users WHERE user_id = @userId");
    
    const user = result.recordset[0];
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error getting profile." });
  }
};

// Current user's effective modules (role + user)
// (duplicate getCurrentUserModules removed)

export const getAllUsers = async (req, res) => {
  try {
    const pool = await connectToDB();
    
    const result = await pool.request()
      .query(`
        SELECT 
          u.user_id,
          u.username,
          u.full_name,
          u.email,
          u.role_id,
          u.status,
          u.created_at,
          u.last_login,
          r.role_name,
          mods.modules
        FROM Users u
        LEFT JOIN Roles r ON u.role_id = r.role_id
        OUTER APPLY (
          SELECT STRING_AGG(mod_name, ', ') AS modules FROM (
            SELECT DISTINCT m.module_name AS mod_name
            FROM RoleModules rm
            JOIN Modules m ON m.module_id = rm.module_id
            WHERE rm.role_id = u.role_id
            UNION
            SELECT DISTINCT m2.module_name AS mod_name
            FROM UserModules um
            JOIN Modules m2 ON m2.module_id = um.module_id
            WHERE um.user_id = u.user_id
          ) AS mm
        ) mods
        ORDER BY u.created_at DESC
      `);
    
    res.status(200).json({ users: result.recordset });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error getting users." });
  }
};

export const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;
  
  if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
    return res.status(400).json({ message: "Valid status required (active, inactive, suspended)." });
  }
  
  try {
    const pool = await connectToDB();
    
    await pool.request()
      .input("userId", sql.Int, userId)
      .input("status", sql.VarChar, status)
      .query("UPDATE Users SET status = @status WHERE user_id = @userId");
    
    res.status(200).json({ message: "User status updated successfully." });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error updating user." });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  
  try {
    const pool = await connectToDB();
    
    const result = await pool.request()
      .input("email", sql.VarChar, email)
      .query("SELECT user_id, username, email FROM Users WHERE email = @email");
    
    const user = result.recordset[0];
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        message: "If an account with that email exists, password reset instructions have been sent." 
      });
    }
    
    // In a real application, you would:
    // 1. Generate a secure reset token
    // 2. Store it in the database with expiration
    // 3. Send an email with the reset link
    
    // For now, we'll just return a success message
    res.status(200).json({ 
      message: "Password reset instructions have been sent to your email address." 
    });
    
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error processing password reset." });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Clear the httpOnly cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.status(200).json({ message: "✅ Logout successful." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout." });
  }
};

// ===== Admin CRUD for Users =====
export const createUserAdmin = async (req, res) => {
  const { username, password, full_name, email, role_id = 4, status = 'active' } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: "username, email and password are required." });
  }

  try {
    const pool = await connectToDB();

    const checkExisting = await pool.request()
      .input("username", sql.VarChar, username)
      .input("email", sql.VarChar, email)
      .query(`SELECT user_id FROM Users WHERE username = @username OR email = @email`);

    if (checkExisting.recordset.length > 0) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input("username", sql.VarChar, username)
      .input("password_hash", sql.VarChar, hashedPassword)
      .input("full_name", sql.VarChar, full_name)
      .input("email", sql.VarChar, email)
      .input("role_id", sql.Int, role_id)
      .input("status", sql.VarChar, status)
      .query(`
        INSERT INTO Users (username, password_hash, full_name, email, role_id, status, created_at)
        VALUES (@username, @password_hash, @full_name, @email, @role_id, @status, GETDATE())
      `);

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Admin create user error:", error);
    res.status(500).json({ message: "Server error creating user." });
  }
};

export const updateUserAdmin = async (req, res) => {
  const { userId } = req.params;
  const { full_name, email, role_id, status, password } = req.body;

  if (!userId) return res.status(400).json({ message: "userId is required" });

  let pool;
  try {
    pool = await connectToDB();

    // Optionally update password
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Build dynamic update query
    const sets = [];
    if (full_name !== undefined) sets.push("full_name = @full_name");
    if (email !== undefined) sets.push("email = @email");
    if (role_id !== undefined) sets.push("role_id = @role_id");
    if (status !== undefined) sets.push("status = @status");
    if (hashedPassword) sets.push("password_hash = @password_hash");

    if (sets.length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    const query = `UPDATE Users SET ${sets.join(", ")} WHERE user_id = @userId`;

    const reqDb = pool.request().input("userId", sql.Int, userId);
    if (full_name !== undefined) reqDb.input("full_name", sql.VarChar, full_name);
    if (email !== undefined) reqDb.input("email", sql.VarChar, email);
    if (role_id !== undefined) reqDb.input("role_id", sql.Int, role_id);
    if (status !== undefined) reqDb.input("status", sql.VarChar, status);
    if (hashedPassword) reqDb.input("password_hash", sql.VarChar, hashedPassword);

    await reqDb.query(query);

    // If role changed (or set) to Candidate (4), ensure and assign espace_candidat module
    if (role_id === 4) {
      try {
        console.log('Assigning espace_candidat module to user:', userId);
        
        // Ensure module exists
        let moduleId;
        const modCheck = await pool.request()
          .input('moduleName', sql.NVarChar, 'espace_candidat')
          .query(`SELECT module_id FROM Modules WHERE module_name = @moduleName`);
        
        if (modCheck.recordset.length === 0) {
          console.log('Creating espace_candidat module...');
          const modInsert = await pool.request()
            .input('moduleName', sql.NVarChar, 'espace_candidat')
            .input('description', sql.NVarChar, 'Espace Candidat')
            .input('routePrefix', sql.NVarChar, '/espace')
            .query(`
              INSERT INTO Modules (module_name, description, route_prefix)
              OUTPUT INSERTED.module_id AS module_id
              VALUES (@moduleName, @description, @routePrefix)
            `);
          moduleId = modInsert.recordset[0].module_id;
          console.log('Created module with ID:', moduleId);
        } else {
          moduleId = modCheck.recordset[0].module_id;
          console.log('Found existing module with ID:', moduleId);
        }

        // Assign to user if not already
        if (moduleId) {
          const assignResult = await pool.request()
            .input('userId', sql.Int, userId)
            .input('moduleId', sql.Int, moduleId)
            .query(`
              IF NOT EXISTS (SELECT 1 FROM UserModules WHERE user_id = @userId AND module_id = @moduleId)
              INSERT INTO UserModules (user_id, module_id) VALUES (@userId, @moduleId)
            `);
          console.log('Module assignment completed for user:', userId);
        }
      } catch (modErr) {
        // Non-fatal: log and continue
        console.error('Assign espace_candidat module error:', modErr);
        console.error('Error details:', modErr.message);
        console.error('Stack trace:', modErr.stack);
      }
    }

    res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Admin update user error:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ message: "Server error updating user." });
  }
};

export const deleteUserAdmin = async (req, res) => {
  const { userId } = req.params;

  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const pool = await connectToDB();
    await pool.request()
      .input("userId", sql.Int, userId)
      .query("DELETE FROM Users WHERE user_id = @userId");

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ message: "Server error deleting user." });
  }
};

// ===== Modules listing and assignment =====
export const listModules = async (_req, res) => {
  try {
    const pool = await connectToDB();
    const result = await pool.request().query(`SELECT module_id, module_name, description, route_prefix FROM Modules ORDER BY module_name`);
    res.status(200).json({ modules: result.recordset });
  } catch (error) {
    console.error('List modules error:', error);
    res.status(500).json({ message: 'Server error listing modules.' });
  }
};

export const getUserModules = async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT DISTINCT m.module_id, m.module_name, m.description, m.route_prefix
        FROM Modules m
        WHERE m.module_id IN (
          SELECT module_id FROM RoleModules rm JOIN Users u ON u.role_id = rm.role_id WHERE u.user_id = @userId
          UNION
          SELECT module_id FROM UserModules WHERE user_id = @userId
        )
        ORDER BY m.module_name
      `);
    res.status(200).json({ modules: result.recordset });
  } catch (error) {
    console.error('Get user modules error:', error);
    res.status(500).json({ message: 'Server error getting user modules.' });
  }
};

export const getCurrentUserModules = async (req, res) => {
  try {
    const pool = await connectToDB();
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .query(`
        SELECT DISTINCT m.module_id, m.module_name, m.description, m.route_prefix
        FROM Modules m
        WHERE m.module_id IN (
          SELECT module_id FROM RoleModules rm JOIN Users u ON u.role_id = rm.role_id WHERE u.user_id = @userId
          UNION
          SELECT module_id FROM UserModules WHERE user_id = @userId
        )
        ORDER BY m.module_name
      `);
    res.status(200).json({ modules: result.recordset });
  } catch (error) {
    console.error('Get current user modules error:', error);
    res.status(500).json({ message: 'Server error getting modules.' });
  }
};

export const setUserModules = async (req, res) => {
  const { userId } = req.params;
  const { moduleIds } = req.body; // array of module_id
  if (!Array.isArray(moduleIds)) {
    return res.status(400).json({ message: 'moduleIds must be an array.' });
  }
  let tx; // Declare tx here
  try {
    const pool = await connectToDB();
    tx = new sql.Transaction(pool); // Assign tx here
    await tx.begin();

    // Delete existing modules
    const deleteReq = new sql.Request(tx);
    await deleteReq.input('userId', sql.Int, userId).query('DELETE FROM UserModules WHERE user_id = @userId');

    // Insert new modules
    for (const mid of moduleIds) {
      const insertReq = new sql.Request(tx);
      await insertReq.input('userId', sql.Int, userId).input('moduleId', sql.Int, mid).query('INSERT INTO UserModules (user_id, module_id) VALUES (@userId, @moduleId)');
    }

    await tx.commit();
    res.status(200).json({ message: 'User modules updated.' });
  } catch (error) {
    console.error('Set user modules error:', error);
    try {
      if (tx) await tx.rollback(); // Rollback only if transaction was started
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    res.status(500).json({ message: 'Server error updating user modules.' });
  }
};

// Create gestion_offres module if it doesn't exist
export const createGestionOffresModule = async (req, res) => {
  try {
    const pool = await connectToDB();
    
    // Check if module exists
    const checkResult = await pool.request()
      .input('moduleName', sql.NVarChar, 'gestion_offres')
      .query(`SELECT module_id FROM Modules WHERE module_name = @moduleName`);
    
    if (checkResult.recordset.length > 0) {
      return res.status(200).json({ 
        message: 'Module already exists', 
        module_id: checkResult.recordset[0].module_id 
      });
    }
    
    // Create the module
    const result = await pool.request()
      .input('moduleName', sql.NVarChar, 'gestion_offres')
      .input('description', sql.NVarChar, 'Gestion des offres d\'emploi')
      .input('routePrefix', sql.NVarChar, '/offers')
      .query(`
        INSERT INTO Modules (module_name, description, route_prefix)
        OUTPUT INSERTED.module_id AS module_id
        VALUES (@moduleName, @description, @routePrefix)
      `);
    
    const moduleId = result.recordset[0].module_id;
    
    res.status(201).json({ 
      message: 'Module created successfully', 
      module_id: moduleId 
    });
  } catch (error) {
    console.error('Create gestion_offres module error:', error);
    res.status(500).json({ message: 'Server error creating module.' });
  }
};
