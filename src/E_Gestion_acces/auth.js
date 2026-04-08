import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await sql`
      SELECT * FROM users 
      WHERE email = ${decoded.email} 
      AND valid_until > NOW()
    `;
    return result.rows[0];
  } catch (error) {
    return null;
  }
};

export const loginUser = async (email) => {
  try {
    const result = await sql`
      SELECT * FROM users 
      WHERE email = ${email} 
      AND valid_until > NOW()
    `;
    
    if (result.rows[0]) {
      const token = jwt.sign(
        { email: result.rows[0].email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      return { token, user: result.rows[0] };
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const addUser = async (email, validUntil, isAdmin = false) => {
  try {
    const result = await sql`
      INSERT INTO users (email, valid_until, is_admin)
      VALUES (${email}, ${validUntil}, ${isAdmin})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Add user error:', error);
    throw error;
  }
};