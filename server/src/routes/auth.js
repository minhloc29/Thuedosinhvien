import { Router } from "express";
import prisma from "../prisma.js";
import { hashPassword, verifyPassword, signToken, publicUser, authRequired } from "../auth.js";

const router = Router();

// POST /auth/register  { name, studentId?, email, password }
router.post("/register", async (req, res) => {
  try {
    const { name, studentId, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, password are required" });
    }
    const exists = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const user = await prisma.user.create({
      data: {
        name: String(name),
        studentId: studentId ? String(studentId) : null,
        email: String(email).toLowerCase(),
        passwordHash: await hashPassword(String(password)),
      },
    });
    const token = signToken(user);
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /auth/login  { email, password } → { token }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await prisma.user.findUnique({ where: { email: String(email || "").toLowerCase() } });
    if (!user || !(await verifyPassword(String(password || ""), user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// GET /auth/me  (JWT)
router.get("/me", authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user: publicUser(user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
