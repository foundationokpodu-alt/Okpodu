import express from "express";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "./src/db.js"; 
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev";

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// --- Auth Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const authorize = (roles: string[]) => (req: any, res: any, next: any) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

// --- API Routes ---

app.post("/api/auth/firebase-login", async (req, res) => {
  const { email } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  
  if (!user) {
    // If user doesn't exist but is a default admin, bootstrap them
    const isDefaultAdmin = email.toLowerCase() === "hogiugo@gmail.com" || 
                           email.toLowerCase() === "gigaactiv@gmail.com";
    if (isDefaultAdmin) {
      const id = uuidv4();
      const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      db.prepare("INSERT INTO users (id, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)")
        .run(id, email, hashedPassword, 'admin', 'Admin User');
      const newUser: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: "1d" });
      return res.json({ token, user: { id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.full_name } });
    }
    return res.status(401).json({ error: "User not found" });
  }

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name } });
});

// Auth
app.post("/api/auth/register", async (req, res) => {
  const { email, password, fullName, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const id = uuidv4();
  try {
    db.prepare("INSERT INTO users (id, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)")
      .run(id, email, hashedPassword, fullName, role || 'student');
    res.json({ message: "User registered successfully" });
  } catch (err: any) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name } });
});

// Governance
app.get("/api/governance/team", (req, res) => {
  const team = db.prepare("SELECT * FROM team_members WHERE is_active = 1 ORDER BY display_order ASC").all();
  res.json(team);
});

app.get("/api/governance/trustees", (req, res) => {
  const trustees = db.prepare("SELECT * FROM trustees WHERE is_active = 1 ORDER BY display_order ASC").all();
  res.json(trustees);
});

// Programs & Applications
app.post("/api/applications/student", authenticate, (req: any, res) => {
  const { ageTrack, bio } = req.body;
  const id = uuidv4();
  db.prepare("INSERT INTO students (id, user_id, age_track, bio) VALUES (?, ?, ?, ?)")
    .run(id, req.user.id, ageTrack, bio);
  res.json({ message: "Application submitted" });
});

// Admin Dashboard Data
app.get("/api/admin/stats", authenticate, authorize(['admin']), (req, res) => {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
  const studentApps = db.prepare("SELECT COUNT(*) as count FROM students WHERE application_status = 'pending'").get() as any;
  const totalDonations = db.prepare("SELECT SUM(amount) as total FROM donations WHERE status = 'success'").get() as any;
  
  res.json({
    totalUsers: userCount.count,
    pendingApplications: studentApps.count,
    totalDonations: totalDonations.total || 0
  });
});

app.get("/api/admin/donations", authenticate, authorize(['admin']), (req, res) => {
  const donations = db.prepare("SELECT * FROM donations ORDER BY created_at DESC").all();
  res.json(donations);
});

// Donations
app.post("/api/donations/initiate", async (req, res) => {
  const { donorName, donorEmail, amount, reference, userId, frequency } = req.body;
  const id = uuidv4();
  try {
    // In a production environment, you would typically fetch the actual plan code from Paystack
    // based on the frequency and amount. For now, we'll use a placeholder logic.
    // IMPORTANT: Users must create these plans in their Paystack dashboard and provide the real IDs.
    const plan = frequency !== 'one-time' ? `PLN_${frequency}_${amount}` : null;
    
    db.prepare("INSERT INTO donations (id, user_id, donor_name, donor_email, amount, payment_reference, status, frequency) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, userId || null, donorName, donorEmail, amount, reference, 'pending', frequency || 'one-time');
    
    res.json({ message: "Donation initiated", id, plan });
  } catch (err: any) {
    console.error("Donation initiation error:", err);
    res.status(500).json({ error: "Failed to initiate donation" });
  }
});

app.post("/api/donations/verify", async (req, res) => {
  const { reference } = req.body;
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  if (!PAYSTACK_SECRET_KEY) {
    console.warn("PAYSTACK_SECRET_KEY is not set. Skipping real verification for development.");
    // Fallback for development if key is missing
    db.prepare("UPDATE donations SET status = 'success' WHERE payment_reference = ?")
      .run(reference);
    return res.json({ message: "Donation updated (Development Mode - No verification)" });
  }

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    if (response.data.status && response.data.data.status === 'success') {
      db.prepare("UPDATE donations SET status = 'success' WHERE payment_reference = ?")
        .run(reference);
      res.json({ message: "Donation verified and updated", data: response.data.data });
    } else {
      res.status(400).json({ error: "Payment verification failed", details: response.data.message });
    }
  } catch (err: any) {
    console.error("Donation verification error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to verify donation with Paystack" });
  }
});

app.post("/api/donations/webhook", (req, res) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    return res.status(500).send("Secret key not configured");
  }

  // Verify signature
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update((req as any).rawBody).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.body;
  if (event.event === 'charge.success') {
    const reference = event.data.reference;
    try {
      db.prepare("UPDATE donations SET status = 'success' WHERE payment_reference = ?")
        .run(reference);
      console.log(`Donation ${reference} marked as success via webhook`);
    } catch (err) {
      console.error("Webhook update error:", err);
    }
  }

  res.status(200).send("Webhook received");
});

// File Upload
app.post("/api/upload/media", authenticate, authorize(['admin']), upload.single('file'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Serve static uploads
app.use("/uploads", express.static(uploadDir));

// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  // Bootstrap default admin
  const adminEmail = "gigaactiv@gmail.com";
  const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    db.prepare("INSERT INTO users (email, password, role, full_name) VALUES (?, ?, ?, ?)").run(
      adminEmail,
      hashedPassword,
      "admin",
      "Giga Activ Admin"
    );
    console.log(`Bootstrapped admin: ${adminEmail}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
