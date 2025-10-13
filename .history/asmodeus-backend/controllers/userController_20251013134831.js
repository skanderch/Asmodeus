import sql from 'mssql';
import { connectToDB } from '..';

export const registerUser = async (req, res) => {
  const { username, password_hash, full_name, email } = req.body;

  if (!username || !password_hash) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const pool = await connectToDB();

    // Default values
    const role_id = 4; // viewer role ID (adjust if different)
    const status = 'active';
    const module_id = null;

    const query = `
      INSERT INTO Users (username, password_hash, full_name, email, role_id, status, created_at, module_id)
      VALUES (@username, @password_hash, @full_name, @email, @role_id, @status, GETDATE(), @module_id)
    `;

    await pool.request()
      .input('username', sql.VarChar, username)
      .input('password_hash', sql.VarChar, password_hash)
      .input('full_name', sql.VarChar, full_name)
      .input('email', sql.VarChar, email)
      .input('role_id', sql.Int, role_id)
      .input('status', sql.VarChar, status)
      .input('module_id', sql.Int, module_id)
      .query(query);

    res.status(201).json({ message: "✅ User registered successfully as viewer." });

  } catch (error) {
    console.error("❌ Registration failed:", error);
    res.status(500).json({ message: "Error registering user.", error });
  }
};
