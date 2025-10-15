import sql from 'mssql';
import { connectToDB } from '../config/database.js';
import bcrypt from 'bcrypt';

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

    // Compare plaintext password with stored hash
    const isValid = await bcrypt.compare(password_hash, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    res.status(200).json({
      message: "✅ Login successful.",
      user: {
        id: user.user_id,
        username: user.username,
        role_id: user.role_id,
        full_name: user.full_name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};
