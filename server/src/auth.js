import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me-in-prod";

export const hashPassword = (plain) => bcrypt.hash(plain, 10);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

// Public shape of a user, safe to return to the client.
export const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  studentId: u.studentId,
  email: u.email,
  isAdmin: u.isAdmin,
  createdAt: u.createdAt,
});

export const signToken = (user) =>
  jwt.sign({ sub: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "7d" });

// authRequired: decode Authorization Bearer token and attach req.user.
// Uses a tiny promise wrapper for Express 4.
export const authRequired = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    req.isAdmin = !!payload.isAdmin;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const adminRequired = (req, res, next) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Requires admin" });
  next();
};
